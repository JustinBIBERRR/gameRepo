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
            :show-remaining-attempts="false"
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
            <!-- 播放控制 -->
            <div class="flex flex-wrap items-center gap-4">
              <audio ref="audioEl" :src="playbackAudioUrl ?? undefined" controls class="max-w-full" />
              <button
                v-if="playbackAudioUrl"
                @click="handlePlay"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {{ t('game.listenSongPlay') }}
              </button>
              <button
                v-if="playbackAudioUrl && targetSong"
                @click="handleReplay"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                {{ t('game.listenSongReplay') }}
              </button>
              <p v-if="targetSong && !playbackAudioUrl" class="text-amber-600">{{ t('game.listenSongNoPlaybackAudio') }}</p>
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

          <!-- 揭晓：仅展示歌词与歌手 -->
          <Transition name="fade">
            <div v-if="gameOver || gameWon" class="text-center py-8">
              <div class="text-6xl mb-4">{{ gameWon ? '🎉' : '😢' }}</div>
              <h2 class="text-3xl font-bold mb-2" :class="gameWon ? 'text-green-600' : 'text-red-600'">
                {{ gameWon ? t('game.congrats') : t('game.tryAgain') }}
              </h2>
              <p class="text-gray-600 mb-2">
                答案是 <span class="font-bold text-blue-600">{{ targetSong?.answer }}</span>
              </p>
              <p v-if="targetSong?.artist" class="text-gray-600 mb-4">歌手：<span class="font-medium">{{ targetSong.artist }}</span></p>
              <div v-if="targetSong?.lyrics" class="text-left max-w-xl mx-auto mb-6 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700">{{ targetSong.lyrics }}</div>
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

const audioEl = ref<HTMLAudioElement | null>(null)
const songs = ref<ListenSongItem[]>([])
const targetSong = ref<ListenSongItem | null>(null)
const inputValue = ref('')
const attempts = ref(0)
const gameOver = ref(false)
const gameWon = ref(false)
const visibleHints = ref<string[]>([])
const playbackAudioUrl = ref<string | null>(null)

const config = getGameConfig('listenSong')
const maxAttempts = config.maxAttempts
const enableTimer = config.enableTimer
const timerDuration = config.timerDuration * 60

const hasSongs = computed(() => songs.value.length > 0)
const canSubmit = computed(() => inputValue.value.trim().length > 0)

const showRestoreTip = ref(false)
const restoreTipMessage = ref('')

function stopPlayback() {
  audioEl.value?.pause()
}

function handleTimerTimeout() {
  gameOver.value = true
  gameWon.value = false
  stopPlayback()
  doReveal()
}

const timer = useTimer(enableTimer ? timerDuration : 0, 'listenSong', handleTimerTimeout)

function handlePlay() {
  audioEl.value?.play()
}

function handleReplay() {
  if (audioEl.value) {
    audioEl.value.currentTime = 0
    audioEl.value.play()
  }
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
    stopPlayback()
    updateGameStats('listenSong', true, attempts.value)
    doReveal()
  } else if (attempts.value >= maxAttempts) {
    gameOver.value = true
    gameWon.value = false
    stopPlayback()
    updateGameStats('listenSong', false, attempts.value)
    doReveal()
  }
}

function handleReveal() {
  gameOver.value = true
  gameWon.value = false
  stopPlayback()
  if (attempts.value > 0) {
    updateGameStats('listenSong', false, attempts.value)
  }
  doReveal()
}

function doReveal() {
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

async function setPlaybackAudio(song: ListenSongItem) {
  if (playbackAudioUrl.value) {
    URL.revokeObjectURL(playbackAudioUrl.value)
    playbackAudioUrl.value = null
  }
  try {
    const { audioBlob } = await getSongWithAudio(song.id)
    if (audioBlob) {
      playbackAudioUrl.value = URL.createObjectURL(audioBlob)
    }
  } catch {
    playbackAudioUrl.value = null
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
  if (picked) {
    setPlaybackAudio(picked)
  } else if (playbackAudioUrl.value) {
    URL.revokeObjectURL(playbackAudioUrl.value)
    playbackAudioUrl.value = null
  }
  if (enableTimer) timer.reset(timerDuration)
  if (enableTimer) timer.start()
  persistState()
}

function restartGame() {
  if (playbackAudioUrl.value) {
    URL.revokeObjectURL(playbackAudioUrl.value)
    playbackAudioUrl.value = null
  }
  clearTimerState()
  sessionStorage.removeItem(SESSION_KEY)
  startNewRound()
}

function clearAndRestart() {
  stopPlayback()
  if (playbackAudioUrl.value) URL.revokeObjectURL(playbackAudioUrl.value)
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
  } else {
    await setPlaybackAudio(targetSong.value)
  }
})

onUnmounted(() => {
  stopPlayback()
  if (playbackAudioUrl.value) URL.revokeObjectURL(playbackAudioUrl.value)
})
</script>
