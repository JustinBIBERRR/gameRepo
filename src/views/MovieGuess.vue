<template>
  <div class="min-h-screen">
    <Navigation />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <!-- 游戏头部（标题、倒计时、提示、进度条） -->
        <GameHeader
          title="听片段猜电影"
          description="系统随机选择了一部电影，你有"
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
          hint-prefix="这是一部"
          hint-suffix="电影"
          @clear="clearAndRestart"
        />

        <!-- 游戏进行中 -->
        <div v-if="!gameOver && !gameWon">
          <!-- 时间段选择器和播放按钮 -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">选择时间段并播放</h2>
            <TimeRangeSelector
              :max-duration="targetMovie?.duration || 0"
              :value="selectedTimePoint"
              :played-time-points="Array.from(playedTimePoints)"
              :segment-duration="15"
              :disabled="isPlaying"
              @change="handleTimePointChange"
            />
            
            <!-- 播放按钮 -->
            <div class="mt-4 flex items-center gap-4">
              <button
                @click="handlePlayAudio"
                :disabled="!canPlayAudio || isPlaying"
                class="px-8 py-3 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                :class="{
                  'bg-blue-600 text-white hover:bg-blue-700': !hasPlayedCurrentSegment && !isPlaying,
                  'bg-green-600 text-white': isPlaying,
                  'bg-gray-400 text-white cursor-not-allowed': !canPlayAudio || hasPlayedCurrentSegment
                }"
              >
                <!-- 播放中状态 -->
                <template v-if="isPlaying">
                  <svg class="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <span class="animate-pulse">播放中...</span>
                </template>
                <!-- 已播放状态 -->
                <template v-else-if="hasPlayedCurrentSegment">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span>已播放此片段</span>
                </template>
                <!-- 未播放状态 -->
                <template v-else>
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                  </svg>
                  <span>播放音频</span>
                </template>
              </button>
              <p v-if="hasPlayedCurrentSegment && !isPlaying" class="text-sm text-gray-600">
                该时间段已播放过，请选择其他时间段
              </p>
              <p v-if="isPlaying" class="text-sm text-green-600 animate-pulse">
                正在播放音频，请仔细聆听...
              </p>
            </div>
            
            <!-- 隐藏的视频播放器（仅用于音频播放） -->
            <div v-if="targetMovie" class="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
              <VideoPlayer
                ref="videoPlayerRef"
                :video-url="currentVideoUrl"
                :video-file="currentVideoFile || undefined"
                :movie-id="targetMovie.id"
                :video-type="currentVideoType"
                :api-provider="targetMovie.apiProvider"
                :start-time="selectedTimePoint"
                :duration="15"
                :audio-only="true"
                :auto-play="false"
              />
            </div>
          </div>

          <!-- 猜测输入 -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">猜测电影名称</h2>
            <Autocomplete
              v-model="inputValue"
              :suggestions="suggestions"
              :no-match-message="noMatchMessage"
              :show-error="showInputError"
              placeholder="输入电影名称..."
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
                <span class="text-lg font-medium text-gray-900">{{ guess.movieName }}</span>
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="{
                      'bg-green-100 text-green-700': guess.isCorrect,
                      'bg-red-100 text-red-700': !guess.isCorrect
                    }"
                  >
                    {{ guess.isCorrect ? '正确' : '错误' }}
                  </span>
                  <span class="text-sm text-gray-500">第 {{ index + 1 }} 次猜测</span>
                </div>
              </div>
              <div class="text-sm text-gray-600">
                时间点：{{ formatTime(guess.timePoint) }}
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
              目标电影是 <span class="font-bold text-blue-600">{{ targetMovie?.name }}</span>，
              你用了 <span class="font-bold">{{ attempts }}</span> 次猜测。
            </p>
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
              目标电影是 <span class="font-bold text-blue-600">{{ targetMovie?.name }}</span>
            </p>
            <button
              @click="restartGame"
              class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              再来一局
            </button>
          </div>
        </Transition>

        <!-- 回顾功能（游戏结束后） -->
        <div v-if="gameOver || gameWon" class="mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">回顾片段</h2>
          
          <!-- 时间轴可视化 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">已播放的时间段</h3>
            <TimeRangeSelector
              :max-duration="targetMovie?.duration || 0"
              :value="reviewingTimePoint !== null ? reviewingTimePoint : selectedTimePoint"
              :played-time-points="Array.from(playedTimePoints)"
              :segment-duration="15"
              @change="handleReviewTimePointChange"
            />
          </div>
          
          <!-- 视频播放器（始终存在，复用DOM） -->
          <div v-if="targetMovie" class="mt-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ reviewingTimePoint !== null ? '播放视频片段' : '选择一个时间段开始回顾' }}
            </h3>
            <VideoPlayer
              ref="reviewPlayerRef"
              :key="`review-${targetMovie.id}`"
              :video-url="currentVideoUrl"
              :video-file="currentVideoFile || undefined"
              :movie-id="targetMovie.id"
              :video-type="currentVideoType"
              :api-provider="targetMovie.apiProvider"
              :start-time="reviewingTimePoint !== null ? reviewingTimePoint : 0"
              :duration="15"
              :audio-only="false"
              :auto-play="false"
            />
            <div v-if="reviewingTimePoint === null" class="text-center py-8 text-gray-500">
              <p>点击下方的历史记录或拖动时间轴来选择要回顾的片段</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">猜测历史</h3>
            <div
              v-for="(guess, index) in guessHistory"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
              :class="{ 'border-blue-500 bg-blue-50': reviewingTimePoint === guess.timePoint }"
              @click="playReviewVideo(guess.timePoint)"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="text-lg font-medium text-gray-900">{{ guess.movieName }}</span>
                <span class="text-sm text-gray-500">时间段：{{ formatTime(guess.timePoint) }} - {{ formatTime(Math.min(guess.timePoint + 15, targetMovie?.duration || 0)) }}</span>
              </div>
              <div class="text-sm text-gray-600">
                {{ guess.isCorrect ? '✓ 正确' : '✗ 错误' }}
              </div>
            </div>
          </div>
        </div>

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
import TimeRangeSelector from '../components/TimeRangeSelector.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import { useModal } from '../composables/useModal'
import { useTimer } from '../composables/useTimer'
import {
  getRandomMovie,
  getMovieById,
  matchMovie,
  searchMovies,
  formatTime,
  getAllMovies,
  type Movie
} from '../utils/movieUtils'
import { 
  updateGameStats, 
  saveGameState as saveToStorage, 
  loadGameState as loadFromStorage,
  getGameConfig,
  clearTimerState
} from '../utils/storageUtils'
import { checkAndUpdateAchievements } from '../utils/achievementUtils'
import { getMovieFiles } from '../utils/movieStorage'
import { selectPlaybackMethod } from '../utils/moviePlayback'
import { videoPreloader } from '../utils/videoPreloader'
import type { LocalMovieFiles } from '../utils/movieStorage'

const router = useRouter()
const { confirm: showConfirm } = useModal()

interface GuessRecord {
  timePoint: number
  movieName: string
  isCorrect: boolean
}

// 读取游戏配置
const gameConfig = getGameConfig('movie')
const enableTimer = ref(gameConfig.enableTimer)
const maxAttempts = ref(gameConfig.maxAttempts)
const showInitialHint = ref(gameConfig.showInitialHint)
const maxPlaybackPerSegment = ref(gameConfig.maxPlaybackPerSegment || 1)
const timerDuration = gameConfig.timerDuration * 60 // 转换为秒
const targetMovie = ref<Movie | null>(null)
const attempts = ref(0)
const inputValue = ref('')
const initialHint = ref<string | null>(null)
const selectedTimePoint = ref(0)
const playedTimePoints = ref<Set<number>>(new Set()) // 已播放的时间点集合（每个时间点只能播放一次）
const guessHistory = ref<GuessRecord[]>([])
const gameOver = ref(false)
const gameWon = ref(false)
const showInputError = ref(false)
const showCelebration = ref(false)
const celebrationType = ref<'success' | 'failure' | 'achievement'>('success')
const celebrationTitle = ref('')
const celebrationMessage = ref('')
const gameStartTime = ref<number>(0)
const showRestoreTip = ref(false)
const restoreTipMessage = ref('')
const reviewingTimePoint = ref<number | null>(null)
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const reviewPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const movieFiles = ref<LocalMovieFiles | null>(null)
const currentVideoFile = ref<File | null>(null)
const currentVideoUrl = ref<string>('')
const currentVideoType = ref<'api' | 'local'>('api')
const isPlaying = ref(false) // 是否正在播放

// 倒计时超时处理
function handleTimerTimeout() {
  if (!gameWon.value) {
    gameOver.value = true
    updateGameStats('movie', false, attempts.value)
    
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
const timer = useTimer(enableTimer.value ? timerDuration : 0, 'movie', handleTimerTimeout)

const suggestions = computed(() => {
  if (!inputValue.value.trim()) {
    return []
  }
  return searchMovies(inputValue.value).map(m => m.name)
})

const noMatchMessage = computed(() => {
  return '该电影不在游戏范围内，请输入正确的电影名称'
})

const canSubmit = computed(() => {
  if (!inputValue.value.trim()) return false
  const matched = matchMovie(inputValue.value)
  return matched !== null
})

// 检查当前时间点是否已播放
const hasPlayedCurrentSegment = computed(() => {
  return playedTimePoints.value.has(selectedTimePoint.value)
})

// 是否可以播放音频（每个片段只能播放一次）
const canPlayAudio = computed(() => {
  return !hasPlayedCurrentSegment.value && targetMovie.value !== null
})

// 加载电影文件
async function loadMovieFiles() {
  if (!targetMovie.value) return
  
  try {
    const files = await getMovieFiles(targetMovie.value.id)
    movieFiles.value = files
    
    // 如果视频已经预加载，直接使用，无需等待
    if (files && files.sourceFile && videoPreloader.isPreloaded(targetMovie.value.id)) {
      // 视频已预加载，可以直接播放，无需等待
      // 如果电影时长为0，从预加载的视频中获取
      if (!targetMovie.value.duration || targetMovie.value.duration === 0) {
        const preloadedDuration = videoPreloader.getVideoDuration(targetMovie.value.id)
        if (preloadedDuration && preloadedDuration > 0) {
          targetMovie.value.duration = Math.floor(preloadedDuration)
        }
      }
      await updatePlaybackSource(selectedTimePoint.value)
      return
    }
    
    // 如果没有预加载，尝试预加载（但这种情况应该很少，因为配置页面已经预加载了）
    if (files && files.sourceFile && !videoPreloader.isPreloaded(targetMovie.value.id)) {
      // 异步预加载，不阻塞游戏开始
      videoPreloader.preloadVideo(targetMovie.value.id, files.sourceFile).then(() => {
        // 预加载完成后，更新时长
        if (targetMovie.value && (!targetMovie.value.duration || targetMovie.value.duration === 0)) {
          const preloadedDuration = videoPreloader.getVideoDuration(targetMovie.value.id)
          if (preloadedDuration && preloadedDuration > 0) {
            targetMovie.value.duration = Math.floor(preloadedDuration)
          }
        }
      }).catch(error => {
        console.warn('预加载视频失败（不影响游戏）:', error)
      })
    }
    
    // 根据智能选择设置播放源
    await updatePlaybackSource(selectedTimePoint.value)
  } catch (error) {
    console.error('加载电影文件失败:', error)
    // 如果加载失败，使用在线API（如果有）
    if (targetMovie.value.videoUrl) {
      currentVideoType.value = 'api'
      currentVideoUrl.value = targetMovie.value.videoUrl
    }
  }
}

// 更新播放源（根据智能选择）
async function updatePlaybackSource(timePoint: number) {
  if (!targetMovie.value) return
  
  // 如果有本地文件，使用智能选择
  if (movieFiles.value) {
    const method = selectPlaybackMethod(timePoint, movieFiles.value)
    
    if (method) {
      if (method.method === 'segment' && method.segment) {
        // 使用关键片段（快速模式）
        currentVideoType.value = 'local'
        currentVideoFile.value = method.segment.videoFile
        currentVideoUrl.value = ''
      } else if (method.method === 'precise' && method.sourceFile) {
        // 使用原文件（精确模式）
        currentVideoType.value = 'local'
        currentVideoFile.value = method.sourceFile
        currentVideoUrl.value = ''
      }
      return
    }
  }
  
  // 如果没有本地文件或选择失败，使用在线API（如果有）
  if (targetMovie.value.videoUrl) {
    currentVideoType.value = 'api'
    currentVideoUrl.value = targetMovie.value.videoUrl
    currentVideoFile.value = null
  } else {
    // 没有可用的视频源
    currentVideoType.value = 'api'
    currentVideoUrl.value = ''
    currentVideoFile.value = null
  }
}

// 处理时间点变化
async function handleTimePointChange(seconds: number) {
  selectedTimePoint.value = seconds
  await updatePlaybackSource(seconds)
}

// 处理播放音频
async function handlePlayAudio() {
  if (!canPlayAudio.value || !targetMovie.value || isPlaying.value) return
  
  // 检查是否有可用的视频源
  const hasSource = currentVideoFile.value !== null || 
                    (currentVideoType.value === 'api' && currentVideoUrl.value) ||
                    (currentVideoType.value === 'local' && currentVideoUrl.value)
  
  if (!hasSource) {
    showConfirm({
      title: '视频资源未配置',
      message: '当前电影的视频资源未配置，无法播放音频。请在设置页面配置本地视频文件，或在电影数据文件中添加有效的视频URL。',
      confirmText: '确定',
      cancelText: ''
    })
    return
  }
  
  // 立即标记该时间点已播放（防止用户刷新页面绕过限制）
  playedTimePoints.value.add(selectedTimePoint.value)
  
  // 设置播放状态
  isPlaying.value = true
  
  // 保存游戏状态（确保已播放时间点被持久化）
  saveGameState()
  
  // 播放音频
  if (videoPlayerRef.value) {
    videoPlayerRef.value.play()
  }
  
  // 15秒后自动停止（音频时长）
  setTimeout(() => {
    isPlaying.value = false
    // 再次保存状态（更新播放状态）
    saveGameState()
  }, 15000) // 15秒
}

// 处理选择
function handleSelect(movieName: string) {
  inputValue.value = movieName
}

// 处理猜测
function handleGuess() {
  if (!canSubmit.value) {
    showInputError.value = true
    return
  }

  showInputError.value = false
  const matchedMovie = matchMovie(inputValue.value)
  
  if (!matchedMovie || !targetMovie.value) {
    return
  }

  // 先增加尝试次数
  attempts.value++

  // 检查是否猜中
  const isCorrect = matchedMovie.id === targetMovie.value.id
  
  // 添加到历史记录
  guessHistory.value.push({
    timePoint: selectedTimePoint.value,
    movieName: matchedMovie.name,
    isCorrect
  })

  if (isCorrect) {
    gameWon.value = true
    timer.pause()
    clearTimerState()
    const stats = updateGameStats('movie', true, attempts.value)
    
    // 检查成就
    const newlyUnlocked = checkAndUpdateAchievements('movie', stats)
    
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

  inputValue.value = ''

  // 检查是否用尽机会
  if (attempts.value >= maxAttempts.value) {
    gameOver.value = true
    timer.pause()
    clearTimerState()
    updateGameStats('movie', false, attempts.value)
    
    // 显示失败鼓励动画
    celebrationType.value = 'failure'
    celebrationTitle.value = '再试试！'
    celebrationMessage.value = `目标电影是 ${targetMovie.value.name}，下次一定能猜中！`
    showCelebration.value = true
  }

  saveGameState()
}

// 处理回顾时间点变化
async function handleReviewTimePointChange(timePoint: number) {
  reviewingTimePoint.value = timePoint
  await updatePlaybackSource(timePoint)
  // 等待VideoPlayer更新
  await new Promise(resolve => setTimeout(resolve, 50))
  // 自动播放
  if (reviewPlayerRef.value) {
    reviewPlayerRef.value.play()
  }
}

// 播放回顾视频
async function playReviewVideo(timePoint: number) {
  reviewingTimePoint.value = timePoint
  // 更新播放源到对应的时间点
  await updatePlaybackSource(timePoint)
  // 等待VideoPlayer更新props
  await new Promise(resolve => setTimeout(resolve, 50))
  // 播放视频
  if (reviewPlayerRef.value) {
    reviewPlayerRef.value.play()
  }
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
      sessionStorage.removeItem('movieGuessGame')
      // 清除倒计时状态
      clearTimerState()
      // 重置所有状态
      targetMovie.value = null
      attempts.value = 0
      inputValue.value = ''
      selectedTimePoint.value = 0
      playedTimePoints.value = new Set()
      guessHistory.value = []
      gameOver.value = false
      gameWon.value = false
      showInputError.value = false
      showCelebration.value = false
      reviewingTimePoint.value = null
      showRestoreTip.value = false
      restoreTipMessage.value = ''
      // 重新开始游戏
      restartGame()
    }
  })
}

async function restartGame() {
  // 重新读取配置（可能已更改）
  const config = getGameConfig('movie')
  enableTimer.value = config.enableTimer
  maxAttempts.value = config.maxAttempts
  showInitialHint.value = config.showInitialHint
  maxPlaybackPerSegment.value = config.maxPlaybackPerSegment || 1
  
  // 检查是否有注册的电影
  const movies = await getAllMovies()
  if (movies.length === 0) {
    showConfirm({
      title: '没有电影',
      message: '请先在设置页面注册至少一部电影才能开始游戏。',
      confirmText: '去设置',
      cancelText: '取消'
    }).then((result) => {
      if (result) {
        router.push('/settings')
      }
    })
    return
  }
  
  const movie = await getRandomMovie()
  if (!movie) {
    console.error('Failed to get random movie')
    return
  }
  targetMovie.value = movie
  attempts.value = 0
  inputValue.value = ''
  selectedTimePoint.value = 0
  playedTimePoints.value = new Set()
  guessHistory.value = []
  gameOver.value = false
  gameWon.value = false
  showInputError.value = false
  showCelebration.value = false
  reviewingTimePoint.value = null
  gameStartTime.value = Date.now()
  
  // 设置初始提示
  if (showInitialHint.value && movie.hint) {
    initialHint.value = movie.hint
  } else {
    initialHint.value = null
  }
  
  // 加载电影文件
  await loadMovieFiles()
  
  // 如果电影时长为0，尝试从预加载的视频中获取
  if (targetMovie.value && (!targetMovie.value.duration || targetMovie.value.duration === 0)) {
    const preloadedDuration = videoPreloader.getVideoDuration(targetMovie.value.id)
    if (preloadedDuration && preloadedDuration > 0) {
      targetMovie.value.duration = Math.floor(preloadedDuration)
    }
  }
  
  // 重置倒计时（仅在启用时）
  if (enableTimer.value) {
    timer.reset(config.timerDuration * 60)
    timer.start()
  }
  
  saveGameState()
}

function saveGameState() {
  if (targetMovie.value) {
    // 将Set转换为数组以便序列化
    const playedTimePointsArray = Array.from(playedTimePoints.value)
    
    const state = {
      targetMovie: targetMovie.value.id,
      attempts: attempts.value,
      playedTimePoints: playedTimePointsArray,
      guessHistory: guessHistory.value,
      gameOver: gameOver.value,
      gameWon: gameWon.value,
      gameStartTime: gameStartTime.value,
      selectedTimePoint: selectedTimePoint.value
    }
    saveToStorage('movieGuessGame', state)
  }
}

async function loadGameState() {
  const saved = loadFromStorage('movieGuessGame', null)
  if (saved) {
    try {
      const state = saved as any
      // 根据ID查找电影
      const movie = await getMovieById(state.targetMovie)
      if (movie) {
        targetMovie.value = movie
        attempts.value = state.attempts || 0
        selectedTimePoint.value = state.selectedTimePoint || 0
        
        // 恢复已播放的时间点（将数组转换回Set）
        playedTimePoints.value = new Set()
        if (state.playedTimePoints && Array.isArray(state.playedTimePoints)) {
          state.playedTimePoints.forEach((timePoint: number) => {
            playedTimePoints.value.add(timePoint)
          })
        }
        
        guessHistory.value = state.guessHistory || []
        gameOver.value = state.gameOver || false
        gameWon.value = state.gameWon || false
        gameStartTime.value = state.gameStartTime || Date.now()
        
        // 恢复初始提示
        if (showInitialHint.value && movie.hint) {
          initialHint.value = movie.hint
        } else {
          initialHint.value = null
        }
        
        // 加载电影文件
        await loadMovieFiles()
        
        return true
      }
    } catch (e) {
      console.error('Failed to load game state:', e)
    }
  }
  return false
}

onMounted(async () => {
  // 先加载电影列表到缓存
  await getAllMovies()
  
  // 重新读取配置（确保使用最新配置）
  const config = getGameConfig('movie')
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
  
  const gameStateRestored = await loadGameState()
  if (!gameStateRestored) {
    await restartGame()
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
