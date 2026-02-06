<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <!-- 无题目 -->
        <template v-if="items.length === 0">
          <div class="text-center py-12">
            <p class="text-lg text-gray-600 mb-4">{{ t('game.imageMemeNoData') }}</p>
            <router-link
              to="/settings/image-meme"
              class="inline-flex px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {{ t('game.goToSettings') }}
            </router-link>
          </div>
        </template>

        <template v-else>
          <!-- 页头：标题 + 重置记忆 -->
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('games.imageMeme.title') }}</h1>
              <p class="text-gray-600">
                {{ t('game.imageMemeDescPrefix') }}
                <span v-if="items.length === 1" class="text-amber-600">{{ t('game.imageMemeOnlyOne') }}</span>
              </p>
            </div>
            <button
              type="button"
              @click="resetMemory"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg self-start sm:self-auto"
            >
              {{ t('game.imageMemeResetMemory') }}
            </button>
          </div>

          <!-- 倒计时（可选） -->
          <div v-if="enableTimer && !gameOver && !gameWon" class="mb-4">
            <GameTimer
              :formatted-time="timer.formattedTime.value"
              :is-warning="timer.isWarning.value"
            />
          </div>

          <!-- 加载中 -->
          <div v-if="currentItem && !gameImageUrl && !imageError" class="flex flex-col items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
            <p class="text-gray-600">{{ t('game.imageMemeLoading') }}</p>
          </div>

          <!-- 暂无可用题目（全部加载失败） -->
          <div v-else-if="noAvailableItems" class="text-center py-12">
            <p class="text-gray-600 mb-4">{{ t('game.imageMemeNoAvailable') }}</p>
            <button
              type="button"
              @click="resetMemory"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {{ t('game.imageMemeResetMemory') }}
            </button>
          </div>

          <!-- 游戏区域 -->
          <template v-else-if="currentItem && (gameImageUrl || imageError)">
            <div v-if="!gameOver && !gameWon" class="space-y-6">
              <div class="flex justify-center">
                <img
                  v-if="gameImageUrl"
                  :src="gameImageUrl"
                  alt=""
                  class="max-w-full max-h-[70vh] object-contain rounded-lg"
                  @error="onImageError"
                />
              </div>

              <div>
                <input
                  v-model="inputValue"
                  type="text"
                  :placeholder="t('game.imageMemePlaceholder')"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  autocomplete="off"
                  @keyup.enter="handleGuess"
                />
                <p v-if="showInputError" class="mt-2 text-sm text-red-600">{{ t('game.imageMemeWrong') }}</p>
                <button
                  type="button"
                  @click="handleGuess"
                  :disabled="!inputValue?.trim()"
                  class="mt-4 w-full md:w-auto px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {{ t('game.submitGuess') }}
                </button>
              </div>
            </div>

            <!-- 猜对 / 次数用尽 -->
            <Transition name="fade">
              <div v-if="gameOver || gameWon" class="text-center py-8">
                <div class="text-6xl mb-4">{{ gameWon ? '🎉' : '😢' }}</div>
                <h2 class="text-2xl font-bold mb-2" :class="gameWon ? 'text-green-600' : 'text-amber-600'">
                  {{ gameWon ? t('game.imageMemeCorrect') : t('game.imageMemeOutOfAttempts') }}
                </h2>
                <p class="text-gray-600 mb-4">
                  {{ t('game.answerIs') }} <span class="font-bold text-blue-600">{{ currentItem?.answer }}</span>
                </p>
                <p v-if="items.length === 1" class="text-sm text-amber-600 mb-4">{{ t('game.imageMemeOnlyOne') }}</p>
                <button
                  type="button"
                  @click="nextRound"
                  class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {{ t('game.playAgain') }}
                </button>
              </div>
            </Transition>
          </template>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navigation from '../components/Navigation.vue'
import GameTimer from '../components/GameTimer.vue'
import { useTimer } from '../composables/useTimer'
import { getImageMemeItems, matchImageMemeAnswer, pickRandomUnusedItem } from '../utils/imageMemeUtils'
import { getGameConfig, updateGameStats } from '../utils/storageUtils'
import type { ImageMemeItem } from '../schemas/imageMemeSchema'

const { t } = useI18n()

const items = computed(() => getImageMemeItems())
const config = getGameConfig('imageMeme')
const enableTimer = config.enableTimer
const maxAttempts = config.maxAttempts
const limitAttempts = config.limitAttempts
const avoidRepeatInSession = config.avoidRepeatInSession

const usedIds = ref<Set<string>>(new Set())
const currentItem = ref<ImageMemeItem | null>(null)
const gameImageUrl = ref('')
const imageError = ref(false)
const noAvailableItems = ref(false)

const inputValue = ref('')
const showInputError = ref(false)
const attempts = ref(0)
const gameWon = ref(false)
const gameOver = ref(false)

const timer = useTimer(
  enableTimer ? config.timerDuration * 60 : 0,
  'imageMeme',
  () => {
    gameOver.value = true
    updateGameStats('imageMeme', false, attempts.value)
  }
)

// 解析图片 URL：打包资源 img/guessPic/* 或 http/data
const guessPicModules = import.meta.glob<string>('@/data/img/guessPic/*', { eager: true, as: 'url' })
function resolveImageUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return ''
  if (pathOrUrl.startsWith('http') || pathOrUrl.startsWith('data:')) return pathOrUrl
  const basename = pathOrUrl.replace(/^.*[/\\]/, '')
  const key = Object.keys(guessPicModules).find(k => k.endsWith(basename) || k.endsWith('/' + basename))
  return key ? guessPicModules[key] : ''
}

function pickNext() {
  const pool = items.value
  const used = avoidRepeatInSession ? usedIds.value : new Set<string>()
  let next = pickRandomUnusedItem(pool, used)
  currentItem.value = next
  gameImageUrl.value = ''
  imageError.value = false
  if (!next) return
  let url = resolveImageUrl(next.image)
  while (!url && next) {
    if (avoidRepeatInSession) {
      usedIds.value.add(next.id)
    }
    next = pickRandomUnusedItem(pool, used)
    currentItem.value = next
    if (next) url = resolveImageUrl(next.image)
  }
  if (next && url) {
    gameImageUrl.value = url
  } else if (next) {
    imageError.value = true
  }
}

function onImageError() {
  imageError.value = true
  const used = avoidRepeatInSession ? usedIds.value : new Set<string>()
  const next = pickRandomUnusedItem(items.value, used)
  if (next && next.id !== currentItem.value?.id) {
    currentItem.value = next
    gameImageUrl.value = resolveImageUrl(next.image) || ''
    imageError.value = !gameImageUrl.value
  }
  if (!gameImageUrl.value && currentItem.value) {
    if (avoidRepeatInSession) {
      usedIds.value.add(currentItem.value.id)
    }
    const another = pickRandomUnusedItem(items.value, used)
    if (another) {
      currentItem.value = another
      gameImageUrl.value = resolveImageUrl(another.image) || ''
      imageError.value = !gameImageUrl.value
    } else {
      usedIds.value.clear()
      pickNext()
    }
  }
  if (items.value.length > 0 && !currentItem.value) {
    noAvailableItems.value = true
  }
}

function resetMemory() {
  usedIds.value = new Set()
  noAvailableItems.value = false
  inputValue.value = ''
  showInputError.value = false
  attempts.value = 0
  gameWon.value = false
  gameOver.value = false
  pickNext()
  if (enableTimer) timer.start()
}

function nextRound() {
  if (avoidRepeatInSession && currentItem.value) usedIds.value.add(currentItem.value.id)
  inputValue.value = ''
  showInputError.value = false
  attempts.value = 0
  gameWon.value = false
  gameOver.value = false
  pickNext()
  if (enableTimer) timer.start()
}

function handleGuess() {
  const raw = inputValue.value?.trim()
  if (!raw || !currentItem.value) return
  showInputError.value = false
  const correct = matchImageMemeAnswer(raw, currentItem.value)
  attempts.value++
  if (correct) {
    gameWon.value = true
    if (avoidRepeatInSession) {
      usedIds.value.add(currentItem.value.id)
    }
    updateGameStats('imageMeme', true, attempts.value)
    if (enableTimer) timer.pause()
  } else {
    showInputError.value = true
    if (limitAttempts && attempts.value >= maxAttempts) {
      gameOver.value = true
      updateGameStats('imageMeme', false, attempts.value)
      if (enableTimer) timer.pause()
    }
  }
}

onMounted(() => {
  pickNext()
  if (enableTimer) timer.start()
})
</script>
