<template>
  <div class="video-player-container">
    <!-- 在线视频API（第一阶段） -->
    <div v-if="videoType === 'api'" class="api-video-wrapper">
      <div v-if="!hasValidVideoUrl" class="error-placeholder">
        <div class="flex flex-col items-center justify-center h-64 bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <svg class="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-600 font-semibold mb-2">视频资源未配置</p>
          <p class="text-sm text-red-500 text-center">
            请在电影数据文件中配置有效的视频URL或视频ID
          </p>
          <p class="text-xs text-red-400 mt-2 text-center">
            B站视频需要填写BV号（如：BV1xx411c7mD）或av号（如：av12345678）
          </p>
        </div>
      </div>
      <div v-else-if="audioOnly" class="audio-only-placeholder">
        <div class="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <p class="text-gray-600">正在播放音频...</p>
          <p class="text-sm text-gray-500 mt-2">{{ formattedTime }}</p>
          <!-- 隐藏的iframe用于播放音频 -->
          <iframe
            :src="iframeSrc"
            class="hidden"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      </div>
      <iframe
        v-else
        :src="iframeSrc"
        class="w-full h-64 rounded-lg"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <!-- 本地视频文件（混合方案） -->
    <div v-else-if="videoType === 'local'" class="local-video-wrapper">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg p-6">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600 font-medium">{{ loadingMessage }}</p>
        <p v-if="loadingProgress > 0" class="text-sm text-gray-500 mt-2">
          加载进度: {{ Math.round(loadingProgress) }}%
        </p>
        <div v-if="loadingProgress > 0" class="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-4">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${loadingProgress}%` }"
          ></div>
        </div>
      </div>
      
      <!-- 视频播放器 -->
      <div v-else>
        <!-- 统一的video元素，根据audioOnly决定是否隐藏 -->
        <video
          v-if="videoObjectUrl"
          ref="videoElement"
          :src="videoObjectUrl"
          :class="{ 'fixed -left-[9999px] -top-[9999px] opacity-0': audioOnly }"
          class="w-full rounded-lg"
          :preload="props.movieId && videoPreloader.isPreloaded(props.movieId) ? 'auto' : 'metadata'"
          @loadedmetadata="handleLoadedMetadata"
          @timeupdate="handleTimeUpdate"
          @ended="handleEnded"
          @progress="handleProgress"
          @canplay="handleCanPlay"
          @waiting="handleWaiting"
        ></video>
        <!-- 音频模式占位符 -->
        <div v-if="audioOnly && !isLoading && videoObjectUrl" class="audio-only-placeholder">
          <div class="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
            <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p class="text-gray-600">正在播放音频...</p>
            <p class="text-sm text-gray-500 mt-2">{{ formattedTime }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="mt-4 flex items-center gap-4">
      <button
        @click="togglePlay"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {{ isPlaying ? '暂停' : '播放' }}
      </button>
      <div class="flex-1">
        <div class="text-sm text-gray-600 mb-1">
          {{ formattedCurrentTime }} / {{ formattedDuration }}
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { videoPreloader } from '../utils/videoPreloader'

interface Props {
  videoUrl?: string
  videoFile?: File  // 本地视频文件（File对象）
  movieId?: string  // 电影ID（用于使用预加载的视频）
  videoType: 'api' | 'local'
  apiProvider?: 'youtube' | 'bilibili' | 'other'
  startTime?: number  // 开始时间（秒）
  duration?: number   // 播放时长（秒，默认15秒）
  audioOnly?: boolean // 是否只播放音频
  autoPlay?: boolean  // 是否自动播放
}

const props = withDefaults(defineProps<Props>(), {
  startTime: 0,
  duration: 15,
  audioOnly: false,
  autoPlay: false
})

const videoElement = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const videoDuration = ref(0)
const isLoading = ref(false)
const loadingMessage = ref('正在加载视频...')
const loadingProgress = ref(0)
const videoObjectUrl = ref<string>('')
const isPreloadedUrl = ref(false)  // 标记是否使用预加载的URL
let playTimer: number | null = null
let canPlayTimeout: number | null = null

// 格式化时间
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(props.duration))
const formattedTime = computed(() => `${formattedCurrentTime.value} / ${formattedDuration.value}`)
const progressPercent = computed(() => {
  if (props.duration === 0) return 0
  return Math.min(100, (currentTime.value / props.duration) * 100)
})

// 生成iframe src（用于在线视频API）
const iframeSrc = computed(() => {
  if (props.videoType !== 'api' || !props.videoUrl) return ''
  
  if (props.apiProvider === 'youtube') {
    // YouTube embed URL
    return `https://www.youtube.com/embed/${props.videoUrl}?start=${Math.floor(props.startTime)}&autoplay=${props.autoPlay ? 1 : 0}`
  } else if (props.apiProvider === 'bilibili') {
    // B站 embed URL
    // 支持bvid格式：BVxxxxxxxxxx
    // 或者av号格式：av12345678
    let videoId = props.videoUrl
    if (videoId.startsWith('BV') || videoId.startsWith('bv')) {
      return `https://player.bilibili.com/player.html?bvid=${videoId}&page=1&autoplay=${props.autoPlay ? 1 : 0}&start=${Math.floor(props.startTime)}`
    } else if (videoId.startsWith('av') || videoId.startsWith('AV')) {
      const avNum = videoId.replace(/[^0-9]/g, '')
      return `https://player.bilibili.com/player.html?aid=${avNum}&page=1&autoplay=${props.autoPlay ? 1 : 0}&start=${Math.floor(props.startTime)}`
    } else {
      // 假设是bvid
      return `https://player.bilibili.com/player.html?bvid=${videoId}&page=1&autoplay=${props.autoPlay ? 1 : 0}&start=${Math.floor(props.startTime)}`
    }
  }
  
  return ''
})

// 检查是否有有效的视频URL或文件
const hasValidVideoUrl = computed(() => {
  if (props.videoType === 'api') {
    return !!props.videoUrl && iframeSrc.value !== ''
  } else if (props.videoType === 'local') {
    // 检查是否有预加载的视频、文件或URL
    if (props.movieId && videoPreloader.isPreloaded(props.movieId)) {
      return true
    }
    return !!videoObjectUrl.value || !!props.videoFile || !!props.videoUrl
  }
  return false
})

// 处理本地视频文件（优先使用预加载的视频）
watch(
  () => [props.videoFile, props.movieId, props.videoUrl] as const,
  async ([newFile, movieId, videoUrl]) => {
  if (props.videoType === 'local') {
    // 释放旧的Object URL（如果不是预加载的）
    if (videoObjectUrl.value && !isPreloadedUrl.value) {
      try {
        URL.revokeObjectURL(videoObjectUrl.value)
      } catch (e) {
        // 忽略释放失败
      }
    }
    
    // 优先使用预加载的视频（已经加载完成，可以直接使用）
    if (movieId && videoPreloader.isPreloaded(movieId)) {
      const objectUrl = videoPreloader.getPreloadedObjectUrl(movieId)
      if (objectUrl) {
        videoObjectUrl.value = objectUrl
        isPreloadedUrl.value = true  // 标记为预加载的URL
        isLoading.value = false
        loadingProgress.value = 100
        // 确保 video 元素使用正确的 src
        if (videoElement.value && objectUrl) {
          videoElement.value.src = objectUrl
          videoElement.value.load()
        }
        return
      }
    }
    
    // 如果没有预加载，使用文件
    if (newFile) {
      // 创建新的Object URL
      videoObjectUrl.value = URL.createObjectURL(newFile)
      isPreloadedUrl.value = false  // 标记为非预加载的URL
      isLoading.value = true
      loadingMessage.value = '正在加载视频文件...'
      loadingProgress.value = 0
      
      // 确保 video 元素使用正确的 src
      if (videoElement.value) {
        videoElement.value.src = videoObjectUrl.value
        videoElement.value.load()
      }
    } else if (videoUrl) {
      videoObjectUrl.value = videoUrl
      isPreloadedUrl.value = false
      // 确保 video 元素使用正确的 src
      if (videoElement.value) {
        videoElement.value.src = videoUrl
        videoElement.value.load()
      }
    } else {
      // 如果没有源，清空
      videoObjectUrl.value = ''
      isPreloadedUrl.value = false
      if (videoElement.value) {
        videoElement.value.src = ''
      }
    }
  }
}, { immediate: true })

// 清理Object URL
onUnmounted(() => {
  // 只释放非预加载的Object URL
  if (videoObjectUrl.value && !isPreloadedUrl.value) {
    try {
      URL.revokeObjectURL(videoObjectUrl.value)
    } catch (e) {
      // 忽略释放失败
    }
  }
  if (playTimer) {
    clearTimeout(playTimer)
  }
  if (canPlayTimeout) {
    clearTimeout(canPlayTimeout)
  }
})

// 播放/暂停
function togglePlay() {
  if (!hasValidVideoUrl.value) {
    console.warn('视频URL无效，无法播放')
    return
  }
  
  if (props.videoType === 'local' && videoElement.value) {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  } else if (props.videoType === 'api') {
    // 在线视频API通过iframe自动播放控制
    // 由于iframe的播放控制受限，这里主要更新状态
    isPlaying.value = !isPlaying.value
    
    // 如果设置了自动播放，iframe会自动开始播放
    // 对于音频模式，iframe是隐藏的，但仍在播放音频
    if (isPlaying.value && props.autoPlay) {
      // iframe已通过src参数自动播放，这里只需要更新状态
    }
  }
}

// 播放
async function play() {
  if (!hasValidVideoUrl.value) {
    console.warn('视频URL无效，无法播放')
    return
  }
  
  if (props.videoType === 'local' && videoElement.value) {
    // 确保 video 元素有有效的 src
    if (!videoElement.value.src && videoObjectUrl.value) {
      videoElement.value.src = videoObjectUrl.value
      // 等待视频加载
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('视频加载超时'))
        }, 5000)
        
        const handleCanPlay = () => {
          clearTimeout(timeout)
          videoElement.value?.removeEventListener('canplay', handleCanPlay)
          videoElement.value?.removeEventListener('error', handleError)
          resolve()
        }
        
        const handleError = () => {
          clearTimeout(timeout)
          videoElement.value?.removeEventListener('canplay', handleCanPlay)
          videoElement.value?.removeEventListener('error', handleError)
          reject(new Error('视频加载失败'))
        }
        
        if (videoElement.value) {
          videoElement.value.addEventListener('canplay', handleCanPlay, { once: true })
          videoElement.value.addEventListener('error', handleError, { once: true })
          videoElement.value.load()
        }
      }).catch(error => {
        console.error('视频加载失败:', error)
        return
      })
    }
    
    // 检查 video 元素是否有有效的源
    if (!videoElement.value.src) {
      console.warn('视频元素没有有效的源，无法播放')
      return
    }
    
    try {
      // 确保音量设置为最大
      videoElement.value.volume = 1.0
      // 确保不是静音
      videoElement.value.muted = false
      
      console.log('开始播放音频:', {
        src: videoElement.value.src,
        currentTime: videoElement.value.currentTime,
        volume: videoElement.value.volume,
        muted: videoElement.value.muted,
        readyState: videoElement.value.readyState,
        audioOnly: props.audioOnly
      })
      
      await videoElement.value.play()
      isPlaying.value = true
      
      console.log('音频播放成功')
      
      // 设置播放时长限制
      if (playTimer) clearTimeout(playTimer)
      playTimer = window.setTimeout(() => {
        pause()
      }, props.duration * 1000)
    } catch (error) {
      console.error('播放失败:', error)
      // 如果播放失败，尝试重新加载
      if (videoObjectUrl.value) {
        videoElement.value.src = videoObjectUrl.value
        videoElement.value.load()
      }
    }
  } else if (props.videoType === 'api') {
    // 在线API通过iframe的src参数控制播放
    // 如果iframe已存在，可以通过重新设置src来跳转到指定时间点
    isPlaying.value = true
    
    // 设置播放时长限制（对于API，这个限制可能不够精确）
    if (playTimer) clearTimeout(playTimer)
    playTimer = window.setTimeout(() => {
      // 对于iframe，无法直接暂停，只能更新状态
      isPlaying.value = false
    }, props.duration * 1000)
  }
}

// 暂停
function pause() {
  if (props.videoType === 'local' && videoElement.value) {
    videoElement.value.pause()
    isPlaying.value = false
    if (playTimer) {
      clearTimeout(playTimer)
      playTimer = null
    }
  }
}

// 跳转到指定时间
async function seek(time: number) {
  if (props.videoType === 'local' && videoElement.value) {
    // 对于大文件，等待可以播放（最多30秒）
    if (props.videoFile && props.videoFile.size > 10 * 1024 * 1024 * 1024) {
      isLoading.value = true
      loadingMessage.value = `正在跳转到 ${formatTime(time)}...（预计10-30秒）`
      loadingProgress.value = 0
      
      // 设置超时（30秒）
      canPlayTimeout = window.setTimeout(() => {
        isLoading.value = false
        loadingMessage.value = '加载超时，请尝试选择其他时间点'
        showError('加载超时')
      }, 30000)
      
      // 等待可以播放
      await new Promise<void>((resolve) => {
        const checkCanPlay = () => {
          if (videoElement.value && videoElement.value.readyState >= 3) {
            resolve()
          } else {
            setTimeout(checkCanPlay, 100)
          }
        }
        checkCanPlay()
      })
    }
    
    videoElement.value.currentTime = time
    currentTime.value = time
  }
}

// 处理视频元数据加载
function handleLoadedMetadata() {
  if (videoElement.value) {
    videoDuration.value = videoElement.value.duration
    isLoading.value = false
    loadingProgress.value = 100
    
    // 如果使用预加载的视频，已经加载完成，可以直接跳转
    const isPreloaded = props.movieId && videoPreloader.isPreloaded(props.movieId)
    
    // 跳转到开始时间
    if (props.startTime > 0) {
      // 对于预加载的视频，跳转应该很快
      if (isPreloaded) {
        // 预加载的视频，直接跳转，不需要等待
        videoElement.value.currentTime = props.startTime
        currentTime.value = props.startTime
      } else if (props.videoFile && props.videoFile.size > 10 * 1024 * 1024 * 1024) {
        // 大于10GB的文件，显示加载提示
        isLoading.value = true
        loadingMessage.value = `正在跳转到 ${formatTime(props.startTime)}...（预计10-30秒）`
        loadingProgress.value = 0
        seek(props.startTime)
      } else {
        seek(props.startTime)
      }
    }
    
    // 自动播放
    if (props.autoPlay) {
      // 预加载的视频应该已经可以播放了
      if (isPreloaded || videoElement.value.readyState >= 3) {
        // 对于视频模式（非音频模式），确保视频元素可见
        if (!props.audioOnly && videoElement.value) {
          videoElement.value.style.display = 'block'
          videoElement.value.style.visibility = 'visible'
        }
        play()
      }
    }
  }
}

// 处理缓冲进度
function handleProgress() {
  if (videoElement.value && props.videoType === 'local') {
    const buffered = videoElement.value.buffered
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1)
      const totalDuration = videoElement.value.duration || 1
      loadingProgress.value = (bufferedEnd / totalDuration) * 100
    }
  }
}

// 处理可以播放事件
function handleCanPlay() {
  isLoading.value = false
  if (canPlayTimeout) {
    clearTimeout(canPlayTimeout)
    canPlayTimeout = null
  }
  
  // 对于视频模式（非音频模式），确保视频元素可见
  if (!props.audioOnly && videoElement.value) {
    videoElement.value.style.display = 'block'
    videoElement.value.style.visibility = 'visible'
  }
  
  // 如果设置了自动播放，现在可以播放了
  if (props.autoPlay && !isPlaying.value) {
    play()
  }
}

// 处理等待事件（缓冲中）
function handleWaiting() {
  if (props.videoType === 'local' && !isLoading.value) {
    isLoading.value = true
    loadingMessage.value = '正在缓冲...'
  }
}

// 处理时间更新
function handleTimeUpdate() {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime
    // 检查是否超过播放时长
    const endTime = Math.min(props.startTime + props.duration, videoDuration.value)
    
    // 如果当前时间超过结束时间，停止播放
    if (videoElement.value.currentTime >= endTime) {
      pause()
    }
  }
}

// 处理播放结束
function handleEnded() {
  isPlaying.value = false
  if (playTimer) {
    clearTimeout(playTimer)
    playTimer = null
  }
}

// 监听startTime变化
watch(() => props.startTime, async (newTime, oldTime) => {
  if (props.videoType === 'local' && newTime !== oldTime && videoElement.value) {
    // 先暂停当前播放
    if (isPlaying.value) {
      pause()
    }
    // 跳转到新的时间点
    seek(newTime)
    // 等待跳转完成
    await new Promise(resolve => setTimeout(resolve, 100))
  }
})

// 监听autoPlay变化
watch(() => props.autoPlay, (newAutoPlay) => {
  if (newAutoPlay && props.videoType === 'local') {
    play()
  }
})

// 监听关键props组合变化，用于复用场景
watch(() => [props.startTime, props.videoFile, props.videoUrl], async ([newStartTime], [oldStartTime]) => {
  // 当startTime变化且视频已加载时，确保视频准备好播放
  if (props.videoType === 'local' && newStartTime !== oldStartTime && videoObjectUrl.value && videoElement.value) {
    // 确保视频元素已经加载
    if (videoElement.value.readyState < 2) {
      // 等待视频加载完成
      await new Promise<void>((resolve) => {
        const handleCanPlay = () => {
          videoElement.value?.removeEventListener('canplay', handleCanPlay)
          resolve()
        }
        videoElement.value?.addEventListener('canplay', handleCanPlay, { once: true })
      })
    }
  }
}, { deep: false })

onMounted(() => {
  if (props.videoType === 'local' && videoElement.value && props.autoPlay) {
    // 等待视频加载完成后再播放
    if (videoElement.value.readyState >= 2) {
      handleLoadedMetadata()
    }
  }
})

// 显示错误（简单实现）
function showError(message: string) {
  console.error(message)
  // 可以在这里添加更完善的错误提示
}

// 暴露方法供父组件调用
defineExpose({
  play,
  pause,
  seek,
  togglePlay
})
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
