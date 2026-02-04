<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <template v-if="!hasSongs">
          <div class="text-center py-12">
            <p class="text-lg text-gray-600 mb-4">{{ t('game.listenSongNoData') }}</p>
            <p class="text-gray-500 mb-6">{{ t('game.listenSongNoDataMessage') }}</p>
            <router-link
              to="/settings/listen-song"
              class="inline-flex px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {{ t('game.goToSettings') }}
            </router-link>
          </div>
        </template>

        <template v-else>
          <GameHeader
            :title="t('games.listenSong.title')"
            :description="t('game.listenSongDescPrefix')"
            :description-suffix="t('game.attemptsSuffix')"
            :attempts="attempts"
            :max-attempts="maxAttempts"
            :game-over="gameOver"
            :game-won="gameWon"
            :enable-timer="enableTimer"
            :formatted-time="timer.formattedTime.value"
            :is-warning="timer.isWarning.value"
            :show-restore-tip="showRestoreTip"
            :restore-tip-message="restoreTipMessage"
            :show-initial-hint="false"
            @clear="clearAndRestart"
          />

          <div v-if="!gameOver && !gameWon" class="space-y-6">
            <!-- 朗读控制 -->
            <div class="flex flex-wrap items-center gap-4">
              <button
                v-if="speechReader.isSupported"
                @click="handlePlaySpeech"
                :disabled="speechReader.isSpeaking.value"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium flex items-center gap-2"
              >
                <svg v-if="speechReader.isSpeaking.value" class="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                {{ speechReader.isSpeaking.value ? '朗读中...' : t('game.listenSongPlay') }}
              </button>
              <button
                v-if="speechReader.isSupported && targetSong"
                @click="handleReplaySpeech"
                :disabled="speechReader.isSpeaking.value"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                {{ t('game.listenSongReplay') }}
              </button>
              <p v-if="!speechReader.isSupported" class="text-amber-600">{{ t('game.listenSongNotSupported') }}</p>
            </div>

            <!-- 提示 -->
            <div v-if="targetSong && targetSong.hints && targetSong.hints.length" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="font-semibold text-blue-900 mb-2">💡 提示</div>
              <div class="space-y-1">
                <div v-for="(h, i) in visibleHints" :key="i" class="text-blue-800">{{ h }}</div>
              </div>
              <button
                v-if="visibleHints.length < (targetSong.hints?.length ?? 0)"
                @click="revealNextHint"
                class="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                更多提示
              </button>
            </div>

            <!-- 猜测输入 -->
            <div>
              <input
                v-model="inputValue"
                type="text"
                :placeholder="t('game.listenSongPlaceholder')"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                @keyup.enter="handleGuess"
              />
              <div class="mt-4 flex gap-2">
                <button
                  @click="handleGuess"
                  :disabled="!canSubmit"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                >
                  提交猜测
                </button>
                <button
                  @click="handleReveal"
                  class="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  {{ t('game.listenSongReveal') }}
                </button>
              </div>
            </div>
          </div>

          <!-- 揭晓：成功或失败 -->
          <Transition name="fade">
            <div v-if="gameOver || gameWon" class="text-center py-8">
              <div class="text-6xl mb-4">{{ gameWon ? '🎉' : '😢' }}</div>
              <h2 class="text-3xl font-bold mb-2" :class="gameWon ? 'text-green-600' : 'text-red-600'">
                {{ gameWon ? t('game.congrats') : t('game.tryAgain') }}
              </h2>
              <p class="text-gray-600 mb-4">
                答案是 <span class="font-bold text-blue-600">{{ targetSong?.answer }}</span>
              </p>
              <!-- 揭晓音频 -->
              <div v-if="audioUrl" class="mb-6">
                <audio :src="audioUrl" controls class="mx-auto max-w-md" />
              </div>
              <p v-else-if="targetSong" class="text-gray-500 mb-4">{{ t('game.listenSongNoAudio') }}</p>
              <button
                @click="restartGame"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {{ t('game.playAgain') }}
              </button>
            </div>
          </Transition>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navigation from '../components/Navigation.vue'
import GameHeader from '../components/GameHeader.vue'
import { useSpeechReader } from '../composables/useSpeechReader'
import { useTimer } from '../composables/useTimer'
import {
  getSongsForGame,
  pickRandomSong,
  checkAnswer
} from '../utils/listenSongUtils'
import { getSongWithAudio } from '../utils/listenSongStorage'
import {
  getGameConfig,
  saveGameState,
  loadGameState,
  updateGameStats,
  loadTimerState,
  clearTimerState
} from '../utils/storageUtils'
import type { ListenSongItem } from '../utils/listenSongStorage'

const SESSION_KEY = 'listenSongGuessGame'

const { t } = useI18n()
const speechReader = useSpeechReader()

const songs = ref<ListenSongItem[]>([])
const targetSong = ref<ListenSongItem | null>(null)
const inputValue = ref('')
const attempts = ref(0)
const gameOver = ref(false)
const gameWon = ref(false)
const visibleHints = ref<string[]>([])
const audioUrl = ref<string | null>(null)

const config = getGameConfig('listenSong')
const maxAttempts = config.maxAttempts
const enableTimer = config.enableTimer
const timerDuration = config.timerDuration * 60

const hasSongs = computed(() => songs.value.length > 0)
const canSubmit = computed(() => inputValue.value.trim().length > 0)

const showRestoreTip = ref(false)
const restoreTipMessage = ref('')

function handleTimerTimeout() {
  gameOver.value = true
  gameWon.value = false
  speechReader.stop()
  doReveal()
}

const timer = useTimer(enableTimer ? timerDuration : 0, 'listenSong', handleTimerTimeout)

function handlePlaySpeech() {
  if (!targetSong.value) return
  speechReader.stop()
  speechReader.play({
    text: targetSong.value.lyrics,
    lang: targetSong.value.lang && targetSong.value.lang !== 'default' ? targetSong.value.lang : 'zh-CN',
    rate: (targetSong.value.rate && targetSong.value.rate > 0) ? targetSong.value.rate : 1,
    pitch: (targetSong.value.pitch && targetSong.value.pitch > 0) ? targetSong.value.pitch : 1
  })
}

function handleReplaySpeech() {
  handlePlaySpeech()
}

function revealNextHint() {
  if (!targetSong.value?.hints) return
  const next = targetSong.value.hints[visibleHints.value.length]
  if (next) visibleHints.value.push(next)
}

function handleGuess() {
  if (!canSubmit.value || !targetSong.value) return
  attempts.value++
  const ok = checkAnswer(inputValue.value.trim(), targetSong.value.answer)
  if (ok) {
    gameWon.value = true
    gameOver.value = true
    speechReader.stop()
    updateGameStats('listenSong', true, attempts.value)
    doReveal()
  } else if (attempts.value >= maxAttempts) {
    gameOver.value = true
    gameWon.value = false
    speechReader.stop()
    updateGameStats('listenSong', false, attempts.value)
    doReveal()
  }
}

function handleReveal() {
  gameOver.value = true
  gameWon.value = false
  speechReader.stop()
  if (attempts.value > 0) {
    updateGameStats('listenSong', false, attempts.value)
  }
  doReveal()
}

async function doReveal() {
  if (!targetSong.value) return
  try {
    const { audioBlob } = await getSongWithAudio(targetSong.value.id)
    if (audioBlob) {
      audioUrl.value = URL.createObjectURL(audioBlob)
    }
  } catch {
    audioUrl.value = null
  }
  persistState()
}

function persistState() {
  saveGameState(SESSION_KEY, {
    songId: targetSong.value?.id,
    attempts: attempts.value,
    gameOver: gameOver.value,
    gameWon: gameWon.value,
    visibleHints: visibleHints.value
  })
}

function restoreState() {
  const saved = loadGameState<{
    songId: string
    attempts: number
    gameOver: boolean
    gameWon: boolean
    visibleHints: string[]
  } | null>(SESSION_KEY, null)
  if (!saved || !saved.songId) return
  const song = songs.value.find((s) => s.id === saved!.songId)
  if (!song) return
  targetSong.value = song
  attempts.value = saved.attempts
  gameOver.value = saved.gameOver
  gameWon.value = saved.gameWon
  visibleHints.value = saved.visibleHints ?? []
  if (saved.gameOver || saved.gameWon) {
    doReveal()
  } else if (enableTimer) {
    const ts = loadTimerState()
    if (ts?.gameType === 'listenSong' && ts.isRunning) {
      showRestoreTip.value = true
      restoreTipMessage.value = '检测到未完成的游戏，倒计时已恢复'
    } else {
      timer.start()
    }
  }
}

function startNewRound() {
  const picked = pickRandomSong(songs.value)
  targetSong.value = picked
  inputValue.value = ''
  attempts.value = 0
  gameOver.value = false
  gameWon.value = false
  visibleHints.value = picked?.hints?.[0] ? [picked.hints[0]] : []
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioUrl.value = null
  if (enableTimer) timer.reset(timerDuration)
  if (enableTimer) timer.start()
  persistState()
}

function restartGame() {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = null
  }
  clearTimerState()
  sessionStorage.removeItem(SESSION_KEY)
  startNewRound()
}

function clearAndRestart() {
  speechReader.stop()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  clearTimerState()
  sessionStorage.removeItem(SESSION_KEY)
  startNewRound()
}

onMounted(async () => {
  songs.value = await getSongsForGame()
  if (songs.value.length === 0) return
  restoreState()
  if (!targetSong.value) {
    startNewRound()
  }
})

onUnmounted(() => {
  speechReader.stop()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
})
</script>
