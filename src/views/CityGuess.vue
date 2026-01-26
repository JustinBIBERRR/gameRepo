<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <!-- 游戏头部（标题、倒计时、提示、进度条） -->
        <GameHeader
          title="城市猜测游戏"
          description="系统随机选择了一个国内城市，你有"
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
          :initial-hint="initialHint"
          hint-prefix="这是一个"
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
              placeholder="输入城市名称..."
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

          <!-- 猜测历史 -->
          <div v-if="guessHistory.length > 0" class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">猜测历史</h2>
            <div
              v-for="(guess, index) in guessHistory"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="text-lg font-medium text-gray-900">{{ guess.cityName }}</span>
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="{
                      'bg-red-100 text-red-700': guess.closenessTag === '非常接近！',
                      'bg-orange-100 text-orange-700': guess.closenessTag === '比较接近',
                      'bg-yellow-100 text-yellow-700': guess.closenessTag === '有点接近',
                      'bg-gray-100 text-gray-700': guess.closenessTag === '继续努力'
                    }"
                  >
                    {{ guess.closenessTag }}
                  </span>
                  <span class="text-sm text-gray-500">第 {{ index + 1 }} 次猜测</span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-600">距离：</span>
                  <span class="font-semibold text-blue-600">{{ guess.distance }} 公里</span>
                </div>
                <div>
                  <span class="text-gray-600">方位：</span>
                  <span class="font-semibold text-green-600">{{ guess.direction }}</span>
                </div>
              </div>
              <div v-if="guess.feature" class="mt-2 text-sm">
                <span class="text-gray-600">城市特点：</span>
                <span class="font-medium text-purple-600">{{ guess.feature }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏成功 -->
        <Transition name="fade">
          <div v-if="gameWon" class="text-center py-8">
            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 class="text-3xl font-bold text-green-600 mb-2">恭喜你猜对了！</h2>
            <p class="text-gray-600 mb-4">
              目标城市是 <span class="font-bold text-blue-600">{{ targetCity?.name }}</span>，
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
              目标城市是 <span class="font-bold text-blue-600">{{ targetCity?.name }}</span>
            </p>
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
import Celebration from '../components/Celebration.vue'
import { useModal } from '../composables/useModal'
import { useTimer } from '../composables/useTimer'
import {
  getRandomCity,
  matchCity,
  searchCities,
  calculateDistance,
  calculateBearing,
  bearingToDirection,
  getCityFeature,
  getAllCityNames,
  type City
} from '../utils/cityUtils'
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

// 读取游戏配置
const gameConfig = getGameConfig('city')
const enableTimer = ref(gameConfig.enableTimer)
const maxAttempts = ref(gameConfig.maxAttempts)
const showInitialHint = ref(gameConfig.showInitialHint)
const timerDuration = gameConfig.timerDuration * 60 // 转换为秒
const targetCity = ref<City | null>(null)
const attempts = ref(0)
const inputValue = ref('')
const initialHint = ref<string | null>(null)
const guessHistory = ref<Array<{
  cityName: string
  distance: number
  direction: string
  feature: string | null
  closenessTag: string
}>>([])
const usedFeatures = ref<string[]>([])
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
    updateGameStats('city', false, attempts.value)
    
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
const timer = useTimer(enableTimer.value ? timerDuration : 0, 'city', handleTimerTimeout)

const suggestions = computed(() => {
  if (!inputValue.value.trim()) {
    return []
  }
  return searchCities(inputValue.value)
})

const noMatchMessage = computed(() => {
  return '该城市不在游戏范围内，请输入主要城市（如省会、直辖市等）'
})

const canSubmit = computed(() => {
  if (!inputValue.value.trim()) return false
  const matched = matchCity(inputValue.value)
  return matched !== null
})

// 计算接近度百分比
const closenessPercentage = computed(() => {
  if (guessHistory.value.length === 0) return null
  const lastDistance = guessHistory.value[guessHistory.value.length - 1].distance
  // 假设最大距离为 3000km，转换为百分比（距离越小，百分比越高）
  const maxDistance = 3000
  const closeness = Math.max(0, Math.min(100, ((maxDistance - lastDistance) / maxDistance) * 100))
  return closeness
})

// 根据距离计算接近程度标签
function getClosenessTag(distance: number): string {
  const maxDistance = 3000
  const closeness = Math.max(0, Math.min(100, ((maxDistance - distance) / maxDistance) * 100))
  if (closeness >= 80) return '非常接近！'
  if (closeness >= 60) return '比较接近'
  if (closeness >= 40) return '有点接近'
  return '继续努力'
}

const closenessText = computed(() => {
  if (guessHistory.value.length === 0) return ''
  const lastDistance = guessHistory.value[guessHistory.value.length - 1].distance
  return getClosenessTag(lastDistance)
})

// 生成智能提示
function generateSmartHint(distance: number, direction: string): string | null {
  if (guessHistory.value.length === 0) {
    // 第一次猜测，根据接近程度给出提示
    const tag = getClosenessTag(distance)
    if (tag === '非常接近！') {
      return `太棒了！第一次就非常接近，目标在${direction}方向，继续加油！`
    } else if (tag === '比较接近') {
      return `不错！目标在${direction}方向，距离还有 ${distance} 公里，继续缩小范围！`
    } else if (tag === '有点接近') {
      return `目标在${direction}方向，距离 ${distance} 公里，可以尝试该方向更近的城市。`
    } else {
      return `目标在${direction}方向，距离较远（${distance} 公里），建议尝试${direction}方向的主要城市。`
    }
  }

  const lastGuess = guessHistory.value[guessHistory.value.length - 1]
  const lastDistance = lastGuess.distance
  const lastDirection = lastGuess.direction
  const distanceDiff = lastDistance - distance
  const distanceDiffPercent = Math.abs(distanceDiff) / lastDistance * 100
  const currentTag = getClosenessTag(distance)

  // 距离变近了
  if (distance < lastDistance) {
    const diffKm = Math.round(distanceDiff)
    
    // 根据变化幅度给出不同强度的反馈
    if (distanceDiffPercent >= 50) {
      // 大幅接近
      return `🎯 太棒了！比上次近了 ${diffKm} 公里（减少了 ${Math.round(distanceDiffPercent)}%），方向正确！目标在${direction}方向，${currentTag === '非常接近！' ? '你已经非常接近了！' : '继续这个方向！'}`
    } else if (distanceDiffPercent >= 20) {
      // 明显接近
      return `👍 很好！比上次近了 ${diffKm} 公里（减少了 ${Math.round(distanceDiffPercent)}%），目标在${direction}方向，${currentTag === '非常接近！' ? '非常接近了！' : '保持这个方向！'}`
    } else if (distanceDiffPercent >= 5) {
      // 小幅接近
      return `✅ 不错！比上次近了 ${diffKm} 公里，目标在${direction}方向，继续缩小范围。`
    } else {
      // 微幅接近
      return `比上次近了 ${diffKm} 公里，目标在${direction}方向，可以尝试更近的城市。`
    }
  } 
  // 距离变远了
  else if (distance > lastDistance) {
    const diffKm = Math.round(-distanceDiff)
    
    if (distanceDiffPercent >= 50) {
      // 大幅远离
      return `⚠️ 这次比上次远了 ${diffKm} 公里（增加了 ${Math.round(distanceDiffPercent)}%），方向可能不对。建议回到${lastDirection}方向，或尝试其他方向的城市。`
    } else if (distanceDiffPercent >= 20) {
      // 明显远离
      return `这次比上次远了 ${diffKm} 公里，方向可能不太对。建议尝试${lastDirection}方向的城市，或换个方向试试。`
    } else {
      // 小幅远离
      return `这次比上次远了 ${diffKm} 公里，可以尝试${lastDirection}方向更近的城市，或探索其他方向。`
    }
  } 
  // 距离差不多
  else {
    // 检查是否连续多次距离相近
    let similarCount = 1
    for (let i = guessHistory.value.length - 1; i >= 1; i--) {
      const prevDistance = guessHistory.value[i - 1].distance
      const currentDistance = guessHistory.value[i].distance
      const diff = Math.abs(currentDistance - prevDistance)
      if (diff / prevDistance < 0.1) { // 距离变化小于10%认为相近
        similarCount++
      } else {
        break
      }
    }
    
    if (similarCount >= 3) {
      return `距离和上次差不多，已经连续 ${similarCount} 次距离相近了。建议尝试${direction}方向不同距离的城市，或换个方向探索。`
    } else {
      return `距离和上次差不多（${distance} 公里），目标在${direction}方向。建议尝试该方向不同距离的城市，或换个方向试试。`
    }
  }
}


function handleSelect(cityName: string) {
  inputValue.value = cityName
}

function handleGuess() {
  if (!canSubmit.value) {
    showInputError.value = true
    return
  }

  showInputError.value = false
  const guessedCity = matchCity(inputValue.value)
  
  if (!guessedCity || !targetCity.value) {
    return
  }

  // 先增加尝试次数
  attempts.value++

  // 检查是否猜中
  if (guessedCity.name === targetCity.value.name) {
    gameWon.value = true
    timer.pause()
    clearTimerState()
    const stats = updateGameStats('city', true, attempts.value)
    
    // 检查成就
    const newlyUnlocked = checkAndUpdateAchievements('city', stats)
    
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

  // 计算距离和方位
  const distance = calculateDistance(
    guessedCity.latitude,
    guessedCity.longitude,
    targetCity.value.latitude,
    targetCity.value.longitude
  )
  const bearing = calculateBearing(
    guessedCity.latitude,
    guessedCity.longitude,
    targetCity.value.latitude,
    targetCity.value.longitude
  )
  const direction = bearingToDirection(bearing)

  // 获取城市特点
  const feature = getCityFeature(targetCity.value, usedFeatures.value)
  if (feature) {
    usedFeatures.value.push(feature)
  }

  // 生成智能提示（优化版）
  smartHint.value = generateSmartHint(distance, direction)

  // 添加到历史记录
  guessHistory.value.push({
    cityName: guessedCity.name,
    distance,
    direction,
    feature,
    closenessTag: getClosenessTag(distance)
  })

  inputValue.value = ''

  // 检查是否用尽机会
  if (attempts.value >= maxAttempts.value) {
    gameOver.value = true
    timer.pause()
    clearTimerState()
    updateGameStats('city', false, attempts.value)
    
    // 显示失败鼓励动画
    celebrationType.value = 'failure'
    celebrationTitle.value = '再试试！'
    celebrationMessage.value = `目标城市是 ${targetCity.value.name}，下次一定能猜中！`
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
      sessionStorage.removeItem('cityGuessGame')
      // 清除倒计时状态
      clearTimerState()
      // 重置所有状态
      targetCity.value = null
      attempts.value = 0
      inputValue.value = ''
      guessHistory.value = []
      usedFeatures.value = []
      gameOver.value = false
      gameWon.value = false
      showInputError.value = false
      showCelebration.value = false
      smartHint.value = null
      initialHint.value = null
      showRestoreTip.value = false
      restoreTipMessage.value = ''
      // 重新开始游戏
      restartGame()
    }
  })
}

function restartGame() {
  // 重新读取配置（可能已更改）
  const config = getGameConfig('city')
  enableTimer.value = config.enableTimer
  maxAttempts.value = config.maxAttempts
  showInitialHint.value = config.showInitialHint
  
  const city = getRandomCity()
  if (!city) {
    console.error('Failed to get random city')
    return
  }
  targetCity.value = city
  attempts.value = 0
  inputValue.value = ''
  guessHistory.value = []
  usedFeatures.value = []
  gameOver.value = false
  gameWon.value = false
  showInputError.value = false
  showCelebration.value = false
  smartHint.value = null
  gameStartTime.value = Date.now()
  
  // 重置倒计时（仅在启用时）
  if (enableTimer.value) {
    timer.reset(config.timerDuration * 60)
    timer.start()
  }
  
  // 设置初始提示
  if (showInitialHint.value) {
    const initialFeature = getCityFeature(city, [])
    if (initialFeature) {
      initialHint.value = initialFeature
      usedFeatures.value.push(initialFeature)
    } else {
      initialHint.value = null
    }
  } else {
    initialHint.value = null
  }
  
  saveGameState()
}

function saveGameState() {
  if (targetCity.value) {
    const state = {
      targetCity: targetCity.value.name,
      attempts: attempts.value,
      guessHistory: guessHistory.value,
      usedFeatures: usedFeatures.value,
      initialHint: initialHint.value,
      gameOver: gameOver.value,
      gameWon: gameWon.value,
      gameStartTime: gameStartTime.value
    }
    saveToStorage('cityGuessGame', state)
  }
}

function loadGameState() {
  const saved = loadFromStorage('cityGuessGame', null)
  if (saved) {
    try {
      const state = saved as any
      const city = getAllCityNames().find(c => c === state.targetCity)
      if (city) {
        const matched = matchCity(city)
        if (matched) {
          targetCity.value = matched
          attempts.value = state.attempts || 0
          guessHistory.value = state.guessHistory || []
          usedFeatures.value = state.usedFeatures || []
          initialHint.value = state.initialHint || null
          gameOver.value = state.gameOver || false
          gameWon.value = state.gameWon || false
          gameStartTime.value = state.gameStartTime || Date.now()
          
          // 如果加载的状态没有初始提示，但游戏还没开始，则设置初始提示
          if (!initialHint.value && attempts.value === 0 && !gameOver.value && !gameWon.value) {
            const initialFeature = getCityFeature(matched, [])
            if (initialFeature) {
              initialHint.value = initialFeature
              usedFeatures.value.push(initialFeature)
              saveGameState()
            }
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
  const config = getGameConfig('city')
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
  if (targetCity.value && showInitialHint.value && !initialHint.value && attempts.value === 0) {
    console.log('警告：游戏已开始但没有初始提示，正在修复...')
    const initialFeature = getCityFeature(targetCity.value, [])
    if (initialFeature) {
      initialHint.value = initialFeature
      usedFeatures.value.push(initialFeature)
      saveGameState()
    }
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
