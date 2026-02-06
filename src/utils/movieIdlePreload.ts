/**
 * 电影资源空闲预加载
 * 在页面空闲时预加载可播放的电影视频，进入猜电影时几乎无等待
 */

import { getAllMovies } from './movieUtils'
import type { Movie } from './movieUtils'
import { getMovieFiles } from './movieStorage'
import { getLocalVideoUrl } from './videoUrlResolver'
import { videoPreloader } from './videoPreloader'

type PreloadTask =
  | { movieId: string; type: 'url'; url: string }
  | { movieId: string; type: 'file'; file: File }

let idleScheduled = false
let taskQueue: PreloadTask[] = []

function scheduleNextIdle(): void {
  if (taskQueue.length === 0) return
  const cb = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : (fn: () => void) => setTimeout(fn, 0)
  cb(
    () => {
      const task = taskQueue.shift()
      if (!task) return
      if (task.type === 'url') {
        videoPreloader.preloadVideoByUrl(task.movieId, task.url).catch(() => {})
      } else {
        videoPreloader.preloadVideo(task.movieId, task.file).catch(() => {})
      }
      scheduleNextIdle()
    },
    { timeout: 3000 }
  )
}

/**
 * 收集需要预加载的电影任务（本地打包 URL 或 IndexedDB File）
 */
async function collectPreloadTasks(movies: Movie[]): Promise<PreloadTask[]> {
  const tasks: PreloadTask[] = []
  for (const movie of movies) {
    if (movie.videoType !== 'local') continue
    if (movie.videoUrl) {
      const url = getLocalVideoUrl(movie.videoUrl)
      if (url) tasks.push({ movieId: movie.id, type: 'url', url })
    } else {
      try {
        const files = await getMovieFiles(movie.id)
        if (files?.sourceFile) tasks.push({ movieId: movie.id, type: 'file', file: files.sourceFile })
      } catch {
        // 忽略单条失败
      }
    }
  }
  return tasks
}

/**
 * 启动空闲预加载（可重复调用；已预加载的会跳过）
 */
export function startMovieIdlePreload(): void {
  if (idleScheduled) return
  idleScheduled = true

  const run = async () => {
    try {
      const movies = await getAllMovies()
      const tasks = await collectPreloadTasks(movies)
      // 跳过已预加载
      taskQueue = tasks.filter((t) => !videoPreloader.isPreloaded(t.movieId))
      scheduleNextIdle()
    } catch (e) {
      console.warn('电影空闲预加载收集任务失败:', e)
    } finally {
      idleScheduled = false
    }
  }

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => run(), { timeout: 2000 })
  } else {
    setTimeout(run, 500)
  }
}
