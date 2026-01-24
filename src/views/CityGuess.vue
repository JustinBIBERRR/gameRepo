<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">城市猜测游戏</h1>
            <p class="text-gray-600">
              系统随机选择了一个国内城市，你有 <span class="font-bold text-blue-600">{{ maxAttempts - attempts }}</span> 次猜测机会！
            </p>
          </div>
          <button
            @click="clearAndRestart"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px] self-start sm:self-auto"
            aria-label="清除数据并重新开始"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清除数据
            </span>
          </button>
        </div>

        <!-- 进度条 -->
        <div v-if="!gameOver && !gameWon" class="mb-6">
          <ProgressBar
            :current="attempts"
            :max="maxAttempts"
            :closeness="closenessPercentage"
            :closeness-text="closenessText"
          />
        </div>

        <!-- 初始提示 -->
        <div v-if="initialHint && !gameOver && !gameWon" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <span class="text-2xl mr-2">💡</span>
            <div>
              <div class="font-semibold text-blue-900 mb-1">初始提示</div>
              <div class="text-blue-800">这是一个<span class="font-bold">{{ initialHint }}</span></div>
            </div>
          </div>
        </div>

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

          <!-- 距离趋势图表 -->
          <div v-if="guessHistory.length > 0" class="mb-6">
            <DistanceChart
              :cities="guessHistory.map(g => g.cityName)"
              :distances="guessHistory.map(g => g.distance)"
              :target-distance="0"
              :game-over="gameOver"
              :game-won="gameWon"
            />
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
                <span class="text-sm text-gray-500">第 {{ index + 1 }} 次猜测</span>
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
            <!-- 距离趋势图表 -->
            <div v-if="guessHistory.length > 0" class="mb-6">
              <DistanceChart
                :cities="guessHistory.map(g => g.cityName)"
                :distances="guessHistory.map(g => g.distance)"
                :target-distance="0"
                :game-over="gameOver"
                :game-won="gameWon"
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
              目标城市是 <span class="font-bold text-blue-600">{{ targetCity?.name }}</span>
            </p>
            <!-- 距离趋势图表 -->
            <div v-if="guessHistory.length > 0" class="mb-6">
              <DistanceChart
                :cities="guessHistory.map(g => g.cityName)"
                :distances="guessHistory.map(g => g.distance)"
                :target-distance="0"
                :game-over="gameOver"
                :game-won="gameWon"
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
import { ref, computed, onMounted } from 'vue'
import Navigation from '../components/Navigation.vue'
import Autocomplete from '../components/Autocomplete.vue'
import ProgressBar from '../components/ProgressBar.vue'
import DistanceChart from '../components/DistanceChart.vue'
import Celebration from '../components/Celebration.vue'
import { useModal } from '../composables/useModal'
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
import { updateGameStats, saveGameState as saveToStorage, loadGameState as loadFromStorage } from '../utils/storageUtils'
import { checkAndUpdateAchievements } from '../utils/achievementUtils'

const { confirm: showConfirm } = useModal()

const maxAttempts = 5
const targetCity = ref<City | null>(null)
const attempts = ref(0)
const inputValue = ref('')
const initialHint = ref<string | null>(null)
const guessHistory = ref<Array<{
  cityName: string
  distance: number
  direction: string
  feature: string | null
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

const closenessText = computed(() => {
  if (closenessPercentage.value === null) return ''
  if (closenessPercentage.value >= 80) return '非常接近！'
  if (closenessPercentage.value >= 60) return '比较接近'
  if (closenessPercentage.value >= 40) return '有点接近'
  return '继续努力'
})


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

  // 检查是否猜中
  if (guessedCity.name === targetCity.value.name) {
    gameWon.value = true
    const stats = updateGameStats('city', true, attempts.value + 1)
    
    // 检查成就
    const newlyUnlocked = checkAndUpdateAchievements('city', stats)
    
    // 显示庆祝动画
    celebrationType.value = 'success'
    celebrationTitle.value = '恭喜！'
    celebrationMessage.value = `你用了 ${attempts.value + 1} 次猜测就找到了答案！`
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

  // 生成智能提示
  if (guessHistory.value.length > 0) {
    const lastDistance = guessHistory.value[guessHistory.value.length - 1].distance
    if (distance < lastDistance) {
      smartHint.value = `很好！这次比上次更近了 ${Math.round(lastDistance - distance)} 公里！`
    } else if (distance > lastDistance) {
      smartHint.value = `这次比上次远了 ${Math.round(distance - lastDistance)} 公里，换个方向试试？`
    } else {
      smartHint.value = '距离和上次差不多，试试其他方向的城市？'
    }
  } else {
    smartHint.value = null
  }

  // 添加到历史记录
  guessHistory.value.push({
    cityName: guessedCity.name,
    distance,
    direction,
    feature
  })

  attempts.value++
  inputValue.value = ''

  // 检查是否用尽机会
  if (attempts.value >= maxAttempts) {
    gameOver.value = true
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
      // 重新开始游戏
      restartGame()
    }
  })
}

function restartGame() {
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
  
  // 设置初始提示
  const initialFeature = getCityFeature(city, [])
  if (initialFeature) {
    initialHint.value = initialFeature
    usedFeatures.value.push(initialFeature)
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
  if (!loadGameState()) {
    restartGame()
  } else {
    // 如果加载了游戏状态但没有开始时间，设置当前时间
    if (!gameStartTime.value) {
      gameStartTime.value = Date.now()
    }
  }
  // 调试：确保初始提示已设置
  if (targetCity.value && !initialHint.value && attempts.value === 0) {
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
