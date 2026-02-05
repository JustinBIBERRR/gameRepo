<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <!-- 进入游戏前：资源预加载 loading，覆盖图片等，加载完成后再开始计时 -->
        <div
          v-if="targetItem && !resourceReady"
          class="flex flex-col items-center justify-center py-16 px-4"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p class="text-gray-600 font-medium">正在加载图片...</p>
          <p class="text-sm text-gray-500 mt-1">加载完成后自动开始</p>
        </div>

        <template v-else>
        <GameHeader
          :title="t('games.visual.title')"
          :description="t('game.visualDescPrefix')"
          :show-remaining-attempts="false"
          :attempts="hintLevel"
          :max-attempts="maxAttempts"
          :game-over="gameOver"
          :game-won="gameWon"
          :enable-timer="enableTimer"
          :formatted-time="timer.formattedTime.value"
          :is-warning="timer.isWarning.value"
          :show-restore-tip="showRestoreTip"
          :restore-tip-message="restoreTipMessage"
          :show-initial-hint="showCategoryHint && !!categoryHint"
          :initial-hint="categoryHint"
          :hint-prefix="t('game.visualHintPrefix')"
          hint-suffix=""
          @clear="clearAndRestart"
        />

        <!-- 游戏进行中：壳子等分网格，用户每次选一个区域查看 -->
        <div v-if="!gameOver && !gameWon" class="space-y-6">
          <!-- 图片壳：糊化整图 + 已选区域为清晰 + 可点击网格 -->
          <div class="flex flex-col items-center gap-4">
            <div
              class="w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative visual-hint-grid-container"
            >
              <template v-if="targetItem && gameImageUrl">
                <!-- 壳子：默认全糊（灰色，看不到任何信息） -->
                <div class="visual-hint-shell absolute inset-0 w-full h-full">
                  <img
                    :src="gameImageUrl"
                    class="visual-hint-img visual-hint-blur-full absolute inset-0 w-full h-full object-contain"
                    alt=""
                    aria-hidden
                    @error="onImageError"
                  />
                </div>
                <!-- 已选区域：第1、2次 70% 糊化，第3次 80% 糊化（逐次略清晰） -->
                <img
                  v-for="(regionIndex, i) in revealedRegions"
                  :key="'region-' + i + '-' + regionIndex"
                  :src="gameImageUrl"
                  class="visual-hint-img absolute inset-0 w-full h-full object-contain pointer-events-none"
                  :style="getRevealRegionStyle(regionIndex, i)"
                  alt=""
                  aria-hidden
                  @error="onImageError"
                />
                <!-- 网格：可点击选择区域 -->
                <div
                  class="absolute inset-0 grid gap-px pointer-events-none"
                  :style="gridStyle"
                >
                  <div
                    v-for="i in totalRegions"
                    :key="i - 1"
                    class="border border-white/60 pointer-events-auto"
                    :class="isRegionRevealed(i - 1) ? 'bg-transparent' : 'cursor-pointer hover:bg-white/10'"
                    :aria-label="isRegionRevealed(i - 1) ? '已查看' : '点击查看该区域'"
                    @click="revealRegion(i - 1)"
                  />
                </div>
              </template>
              <div v-else-if="imageError" class="text-gray-500 p-4 text-center absolute inset-0 flex items-center justify-center">
                图片加载失败，请检查网络
              </div>
              <div v-else class="text-gray-400 p-4 absolute inset-0 flex items-center justify-center">暂无图片</div>
            </div>
            <p class="text-sm text-gray-500">
              {{ hintLevel >= maxAttempts ? '已是最后一条提示，请尽快猜测' : `已查看 ${hintLevel}/${maxAttempts} 次；点击格子选择要查看的区域` }}
            </p>
          </div>

          <!-- 输入猜测：仅在本游戏有数据源时启用联想 -->
          <div v-if="hintLevel > 0" class="mt-6">
            <Autocomplete
              v-model="inputValue"
              :suggestions="suggestions"
              :no-match-message="noMatchMessage"
              :show-error="showInputError"
              :enabled="hasVisualItems"
              placeholder="输入物品名称..."
              @select="handleSelect"
            />
            <button
              @click="handleGuess"
              :disabled="!canSubmit"
              class="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              提交猜测
            </button>
          </div>
        </div>

        <!-- 游戏成功 -->
        <Transition name="fade">
          <div v-if="gameWon" class="text-center py-8">
            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 class="text-3xl font-bold text-green-600 mb-2">恭喜你猜对了！</h2>
            <p class="text-gray-600 mb-4">
              答案是 <span class="font-bold text-blue-600">{{ targetItem?.name }}</span>，
              你用了 <span class="font-bold">{{ hintLevel }}</span> 次提示。
            </p>
            <div v-if="gameImageUrl" class="mb-6 max-w-sm mx-auto">
              <img :src="gameImageUrl" class="w-full rounded-lg shadow" alt="答案" />
            </div>
            <button
              @click="restartGame"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              再来一局
            </button>
          </div>
        </Transition>

        <!-- 游戏失败 -->
        <Transition name="fade">
          <div v-if="gameOver && !gameWon" class="text-center py-8">
            <div class="text-6xl mb-4 animate-pulse">😢</div>
            <h2 class="text-3xl font-bold text-red-600 mb-2">很遗憾，游戏结束</h2>
            <p class="text-gray-600 mb-4">
              答案是 <span class="font-bold text-blue-600">{{ targetItem?.name }}</span>
            </p>
            <div v-if="gameImageUrl" class="mb-6 max-w-sm mx-auto">
              <img :src="gameImageUrl" class="w-full rounded-lg shadow" alt="答案" />
            </div>
            <button
              @click="restartGame"
              class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              再来一局
            </button>
          </div>
        </Transition>

        <Celebration
          :show="showCelebration"
          :type="celebrationType"
          :title="celebrationTitle"
          :message="celebrationMessage"
          @close="showCelebration = false"
        />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Navigation from '../components/Navigation.vue'

const { t } = useI18n()
import GameHeader from '../components/GameHeader.vue'
import Autocomplete from '../components/Autocomplete.vue'
import Celebration from '../components/Celebration.vue'
import { useModal } from '../composables/useModal'
import { useTimer } from '../composables/useTimer'
import {
  getRandomItem,
  matchItem,
  searchItems,
  getCurrentVisualItems
} from '../utils/visualUtils'
import type { ItemData } from '../schemas/itemSchema'
import {
  updateGameStats,
  saveGameState as saveToStorage,
  loadGameState as loadFromStorage,
  getGameConfig,
  getGameSettings,
  clearTimerState
} from '../utils/storageUtils'
import { checkAndUpdateAchievements } from '../utils/achievementUtils'
import { nextTick } from 'vue'

const router = useRouter()
const { confirm: showConfirm } = useModal()

const gameConfig = getGameConfig('visual')
const enableTimer = ref(gameConfig.enableTimer)
const maxAttempts = ref(gameConfig.maxAttempts)
const showInitialHint = ref(gameConfig.showInitialHint)
const showCategoryHint = ref(
  (getGameSettings().overrides.visual?.showCategoryHint !== false)
)
const timerDuration = gameConfig.timerDuration * 60

const targetItem = ref<ItemData | null>(null)
const inputValue = ref('')
const gameOver = ref(false)
const gameWon = ref(false)
const showInputError = ref(false)
const showCelebration = ref(false)
const celebrationType = ref<'success' | 'failure' | 'achievement'>('success')
const celebrationTitle = ref('')
const celebrationMessage = ref('')
const showRestoreTip = ref(false)
const restoreTipMessage = ref('')
const imageError = ref(false)

const categoryHint = computed(() => {
  if (!showCategoryHint.value) return null
  const hint = getGameSettings().overrides.visual?.initialHint?.trim()
  return hint || null
})

// 默认数据图片：来自 src/data/img，用 @ 别名由 Vite 打包为可用 URL；主持人自定义数据可为 http(s) 或 data URL，此处统一解析后展示
const localImgModules = import.meta.glob<string>('@/data/img/*', {
  eager: true,
  as: 'url'
})
const getLocalImageUrl = (pathOrFilename: string): string => {
  if (!pathOrFilename) return ''
  const basename = pathOrFilename.replace(/^.*[/\\]/, '')
  const key = Object.keys(localImgModules).find((k) =>
    k.endsWith(basename) || k.endsWith('/' + basename)
  )
  return key ? localImgModules[key] : ''
}

// 每局只加载一次图片并锁定为 blob URL，避免同一 URL 多次请求返回不同图片（如 loremflickr 随机图）
const gameImageUrl = ref('')
const resourceReady = ref(false)
const pendingTimerStart = ref(false)

function revokeGameImageUrl() {
  if (gameImageUrl.value && gameImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(gameImageUrl.value)
  }
  gameImageUrl.value = ''
  resourceReady.value = false
}

watch(
  () => targetItem.value?.images?.full,
  async (rawUrl) => {
    revokeGameImageUrl()
    if (!rawUrl) return
    resourceReady.value = false
    // 三种来源：① 默认打包资源 path → getLocalImageUrl；② 自定义 http(s) URL；③ 主持人上传的 data URL
    const url =
      rawUrl.startsWith('http') ? rawUrl : getLocalImageUrl(rawUrl) || rawUrl
    if (!url) return
    try {
      if (url.startsWith('http')) {
        const res = await fetch(url)
        if (!res.ok) throw new Error(res.statusText)
        const blob = await res.blob()
        gameImageUrl.value = URL.createObjectURL(blob)
      } else {
        // 打包资源 URL 或 data URL 直接使用
        gameImageUrl.value = url
      }
      resourceReady.value = true
    } catch {
      gameImageUrl.value = url
      resourceReady.value = true
    }
  },
  { immediate: true }
)

watch([resourceReady, () => targetItem.value], () => {
  if (
    resourceReady.value &&
    targetItem.value &&
    pendingTimerStart.value &&
    enableTimer.value &&
    !gameOver.value &&
    !gameWon.value
  ) {
    timer.start()
    pendingTimerStart.value = false
  }
})

onBeforeUnmount(() => {
  revokeGameImageUrl()
})

// 图片壳等分：默认 9 宫格（来自配置）
const gridRows = ref(3)
const gridCols = ref(3)
const totalRegions = computed(() => Math.max(1, gridRows.value * gridCols.value))
const gridStyle = computed(() => ({
  gridTemplateRows: `repeat(${gridRows.value}, 1fr)`,
  gridTemplateColumns: `repeat(${gridCols.value}, 1fr)`
}))

// 用户已选择的区域索引（0 ～ totalRegions-1），每次选择消耗 1 次提示
const revealedRegions = ref<number[]>([])
const hintLevel = computed(() => revealedRegions.value.length)

/** 区域 index 对应的 clip-path: inset(top% right% bottom% left%) */
function getRegionInset(index: number): string {
  const rows = gridRows.value
  const cols = gridCols.value
  const r = Math.floor(index / cols)
  const c = index % cols
  const top = (r / rows) * 100
  const left = (c / cols) * 100
  const bottom = ((rows - 1 - r) / rows) * 100
  const right = ((cols - 1 - c) / cols) * 100
  return `inset(${top}% ${right}% ${bottom}% ${left}%)`
}

/** 第1、2次提示：70% 糊化；第3次：80% 糊化（更清晰）。revealOrderIndex 为 0、1、2 */
function getRevealRegionStyle(regionIndex: number, revealOrderIndex: number): { clipPath: string; filter: string } {
  const blurPx = revealOrderIndex < 2 ? 12 : 6
  return { clipPath: getRegionInset(regionIndex), filter: `blur(${blurPx}px)` }
}

function isRegionRevealed(index: number): boolean {
  return revealedRegions.value.includes(index)
}

function revealRegion(index: number) {
  if (hintLevel.value >= maxAttempts.value) return
  if (isRegionRevealed(index)) return
  revealedRegions.value = [...revealedRegions.value, index]
  saveGameState()
}

const hasVisualItems = computed(() => getCurrentVisualItems().length > 0)

function onImageError() {
  imageError.value = true
}

function handleTimerTimeout() {
  if (!gameWon.value) {
    gameOver.value = true
    updateGameStats('visual', false, hintLevel.value)
    showConfirm({
      title: t('game.timeUp'),
      message: t('game.timeUpMessage'),
      confirmText: t('game.playAgain'),
      cancelText: t('game.backToHome')
    }).then((result) => {
      if (result) restartGame()
      else router.push('/')
    })
  }
}

const timer = useTimer(enableTimer.value ? timerDuration : 0, 'visual', handleTimerTimeout)

const suggestions = computed(() => {
  if (!hasVisualItems.value || !inputValue.value.trim()) return []
  return searchItems(inputValue.value)
})

const noMatchMessage = computed(() => '该物品不在游戏范围内，请从列表中选择')

const canSubmit = computed(() => Boolean(inputValue.value.trim()))

function handleSelect(name: string) {
  inputValue.value = name
}


function isRawGuessCorrect(raw: string, item: ItemData): boolean {
  const t = raw.trim().toLowerCase()
  if (!t) return false
  if (item.name.toLowerCase() === t) return true
  return (item.aliases ?? []).some(a => a.toLowerCase() === t)
}

function handleGuess() {
  if (!canSubmit.value) {
    showInputError.value = true
    return
  }
  showInputError.value = false
  if (!targetItem.value) return
  const guessed = matchItem(inputValue.value)
  const correct = guessed
    ? guessed.name === targetItem.value!.name
    : isRawGuessCorrect(inputValue.value, targetItem.value)

  if (correct) {
    gameWon.value = true
    timer.pause()
    clearTimerState()
    const stats = updateGameStats('visual', true, hintLevel.value)
    checkAndUpdateAchievements('visual', stats)
    celebrationType.value = 'success'
    celebrationTitle.value = t('game.congrats')
    celebrationMessage.value = `你用了 ${hintLevel.value} 次提示就找到了答案！`
    showCelebration.value = true
  } else {
    if (hasVisualItems.value) showInputError.value = true
    if (hintLevel.value >= maxAttempts.value) {
      gameOver.value = true
      timer.pause()
      clearTimerState()
      updateGameStats('visual', false, hintLevel.value)
      celebrationType.value = 'failure'
      celebrationTitle.value = t('game.tryAgain')
      celebrationMessage.value = `答案是 ${targetItem.value!.name}，下次一定能猜中！`
      showCelebration.value = true
    }
    inputValue.value = ''
  }
  saveGameState()
}

function clearAndRestart() {
  showConfirm({
    title: t('game.playAgainTitle'),
    message: t('game.playAgainMessage'),
    confirmText: t('game.playAgainConfirm'),
    cancelText: t('common.cancel')
  }).then((result) => {
    if (!result) return
    // 延后到弹窗关闭并完成渲染后再清除和重启，避免第一次点击确认无反应
    nextTick(() => {
      sessionStorage.removeItem('visualGuessGame')
      clearTimerState()
      targetItem.value = null
      revealedRegions.value = []
      inputValue.value = ''
      gameOver.value = false
      gameWon.value = false
      showInputError.value = false
      showCelebration.value = false
      imageError.value = false
      restartGame()
    })
  })
}

function restartGame() {
  const config = getGameConfig('visual')
  enableTimer.value = config.enableTimer
  maxAttempts.value = config.maxAttempts
  showInitialHint.value = config.showInitialHint
  showCategoryHint.value = getGameSettings().overrides.visual?.showCategoryHint !== false
  const visual = getGameSettings().overrides.visual
  gridRows.value = Math.max(1, visual?.gridRows ?? 3)
  gridCols.value = Math.max(1, visual?.gridCols ?? 3)

  const item = getRandomItem()
  if (!item) {
    console.error('没有可用的物品数据')
    return
  }
  targetItem.value = item
  revealedRegions.value = []
  inputValue.value = ''
  gameOver.value = false
  gameWon.value = false
  showInputError.value = false
  showCelebration.value = false
  imageError.value = false

  if (enableTimer.value) {
    timer.reset(config.timerDuration * 60)
    pendingTimerStart.value = true
    // 计时器在资源预加载完成后由 watch 启动
  } else {
    pendingTimerStart.value = false
  }
  saveGameState()
}

function saveGameState() {
  if (targetItem.value) {
    saveToStorage('visualGuessGame', {
      targetName: targetItem.value.name,
      revealedRegions: revealedRegions.value,
      gridRows: gridRows.value,
      gridCols: gridCols.value,
      gameOver: gameOver.value,
      gameWon: gameWon.value
    })
  }
}

function loadGameState(): boolean {
  const saved = loadFromStorage('visualGuessGame', null)
  if (!saved || typeof saved !== 'object') return false
  const state = saved as {
    targetName: string
    revealedRegions?: number[]
    gridRows?: number
    gridCols?: number
    gameOver: boolean
    gameWon: boolean
  }
  const items = getCurrentVisualItems()
  const item = items.find(i => i.name === state.targetName)
  if (!item) return false
  targetItem.value = item
  const total = Math.max(1, (state.gridRows ?? 3) * (state.gridCols ?? 3))
  const raw = state.revealedRegions
  revealedRegions.value = Array.isArray(raw) ? raw.filter((i: number) => Number.isInteger(i) && i >= 0 && i < total) : []
  gridRows.value = Math.max(1, state.gridRows ?? 3)
  gridCols.value = Math.max(1, state.gridCols ?? 3)
  gameOver.value = state.gameOver ?? false
  gameWon.value = state.gameWon ?? false
  return true
}

onMounted(() => {
  const config = getGameConfig('visual')
  enableTimer.value = config.enableTimer
  maxAttempts.value = config.maxAttempts
  showCategoryHint.value = getGameSettings().overrides.visual?.showCategoryHint !== false
  const visual = getGameSettings().overrides.visual
  gridRows.value = Math.max(1, visual?.gridRows ?? 3)
  gridCols.value = Math.max(1, visual?.gridCols ?? 3)

  let restored = false
  if (enableTimer.value) {
    restored = timer.restoreState()
    if (restored) {
      showRestoreTip.value = true
      restoreTipMessage.value = `倒计时已恢复，剩余时间：${timer.formattedTime.value}`
    }
  }

  if (!loadGameState()) {
    restartGame()
  } else if (!gameOver.value && !gameWon.value && enableTimer.value && !restored) {
    timer.reset(config.timerDuration * 60)
    pendingTimerStart.value = true
    // 计时器在资源预加载完成后由 watch 启动
  }
})
</script>

<style scoped>
/* 禁止图片在切换提示时做渐变动效，避免泄露完整图 */
.visual-hint-img {
  transition: none !important;
}

/* 第1次：局部细节，中心极小区域 */
.visual-hint-detail {
  clip-path: inset(47% 47% 47% 47%);
  transform: scale(5);
}

/* 壳子：糊化整图，透明洞由上层 img clip-path 露出底图 */
.visual-hint-shell {
  position: relative;
}
.visual-hint-shell img {
  pointer-events: none;
}
/* 默认全糊：看不到任何信息（灰色） */
.visual-hint-blur-full {
  filter: blur(40px);
}
/* 糊化强度：仅作用于壳子层（整图） */
.visual-hint-blur-85 {
  filter: blur(25px);
}
.visual-hint-blur-60 {
  filter: blur(12px);
}
.visual-hint-blur-30 {
  filter: blur(5px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
