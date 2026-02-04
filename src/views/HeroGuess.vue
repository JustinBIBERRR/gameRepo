<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <!-- 游戏头部（标题、倒计时、提示、进度条） -->
        <GameHeader
          title="王者荣耀人物猜测"
          description="系统随机选择了一个王者荣耀英雄，你有"
          :attempts="attempts"
          :max-attempts="maxAttempts"
          :game-over="gameOver"
          :game-won="gameWon"
          :enable-timer="enableTimer"
          :formatted-time="timer.formattedTime.value"
          :is-warning="timer.isWarning.value"
          :show-restore-tip="showRestoreTip"
          :restore-tip-message="restoreTipMessage"
          :show-initial-hint="showInitialHint"
          :initial-hint="initialHint?.value"
          :closeness="closenessPercentage"
          :closeness-text="closenessText"
          @clear="clearAndRestart"
        />

        <!-- 智能提示 -->
        <div v-if="smartHint && !gameOver && !gameWon" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-start">
            <span class="text-2xl mr-2">💭</span>
            <div>
              <div class="font-semibold text-yellow-900 mb-1">提示</div>
              <div class="text-yellow-800">{{ smartHint }}</div>
            </div>
          </div>
        </div>

        <!-- 游戏进行中 -->
        <div v-if="!gameOver && !gameWon">
          <div class="mb-6">
            <Autocomplete
              v-model="inputValue"
              :suggestions="suggestions"
              :no-match-message="noMatchMessage"
              :show-error="showInputError"
              :enabled="hasHeroData"
              placeholder="输入英雄名称..."
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

          <!-- 英雄网格可视化 -->
          <div v-if="guessHistory.length > 0" class="mb-6">
            <HeroGrid
              :guessed-heroes="guessedHeroesForGrid"
              :target-hero="targetHero"
              :game-over="gameOver"
              :game-won="gameWon"
              :attributes="attributes"
              :attribute-labels="attributeLabels"
              :heroes-data="allHeroesData"
            />
          </div>
        </div>

        <!-- 游戏成功 -->
        <Transition name="fade">
          <div v-if="gameWon" class="text-center py-8">
            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 class="text-3xl font-bold text-green-600 mb-2">恭喜你猜对了！</h2>
            <p class="text-gray-600 mb-4">
              目标英雄是 <span class="font-bold text-blue-600">{{ targetHero?.name }}</span>，
              你用了 <span class="font-bold">{{ attempts }}</span> 次猜测。
            </p>
            <!-- 单局统计 -->
            <div class="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">尝试次数：</span>
                  <span class="font-semibold text-green-600">{{ attempts }}/{{ maxAttempts }}</span>
                </div>
                <div>
                  <span class="text-gray-600">准确率：</span>
                  <span class="font-semibold text-green-600">{{ Math.round((1 / attempts) * 100) }}%</span>
                </div>
              </div>
            </div>
            <!-- 英雄网格可视化（显示目标） -->
            <div v-if="guessHistory.length > 0" class="mb-6">
              <HeroGrid
                :guessed-heroes="guessedHeroesForGrid"
                :target-hero="targetHero"
                :game-over="gameOver"
                :game-won="gameWon"
                :attributes="attributes"
                :attribute-labels="attributeLabels"
                :heroes-data="guessHistory.map(g => g.hero)"
              />
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
              目标英雄是 <span class="font-bold text-blue-600">{{ targetHero?.name }}</span>
            </p>
            <!-- 英雄网格可视化（显示目标） -->
            <div v-if="guessHistory.length > 0" class="mb-6">
              <HeroGrid
                :guessed-heroes="guessedHeroesForGrid"
                :target-hero="targetHero"
                :game-over="gameOver"
                :game-won="gameWon"
                :attributes="attributes"
                :attribute-labels="attributeLabels"
                :heroes-data="guessHistory.map(g => g.hero)"
              />
            </div>
            <button
              @click="restartGame"
              class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              再来一局
            </button>
          </div>
        </Transition>

        <!-- 庆祝动画 -->
        <Celebration
          :show="showCelebration"
          :type="celebrationType"
          :title="celebrationTitle"
          :message="celebrationMessage"
          @close="showCelebration = false"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navigation from '../components/Navigation.vue'
import GameHeader from '../components/GameHeader.vue'
import Autocomplete from '../components/Autocomplete.vue'
import HeroGrid from '../components/HeroGrid.vue'
import Celebration from '../components/Celebration.vue'
import { useModal } from '../composables/useModal'
import { useTimer } from '../composables/useTimer'
import {
  getRandomHero,
  matchHero,
  searchHeroes,
  compareAttributes,
  compareRoles,
  getAllHeroNames,
  attributes,
  attributeLabels,
  type Hero
} from '../utils/heroUtils'
import { 
  updateGameStats, 
  saveGameState as saveToStorage, 
  loadGameState as loadFromStorage,
  getGameConfig,
  clearTimerState
} from '../utils/storageUtils'
import { checkAndUpdateAchievements } from '../utils/achievementUtils'

const router = useRouter()
const { confirm: showConfirm } = useModal()

interface GuessRecord {
  heroName: string
  hero: Hero
  matches: Record<string, 'full' | 'partial' | 'none'>
}

// 读取游戏配置
const gameConfig = getGameConfig('hero')
const enableTimer = ref(gameConfig.enableTimer)
const maxAttempts = ref(gameConfig.maxAttempts)
const showInitialHint = ref(gameConfig.showInitialHint)
const timerDuration = gameConfig.timerDuration * 60 // 转换为秒
const targetHero = ref<Hero | null>(null)
const attempts = ref(0)
const inputValue = ref('')
const initialHint = ref<{ label: string; value: string; attr: string } | null>(null)
const guessHistory = ref<GuessRecord[]>([])
const gameOver = ref(false)
const gameWon = ref(false)
const showInputError = ref(false)
const showCelebration = ref(false)
const celebrationType = ref<'success' | 'failure' | 'achievement'>('success')
const celebrationTitle = ref('')
const celebrationMessage = ref('')
const smartHint = ref<string | null>(null)
const gameStartTime = ref<number>(0)
const showRestoreTip = ref(false)
const restoreTipMessage = ref('')

// 倒计时超时处理
function handleTimerTimeout() {
  if (!gameWon.value) {
    gameOver.value = true
    updateGameStats('hero', false, attempts.value)
    
    showConfirm({
      title: '时间到',
      message: '倒计时已结束，游戏失败！',
      confirmText: '再来一局',
      cancelText: '回到首页'
    }).then((result) => {
      if (result) {
        restartGame()
      } else {
        router.push('/')
      }
    })
  }
}

// 初始化倒计时（仅在启用时）
const timer = useTimer(enableTimer.value ? timerDuration : 0, 'hero', handleTimerTimeout)

const hasHeroData = computed(() => getAllHeroNames().length > 0)
const suggestions = computed(() => {
  if (!hasHeroData.value || !inputValue.value.trim()) return []
  return searchHeroes(inputValue.value)
})

const noMatchMessage = computed(() => {
  return '该英雄不在游戏范围内，请输入正确的英雄名称'
})

const canSubmit = computed(() => {
  if (!inputValue.value.trim()) return false
  const matched = matchHero(inputValue.value)
  return matched !== null
})

// 计算接近度百分比（基于匹配属性数量，部分匹配算0.5）
const closenessPercentage = computed(() => {
  if (guessHistory.value.length === 0) return null
  const lastMatch = guessHistory.value[guessHistory.value.length - 1]
  let score = 0
  Object.values(lastMatch.matches).forEach(match => {
    if (match === 'full') score += 1
    else if (match === 'partial') score += 0.5
  })
  return (score / attributes.length) * 100
})

const closenessText = computed(() => {
  if (closenessPercentage.value === null) return ''
  if (closenessPercentage.value >= 80) return '非常接近！'
  if (closenessPercentage.value >= 60) return '比较接近'
  if (closenessPercentage.value >= 40) return '有点接近'
  return '继续努力'
})

// 为网格组件准备数据
const guessedHeroesForGrid = computed(() => {
  return guessHistory.value.map(guess => {
    // 计算匹配数量：完全匹配=1，部分匹配=0.5
    let matchedCount = 0
    Object.values(guess.matches).forEach(match => {
      if (match === 'full') matchedCount += 1
      else if (match === 'partial') matchedCount += 0.5
    })
    return {
      name: guess.heroName,
      matches: guess.matches,
      matchedCount: Math.round(matchedCount * 10) / 10 // 保留一位小数
    }
  })
})

// 所有英雄数据（包括已猜和目标英雄）
const allHeroesData = computed(() => {
  const heroes = guessHistory.value.map(g => g.hero)
  if (targetHero.value) {
    heroes.push(targetHero.value)
  }
  return heroes
})

function handleSelect(heroName: string) {
  inputValue.value = heroName
}

function handleGuess() {
  if (!canSubmit.value) {
    showInputError.value = true
    return
  }

  showInputError.value = false
  const guessedHero = matchHero(inputValue.value)
  
  if (!guessedHero || !targetHero.value) {
    return
  }

  // 先增加尝试次数
  attempts.value++

  // 比较属性
  const matches = compareAttributes(targetHero.value, guessedHero)
  
  // 如果初始提示的属性已匹配，确保在matches中标记为full
  if (initialHint.value) {
    if (initialHint.value.attr === 'role') {
      // 角色需要检查部分匹配
      const roleMatch = compareRoles(targetHero.value.role, guessedHero.role)
      matches[initialHint.value.attr] = roleMatch
    } else {
      matches[initialHint.value.attr] = 'full'
    }
  }

  // 检查是否猜中
  if (guessedHero.name === targetHero.value.name) {
    gameWon.value = true
    timer.pause()
    clearTimerState()
    const stats = updateGameStats('hero', true, attempts.value)
    
    // 检查成就
    const newlyUnlocked = checkAndUpdateAchievements('hero', stats)
    
    // 显示庆祝动画
    celebrationType.value = 'success'
    celebrationTitle.value = '恭喜！'
    celebrationMessage.value = `你用了 ${attempts.value} 次猜测就找到了答案！`
    showCelebration.value = true
    
    // 如果有新成就解锁，显示成就动画
    if (newlyUnlocked.length > 0) {
      setTimeout(() => {
        celebrationType.value = 'achievement'
        celebrationTitle.value = '成就解锁！'
        celebrationMessage.value = newlyUnlocked.map(a => a.name).join('、')
        showCelebration.value = true
      }, 2500)
    }
    
    saveGameState()
    return
  }

  // 生成智能提示
  if (guessHistory.value.length > 0) {
    const lastMatch = guessHistory.value[guessHistory.value.length - 1]
    let lastScore = 0
    Object.values(lastMatch.matches).forEach(m => {
      if (m === 'full') lastScore += 1
      else if (m === 'partial') lastScore += 0.5
    })
    let currentScore = 0
    Object.values(matches).forEach(m => {
      if (m === 'full') currentScore += 1
      else if (m === 'partial') currentScore += 0.5
    })
    
    if (currentScore > lastScore) {
      smartHint.value = `很好！这次比上次更接近了！`
    } else if (currentScore < lastScore) {
      smartHint.value = `这次匹配度比上次低了，试试其他英雄？`
    } else {
      smartHint.value = '匹配度和上次一样，试试其他方向的英雄？'
    }
  } else {
    smartHint.value = null
  }

  // 添加到历史记录
  guessHistory.value.push({
    heroName: guessedHero.name,
    hero: guessedHero,
    matches
  })

  inputValue.value = ''

  // 检查是否用尽机会
  if (attempts.value >= maxAttempts.value) {
    gameOver.value = true
    timer.pause()
    clearTimerState()
    updateGameStats('hero', false, attempts.value)
    
    // 显示失败鼓励动画
    celebrationType.value = 'failure'
    celebrationTitle.value = '再试试！'
    celebrationMessage.value = `目标英雄是 ${targetHero.value.name}，下次一定能猜中！`
    showCelebration.value = true
  }

  saveGameState()
}

function clearAndRestart() {
  showConfirm({
    title: '清除游戏数据',
    message: '确定要清除当前游戏数据并重新开始吗？',
    confirmText: '确定清除',
    cancelText: '取消'
  }).then((result) => {
    if (result) {
      // 清除 sessionStorage
      sessionStorage.removeItem('heroGuessGame')
      // 重新开始游戏
      restartGame()
    }
  })
}

function restartGame() {
  // 重新读取配置（可能已更改）
  const config = getGameConfig('hero')
  enableTimer.value = config.enableTimer
  maxAttempts.value = config.maxAttempts
  showInitialHint.value = config.showInitialHint
  
  const hero = getRandomHero()
  if (!hero) {
    console.error('Failed to get random hero')
    return
  }
  targetHero.value = hero
  attempts.value = 0
  inputValue.value = ''
  guessHistory.value = []
  gameOver.value = false
  gameWon.value = false
  showInputError.value = false
  
  // 重置倒计时（仅在启用时）
  if (enableTimer.value) {
    timer.reset(config.timerDuration * 60)
    timer.start()
  }
  
  // 随机选择一个属性作为初始提示
  if (showInitialHint.value) {
    const randomAttr = attributes[Math.floor(Math.random() * attributes.length)]
    initialHint.value = {
      label: attributeLabels[randomAttr],
      value: hero[randomAttr],
      attr: randomAttr
    }
  } else {
    initialHint.value = null
  }
  
  saveGameState()
}

function saveGameState() {
  if (targetHero.value) {
    const state = {
      targetHero: targetHero.value.name,
      attempts: attempts.value,
      guessHistory: guessHistory.value,
      initialHint: initialHint.value,
      gameOver: gameOver.value,
      gameWon: gameWon.value,
      gameStartTime: gameStartTime.value
    }
    saveToStorage('heroGuessGame', state)
  }
}

function loadGameState() {
  const saved = loadFromStorage('heroGuessGame', null)
  if (saved) {
    try {
      const state = saved as any
      const heroName = getAllHeroNames().find(h => h === state.targetHero)
      if (heroName) {
        const matched = matchHero(heroName)
        if (matched) {
          targetHero.value = matched
          attempts.value = state.attempts || 0
          guessHistory.value = state.guessHistory || []
          initialHint.value = state.initialHint || null
          gameOver.value = state.gameOver || false
          gameWon.value = state.gameWon || false
          gameStartTime.value = state.gameStartTime || Date.now()
          
          // 如果加载的状态没有初始提示，但游戏还没开始，则设置初始提示
          if (showInitialHint.value && !initialHint.value && attempts.value === 0 && !gameOver.value && !gameWon.value) {
            const randomAttr = attributes[Math.floor(Math.random() * attributes.length)]
            initialHint.value = {
              label: attributeLabels[randomAttr],
              value: matched[randomAttr],
              attr: randomAttr
            }
            saveGameState()
          }
          
          return true
        }
      }
    } catch (e) {
      console.error('Failed to load game state:', e)
    }
  }
  return false
}

onMounted(() => {
  // 重新读取配置（确保使用最新配置）
  const config = getGameConfig('hero')
  enableTimer.value = config.enableTimer
  showInitialHint.value = config.showInitialHint
  maxAttempts.value = config.maxAttempts
  
  // 尝试恢复倒计时状态（仅在启用时）
  let restored = false
  if (enableTimer.value) {
    restored = timer.restoreState()
    if (restored) {
      showRestoreTip.value = true
      restoreTipMessage.value = `倒计时已恢复，剩余时间：${timer.formattedTime.value}，或者看广告延长时间，QAQ骗你的没广告~`
    }
  }
  
  if (!loadGameState()) {
    restartGame()
  } else {
    // 如果加载了游戏状态但没有开始时间，设置当前时间
    if (!gameStartTime.value) {
      gameStartTime.value = Date.now()
    }
    
    // 如果游戏还在进行中且倒计时未恢复，启动倒计时（仅在启用时）
    if (!gameOver.value && !gameWon.value && !restored && enableTimer.value) {
      timer.reset(config.timerDuration * 60)
      timer.start()
    }
  }
  // 调试：确保初始提示已设置
  if (targetHero.value && showInitialHint.value && !initialHint.value && attempts.value === 0) {
    console.log('警告：游戏已开始但没有初始提示，正在修复...')
    const randomAttr = attributes[Math.floor(Math.random() * attributes.length)]
    initialHint.value = {
      label: attributeLabels[randomAttr],
      value: targetHero.value[randomAttr],
      attr: randomAttr
    }
    saveGameState()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
