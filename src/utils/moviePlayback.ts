/**
 * 电影播放工具函数
 * 实现智能播放模式选择逻辑
 */

import type { LocalMovieFiles, VideoSegment } from './movieStorage'

export type PlaybackMode = 'fast' | 'precise' | 'auto'

interface PlaybackMethod {
  method: 'segment' | 'precise'
  segment?: VideoSegment
  timePoint?: number
  sourceFile?: File
}

/**
 * 找到最接近的关键片段
 */
function findNearestSegment(
  timePoint: number,
  segments: VideoSegment[],
  threshold: number = 150 // 2.5分钟 = 150秒
): VideoSegment | null {
  if (!segments || segments.length === 0) return null

  let nearest: VideoSegment | null = null
  let minDiff = Infinity

  for (const segment of segments) {
    const diff = Math.abs(timePoint - segment.startTime)
    if (diff < minDiff) {
      minDiff = diff
      nearest = segment
    }
  }

  // 如果时间差在阈值内，使用关键片段
  if (nearest && minDiff <= threshold) {
    return nearest
  }

  return null
}

/**
 * 智能选择播放方法
 */
export function selectPlaybackMethod(
  timePoint: number,
  movieFiles: LocalMovieFiles | null,
  preferredMode?: PlaybackMode
): PlaybackMethod | null {
  if (!movieFiles) {
    return null
  }

  const mode = preferredMode || movieFiles.playbackMode || 'auto'

  // 快速模式：只使用关键片段
  if (mode === 'fast') {
    if (movieFiles.keySegments && movieFiles.keySegments.length > 0) {
      const segment = findNearestSegment(timePoint, movieFiles.keySegments, Infinity)
      if (segment) {
        return {
          method: 'segment',
          segment
        }
      }
    }
    return null // 没有关键片段，无法播放
  }

  // 精确模式：只使用原文件
  if (mode === 'precise') {
    if (movieFiles.sourceFile) {
      return {
        method: 'precise',
        timePoint,
        sourceFile: movieFiles.sourceFile
      }
    }
    return null // 没有原文件，无法播放
  }

  // 自动模式：智能选择
  if (mode === 'auto') {
    // 优先使用关键片段（如果时间点接近）
    if (movieFiles.keySegments && movieFiles.keySegments.length > 0) {
      const segment = findNearestSegment(timePoint, movieFiles.keySegments, 150)
      if (segment) {
        return {
          method: 'segment',
          segment
        }
      }
    }

    // 否则使用原文件（精确时间点）
    if (movieFiles.sourceFile) {
      return {
        method: 'precise',
        timePoint,
        sourceFile: movieFiles.sourceFile
      }
    }
  }

  return null
}

/**
 * 格式化时间
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}
