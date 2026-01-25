import { ref } from 'vue'

interface LoadingState {
  visible: boolean
  message: string
  progress: number  // 0-100
  showProgress: boolean
}

// 全局单例状态
const loadingState = ref<LoadingState>({
  visible: false,
  message: '加载中...',
  progress: 0,
  showProgress: false
})

/**
 * 显示loading
 */
function showLoading(message: string = '加载中...', showProgress: boolean = false) {
  loadingState.value = {
    visible: true,
    message,
    progress: 0,
    showProgress
  }
}

/**
 * 更新loading进度
 */
function updateProgress(progress: number, message?: string) {
  loadingState.value.progress = Math.min(100, Math.max(0, progress))
  if (message) {
    loadingState.value.message = message
  }
}

/**
 * 隐藏loading
 */
function hideLoading() {
  loadingState.value.visible = false
  loadingState.value.progress = 0
}

// 导出单例函数和状态
export function useLoading() {
  return {
    loadingState,
    showLoading,
    updateProgress,
    hideLoading
  }
}

// 导出全局状态（供 GlobalLoading 使用）
export { loadingState }
