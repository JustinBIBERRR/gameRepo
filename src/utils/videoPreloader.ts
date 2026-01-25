/**
 * 视频预加载管理器
 * 管理所有预加载的video元素，实现0卡顿播放
 */

interface PreloadedVideo {
  movieId: string
  videoElement: HTMLVideoElement
  objectUrl: string
  file: File
  isReady: boolean
  loadPromise: Promise<void>
  duration?: number  // 视频时长（秒）
}

type ProgressCallback = (progress: number) => void

class VideoPreloader {
  private preloadedVideos: Map<string, PreloadedVideo> = new Map()
  private loadingPromises: Map<string, Promise<void>> = new Map()

  /**
   * 预加载视频
   */
  async preloadVideo(movieId: string, file: File, onProgress?: ProgressCallback): Promise<void> {
    // 如果已经预加载，直接返回
    if (this.preloadedVideos.has(movieId)) {
      const existing = this.preloadedVideos.get(movieId)!
      if (existing.file === file && existing.isReady) {
        return
      }
      // 如果文件不同，先清理旧的
      this.unloadVideo(movieId)
    }

    // 如果正在加载，等待加载完成
    if (this.loadingPromises.has(movieId)) {
      return this.loadingPromises.get(movieId)!
    }

    // 创建加载Promise
    const loadPromise = this.doPreload(movieId, file, onProgress)
    this.loadingPromises.set(movieId, loadPromise)

    try {
      await loadPromise
    } finally {
      this.loadingPromises.delete(movieId)
    }
  }

  /**
   * 执行预加载
   */
  private async doPreload(movieId: string, file: File, onProgress?: ProgressCallback): Promise<void> {
    return new Promise((resolve, reject) => {
      // 创建Object URL
      const objectUrl = URL.createObjectURL(file)

      // 创建video元素（隐藏）
      const videoElement = document.createElement('video')
      videoElement.preload = 'auto' // 预加载整个视频
      videoElement.src = objectUrl
      videoElement.style.display = 'none'
      videoElement.style.position = 'absolute'
      videoElement.style.visibility = 'hidden'
      document.body.appendChild(videoElement)

      const preloaded: PreloadedVideo = {
        movieId,
        videoElement,
        objectUrl,
        file,
        isReady: false,
        loadPromise: Promise.resolve()
      }

      // 监听进度
      const handleProgress = () => {
        if (videoElement.buffered.length > 0 && videoElement.duration) {
          const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1)
          const progress = (bufferedEnd / videoElement.duration) * 100
          onProgress?.(progress)
        }
      }

      // 监听元数据加载（获取时长）
      const handleLoadedMetadata = () => {
        preloaded.duration = videoElement.duration
      }

      // 监听加载完成
      const handleCanPlayThrough = () => {
        preloaded.isReady = true
        videoElement.removeEventListener('canplaythrough', handleCanPlayThrough)
        videoElement.removeEventListener('progress', handleProgress)
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        videoElement.removeEventListener('error', handleError)
        this.preloadedVideos.set(movieId, preloaded)
        onProgress?.(100)
        resolve()
      }

      const handleError = (e: Event) => {
        videoElement.removeEventListener('canplaythrough', handleCanPlayThrough)
        videoElement.removeEventListener('progress', handleProgress)
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        videoElement.removeEventListener('error', handleError)
        document.body.removeChild(videoElement)
        URL.revokeObjectURL(objectUrl)
        reject(new Error('视频预加载失败'))
      }

      videoElement.addEventListener('canplaythrough', handleCanPlayThrough, { once: true })
      videoElement.addEventListener('progress', handleProgress)
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true })
      videoElement.addEventListener('error', handleError, { once: true })

      // 开始加载
      videoElement.load()
    })
  }

  /**
   * 获取预加载的视频元素
   */
  getPreloadedVideo(movieId: string): HTMLVideoElement | null {
    const preloaded = this.preloadedVideos.get(movieId)
    if (preloaded && preloaded.isReady) {
      return preloaded.videoElement
    }
    return null
  }

  /**
   * 获取预加载的视频Object URL
   */
  getPreloadedObjectUrl(movieId: string): string | null {
    const preloaded = this.preloadedVideos.get(movieId)
    if (preloaded && preloaded.isReady) {
      return preloaded.objectUrl
    }
    return null
  }

  /**
   * 检查视频是否已预加载
   */
  isPreloaded(movieId: string): boolean {
    const preloaded = this.preloadedVideos.get(movieId)
    return preloaded !== undefined && preloaded.isReady
  }

  /**
   * 卸载视频（释放资源）
   */
  unloadVideo(movieId: string): void {
    const preloaded = this.preloadedVideos.get(movieId)
    if (preloaded) {
      // 从DOM移除
      if (preloaded.videoElement.parentNode) {
        document.body.removeChild(preloaded.videoElement)
      }
      // 释放Object URL
      URL.revokeObjectURL(preloaded.objectUrl)
      // 从Map移除
      this.preloadedVideos.delete(movieId)
    }
  }

  /**
   * 卸载所有视频
   */
  unloadAll(): void {
    for (const movieId of this.preloadedVideos.keys()) {
      this.unloadVideo(movieId)
    }
  }

  /**
   * 获取所有已预加载的电影ID
   */
  getPreloadedMovieIds(): string[] {
    return Array.from(this.preloadedVideos.keys())
  }

  /**
   * 获取预加载状态
   */
  getPreloadStatus(movieId: string): { isPreloaded: boolean; isReady: boolean; isLoading: boolean } {
    const preloaded = this.preloadedVideos.get(movieId)
    const isLoading = this.loadingPromises.has(movieId)
    return {
      isPreloaded: preloaded !== undefined,
      isReady: preloaded?.isReady || false,
      isLoading
    }
  }

  /**
   * 获取视频时长
   */
  getVideoDuration(movieId: string): number | null {
    const preloaded = this.preloadedVideos.get(movieId)
    return preloaded?.duration || null
  }
}

// 导出单例
export const videoPreloader = new VideoPreloader()
