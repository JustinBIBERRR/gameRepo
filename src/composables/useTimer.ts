import { saveTimerState, loadTimerState, clearTimerState } from '../utils/storageUtils'

export function useTimer(initialDuration: number, gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong', onTimeout?: () => void) {
  const timeRemaining = ref(initialDuration)
  const isRunning = ref(false)
  const startTime = ref<number | null>(null)
  const pausedTime = ref<number | null>(null)
  let intervalId: number | null = null

  // 格式化时间为 MM:SS
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60)
    const seconds = timeRemaining.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  // 是否少于1分钟（用于视觉警告）
  const isWarning = computed(() => timeRemaining.value < 60)

  // 保存状态到 sessionStorage
  function saveState() {
    if (isRunning.value && startTime.value !== null) {
      saveTimerState({
        gameType,
        startTime: startTime.value,
        remainingSeconds: timeRemaining.value,
        isRunning: true
      })
    }
  }

  // 从 sessionStorage 恢复状态
  function restoreState(): boolean {
    const savedState = loadTimerState()
    if (savedState && savedState.gameType === gameType && savedState.isRunning) {
      const elapsed = Math.floor((Date.now() - savedState.startTime) / 1000)
      timeRemaining.value = Math.max(0, savedState.remainingSeconds - elapsed)
      
      if (timeRemaining.value > 0) {
        // 重新计算开始时间，使得倒计时从当前剩余时间继续
        startTime.value = Date.now() - (initialDuration - timeRemaining.value) * 1000
        isRunning.value = true
        startInterval()
        return true // 返回 true 表示已恢复
      } else {
        // 时间已用完
        clearTimerState()
        timeRemaining.value = 0
        isRunning.value = false
        if (onTimeout) {
          onTimeout()
        }
      }
    }
    return false
  }

  // 开始倒计时
  function start() {
    if (isRunning.value) return
    
    startTime.value = Date.now()
    isRunning.value = true
    startInterval()
    saveState()
  }

  // 暂停倒计时
  function pause() {
    if (!isRunning.value) return
    
    isRunning.value = false
    pausedTime.value = Date.now()
    stopInterval()
    saveState()
  }

  // 重置倒计时
  function reset(newDuration?: number) {
    stopInterval()
    isRunning.value = false
    startTime.value = null
    pausedTime.value = null
    timeRemaining.value = newDuration ?? initialDuration
    clearTimerState()
  }

  // 开始定时器
  function startInterval() {
    stopInterval()
    intervalId = window.setInterval(() => {
      if (startTime.value !== null) {
        const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
        const remaining = initialDuration - elapsed
        
        if (remaining <= 0) {
          timeRemaining.value = 0
          stopInterval()
          isRunning.value = false
          clearTimerState()
          if (onTimeout) {
            onTimeout()
          }
        } else {
          timeRemaining.value = remaining
          saveState()
        }
      }
    }, 1000)
  }

  // 停止定时器
  function stopInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // 处理页面可见性变化
  function handleVisibilityChange() {
    if (document.hidden) {
      // 页面隐藏时暂停
      if (isRunning.value) {
        pause()
      }
    } else {
      // 页面显示时恢复
      if (pausedTime.value !== null && startTime.value !== null) {
        const pauseDuration = Math.floor((Date.now() - pausedTime.value) / 1000)
        startTime.value += pauseDuration * 1000
        pausedTime.value = null
        isRunning.value = true
        startInterval()
        saveState()
      }
    }
  }

  // 组件挂载时
  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    // 尝试恢复状态
    restoreState()
  })

  // 组件卸载时
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    stopInterval()
    saveState()
  })

  return {
    timeRemaining,
    isRunning,
    formattedTime,
    isWarning,
    start,
    pause,
    reset,
    restoreState,
    saveState
  }
}
