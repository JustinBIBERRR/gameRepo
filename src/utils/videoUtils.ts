/**
 * 视频工具函数
 */

/**
 * 获取视频文件的时长（秒）
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src)
      reject(new Error('无法读取视频元数据'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

/**
 * 格式化视频时长为可读格式
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟${secs}秒`
  }
  if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  }
  return `${secs}秒`
}
