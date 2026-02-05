/**
 * 基于 SpeechSynthesisUtterance 的朗读组合式函数
 */

export interface SpeechOptions {
  text: string
  lang?: string
  rate?: number
  pitch?: number
  voice?: SpeechSynthesisVoice
}

export function useSpeechReader() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const isSpeaking = ref(false)
  const voices = ref<SpeechSynthesisVoice[]>([])

  function normalizeVoiceLang(lang?: string): string {
    if (!lang || lang === 'default') return 'zh-CN'
    if (lang === 'yue') return 'zh-HK'
    if (lang === 'zh') return 'zh-CN'
    return lang
  }

  function loadVoices() {
    if (!isSupported) return
    const v = window.speechSynthesis.getVoices()
    voices.value = v
    return v
  }

  onMounted(() => {
    if (!isSupported) return
    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  })

  function findVoice(lang: string): SpeechSynthesisVoice | undefined {
    const list = voices.value.length ? voices.value : loadVoices() ?? []
    const normalized = normalizeVoiceLang(lang)
    let preferred = list.find((v) => v.lang === normalized)
    if (!preferred && normalized === 'zh-HK') {
      const lower = (s: string) => s.toLowerCase()
      preferred =
        list.find((v) => lower(v.lang).includes('yue')) ||
        list.find((v) => lower(v.name).includes('cantonese')) ||
        list.find((v) => v.name.includes('粤语'))
    }
    if (!preferred) {
      preferred = list.find((v) => v.lang.startsWith(normalized))
    }
    if (!preferred) {
      const base = normalized.split('-')[0]
      preferred = list.find((v) => v.lang.split('-')[0] === base)
    }
    return preferred ?? list.find((v) => v.lang.startsWith('zh')) ?? list[0]
  }

  function play(options: SpeechOptions): void {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    const text = (options.text || '').trim().slice(0, 200)
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = Math.max(0.5, Math.min(2, options.rate ?? 1))
    utterance.pitch = Math.max(0.5, Math.min(2, options.pitch ?? 1))
    const rawLang = options.lang && options.lang !== 'default' ? options.lang : 'zh-CN'
    const lang = normalizeVoiceLang(rawLang)
    utterance.lang = lang
    if (options.voice) {
      utterance.voice = options.voice
    } else {
      const voice = findVoice(lang)
      if (voice) utterance.voice = voice
    }
    utterance.onstart = () => {
      isSpeaking.value = true
    }
    utterance.onend = utterance.onerror = () => {
      isSpeaking.value = false
    }
    window.speechSynthesis.speak(utterance)
  }

  function stop(): void {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    isSpeaking.value = false
  }

  return {
    isSupported,
    isSpeaking,
    voices,
    loadVoices,
    play,
    stop,
    findVoice
  }
}
