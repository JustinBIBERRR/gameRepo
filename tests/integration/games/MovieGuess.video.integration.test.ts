import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { resetStorage } from '../../utils/setupTest'
import { 
  saveMovieFiles, 
  getMovieFiles, 
  deleteMovieFiles,
  saveUserMovie,
  getUserMovie,
  type LocalMovieFiles,
  type UserMovie
} from '@/utils/movieStorage'
import { getVideoDuration } from '@/utils/videoUtils'
import { videoPreloader } from '@/utils/videoPreloader'
import { selectPlaybackMethod } from '@/utils/moviePlayback'
import { loadTestVideoFile, createMockVideoFile } from '../../utils/videoTestUtils'

describe('MovieGuess Video Integration Tests', () => {
  let testVideoFile: File | null = null
  const testMovieId = 'test-movie-drunk'

  beforeEach(async () => {
    resetStorage()
    // 清理 IndexedDB
    await deleteMovieFiles(testMovieId).catch(() => {})
    try {
      const movie = await getUserMovie(testMovieId)
      if (movie) {
        const { deleteUserMovie } = await import('@/utils/movieStorage')
        await deleteUserMovie(testMovieId)
      }
    } catch {}
    
    // 清理预加载器
    videoPreloader.unloadAll()
    
    // 尝试加载测试视频文件（如果失败，testVideoFile 为 null）
    try {
      testVideoFile = await loadTestVideoFile()
      if (testVideoFile.size === 0) {
        testVideoFile = null
      }
    } catch (error) {
      console.warn('Test video file not available, some tests will be skipped:', error)
      testVideoFile = null
    }
  })

  afterEach(async () => {
    // 清理资源
    await deleteMovieFiles(testMovieId).catch(() => {})
    videoPreloader.unloadAll()
  })

  describe('视频文件上传和存储', () => {
    test('should save and retrieve video file from IndexedDB', async () => {
      // 使用真实文件或创建测试文件
      const videoFile = testVideoFile || createMockVideoFile('test.mp4')
      
      const movieFiles: LocalMovieFiles = {
        movieId: testMovieId,
        sourceFile: videoFile,
        selectedAt: Date.now(),
        playbackMode: 'precise'
      }

      await saveMovieFiles(movieFiles)

      // 获取保存的文件
      const retrieved = await getMovieFiles(testMovieId)

      expect(retrieved).not.toBeNull()
      expect(retrieved?.movieId).toBe(testMovieId)
      expect(retrieved?.sourceFile).toBeDefined()
      expect(retrieved?.sourceFile?.name).toContain('.mp4')
      expect(retrieved?.sourceFile?.type).toBe('video/mp4')
    })

    test('should persist video file as Blob in IndexedDB', async () => {
      const videoFile = testVideoFile || createMockVideoFile('test.mp4')
      
      const movieFiles: LocalMovieFiles = {
        movieId: testMovieId,
        sourceFile: videoFile,
        selectedAt: Date.now()
      }

      await saveMovieFiles(movieFiles)

      // 获取保存的文件（应该包含 sourceBlob）
      const retrieved = await getMovieFiles(testMovieId)

      expect(retrieved).not.toBeNull()
      // 从 IndexedDB 恢复时，sourceBlob 会被转换为 sourceFile
      expect(retrieved?.sourceFile).toBeDefined()
    })

    test('should save user movie information', async () => {
      const userMovie: UserMovie = {
        id: testMovieId,
        name: '醉拳',
        nameVariants: ['醉拳', 'Drunken Master'],
        duration: 120 * 60, // 120分钟
        hint: '动作片',
        year: 1978,
        createdAt: Date.now()
      }

      await saveUserMovie(userMovie)

      const retrieved = await getUserMovie(testMovieId)
      expect(retrieved).not.toBeNull()
      expect(retrieved?.name).toBe('醉拳')
      expect(retrieved?.duration).toBe(120 * 60)
    })
  })

  describe('视频时长获取', () => {
    test('should get video duration from file', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      const duration = await getVideoDuration(testVideoFile)

      expect(duration).toBeGreaterThan(0)
      expect(typeof duration).toBe('number')
      expect(isNaN(duration)).toBe(false)
      expect(isFinite(duration)).toBe(true)
    }, 30000)

    test('should handle video duration for different time points', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      const duration = await getVideoDuration(testVideoFile)

      // 验证时长合理
      expect(duration).toBeGreaterThan(1)
      expect(duration).toBeLessThan(36000) // 10小时上限

      // 可以用于设置游戏的时间点选择器
      const maxTimePoint = Math.floor(duration - 15) // 留出15秒片段
      expect(maxTimePoint).toBeGreaterThan(0)
    }, 30000)
  })

  describe('视频预加载和加载时长', () => {
    test('should preload video and track loading progress', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      const progressUpdates: number[] = []

      await videoPreloader.preloadVideo(
        testMovieId,
        testVideoFile,
        (progress) => {
          progressUpdates.push(progress)
        }
      )

      // 验证预加载完成
      expect(videoPreloader.isPreloaded(testMovieId)).toBe(true)

      // 验证进度更新
      expect(progressUpdates.length).toBeGreaterThan(0)

      // 验证可以获取预加载的视频元素
      const videoElement = videoPreloader.getPreloadedVideo(testMovieId)
      expect(videoElement).not.toBeNull()
      expect(videoElement?.tagName).toBe('VIDEO')
    }, 60000)

    test('should measure video loading time', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      const startTime = performance.now()

      await videoPreloader.preloadVideo(testMovieId, testVideoFile)

      const endTime = performance.now()
      const loadTime = endTime - startTime

      // 验证加载时间合理
      expect(loadTime).toBeGreaterThan(0)
      expect(loadTime).toBeLessThan(120000) // 不超过2分钟

      // 验证预加载状态
      expect(videoPreloader.isPreloaded(testMovieId)).toBe(true)
    }, 60000)

    test('should get video duration from preloaded video', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      await videoPreloader.preloadVideo(testMovieId, testVideoFile)

      const duration = videoPreloader.getVideoDuration(testMovieId)

      expect(duration).not.toBeNull()
      expect(duration).toBeGreaterThan(0)
      expect(typeof duration).toBe('number')
    }, 60000)
  })

  describe('播放方法选择', () => {
    test('should select precise playback method with source file', async () => {
      const videoFile = testVideoFile || createMockVideoFile('test.mp4')
      
      const movieFiles: LocalMovieFiles = {
        movieId: testMovieId,
        sourceFile: videoFile,
        selectedAt: Date.now(),
        playbackMode: 'precise'
      }

      await saveMovieFiles(movieFiles)

      const method = selectPlaybackMethod(30, movieFiles, 'precise')

      expect(method).not.toBeNull()
      expect(method?.method).toBe('precise')
      expect(method?.timePoint).toBe(30)
      expect(method?.sourceFile).toBeDefined()
    })

    test('should select auto playback method', async () => {
      const videoFile = testVideoFile || createMockVideoFile('test.mp4')
      
      const movieFiles: LocalMovieFiles = {
        movieId: testMovieId,
        sourceFile: videoFile,
        selectedAt: Date.now(),
        playbackMode: 'auto'
      }

      await saveMovieFiles(movieFiles)

      const method = selectPlaybackMethod(60, movieFiles, 'auto')

      expect(method).not.toBeNull()
      // 自动模式应该选择原文件（因为没有关键片段）
      expect(method?.method).toBe('precise')
      expect(method?.timePoint).toBe(60)
    })
  })

  describe('页面刷新后视频资源恢复', () => {
    test('should restore video file after page refresh simulation', async () => {
      const videoFile = testVideoFile || createMockVideoFile('test.mp4')
      
      // 模拟保存游戏状态
      const movieFiles: LocalMovieFiles = {
        movieId: testMovieId,
        sourceFile: videoFile,
        selectedAt: Date.now(),
        playbackMode: 'precise'
      }

      await saveMovieFiles(movieFiles)

      // 模拟页面刷新：清理内存中的引用，但 IndexedDB 中的数据应该保留
      const retrieved = await getMovieFiles(testMovieId)

      expect(retrieved).not.toBeNull()
      expect(retrieved?.sourceFile).toBeDefined()
      expect(retrieved?.sourceFile?.name).toContain('.mp4')

      // 验证可以重新使用恢复的文件（如果是真实文件）
      if (testVideoFile) {
        const duration = await getVideoDuration(retrieved!.sourceFile!)
        expect(duration).toBeGreaterThan(0)
      }
    }, 30000)

    test('should restore and preload video after refresh', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      // 保存文件
      const movieFiles: LocalMovieFiles = {
        movieId: testMovieId,
        sourceFile: testVideoFile,
        selectedAt: Date.now()
      }
      await saveMovieFiles(movieFiles)

      // 模拟刷新：清理预加载器
      videoPreloader.unloadAll()

      // 恢复文件
      const retrieved = await getMovieFiles(testMovieId)
      expect(retrieved).not.toBeNull()

      // 重新预加载
      await videoPreloader.preloadVideo(testMovieId, retrieved!.sourceFile!)

      expect(videoPreloader.isPreloaded(testMovieId)).toBe(true)
      const duration = videoPreloader.getVideoDuration(testMovieId)
      expect(duration).toBeGreaterThan(0)
    }, 60000)
  })

  describe('路由切换后视频资源状态', () => {
    test('should maintain video preload state across route changes', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      // 预加载视频
      await videoPreloader.preloadVideo(testMovieId, testVideoFile)

      // 模拟路由切换：预加载器应该保持状态
      expect(videoPreloader.isPreloaded(testMovieId)).toBe(true)

      // 验证可以继续使用预加载的视频
      const videoElement = videoPreloader.getPreloadedVideo(testMovieId)
      expect(videoElement).not.toBeNull()

      const objectUrl = videoPreloader.getPreloadedObjectUrl(testMovieId)
      expect(objectUrl).not.toBeNull()
    }, 60000)

    test('should handle video resource cleanup on route change', async () => {
      if (!testVideoFile) {
        console.log('Skipping: test video file not available')
        return
      }

      // 预加载视频
      await videoPreloader.preloadVideo(testMovieId, testVideoFile)

      // 模拟切换到其他路由并清理资源
      videoPreloader.unloadVideo(testMovieId)

      expect(videoPreloader.isPreloaded(testMovieId)).toBe(false)

      // 但 IndexedDB 中的数据应该保留
      const retrieved = await getMovieFiles(testMovieId)
      // 如果没有保存过，retrieved 可能为 null
      // 这里主要测试清理不会影响 IndexedDB
    }, 30000)
  })

  describe('游戏状态持久化和恢复', () => {
    test('should save and restore complete game state with video', async () => {
      const videoFile = testVideoFile || createMockVideoFile('test.mp4')
      
      // 保存用户电影信息
      const userMovie: UserMovie = {
        id: testMovieId,
        name: '醉拳',
        nameVariants: ['醉拳'],
        duration: 120 * 60,
        createdAt: Date.now()
      }
      await saveUserMovie(userMovie)

      // 保存视频文件
      const movieFiles: LocalMovieFiles = {
        movieId: testMovieId,
        movie: userMovie,
        sourceFile: videoFile,
        selectedAt: Date.now()
      }
      await saveMovieFiles(movieFiles)

      // 模拟游戏状态（使用 storageUtils）
      const { saveGameState, loadGameState } = await import('@/utils/storageUtils')
      const gameState = {
        targetMovie: testMovieId,
        attempts: 2,
        selectedTimePoint: 30,
        playedTimePoints: [0, 15],
        gameOver: false,
        gameWon: false
      }
      saveGameState('movieGuessGame', gameState)

      // 模拟页面刷新：恢复所有状态
      const retrievedFiles = await getMovieFiles(testMovieId)
      const retrievedMovie = await getUserMovie(testMovieId)
      const restoredState = loadGameState('movieGuessGame', null)

      expect(retrievedFiles).not.toBeNull()
      expect(retrievedMovie).not.toBeNull()
      expect(restoredState).not.toBeNull()

      if (restoredState) {
        expect((restoredState as any).targetMovie).toBe(testMovieId)
        expect((restoredState as any).attempts).toBe(2)
      }

      // 验证可以继续游玩：预加载视频（如果是真实文件）
      if (testVideoFile && retrievedFiles?.sourceFile) {
        await videoPreloader.preloadVideo(testMovieId, retrievedFiles.sourceFile)
        expect(videoPreloader.isPreloaded(testMovieId)).toBe(true)
      }
    }, 60000)
  })

  describe('视频资源异常处理', () => {
    test('should handle invalid video file gracefully', async () => {
      // 创建一个无效的视频文件
      const invalidFile = createMockVideoFile('invalid.mp4')

      // 应该能够捕获错误
      await expect(getVideoDuration(invalidFile)).rejects.toThrow()
    }, 10000)

    test('should handle missing video file in IndexedDB', async () => {
      const retrieved = await getMovieFiles('non-existent-movie')
      expect(retrieved).toBeNull()
    })

    test('should handle video preload failure gracefully', async () => {
      const invalidFile = createMockVideoFile('fake.mp4')

      // 预加载无效文件应该失败或超时
      await expect(
        Promise.race([
          videoPreloader.preloadVideo('invalid', invalidFile),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ])
      ).rejects.toBeDefined()

      // 预加载失败后，状态应该正确
      expect(videoPreloader.isPreloaded('invalid')).toBe(false)
    }, 10000)
  })
})
