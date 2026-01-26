/**
 * 视频测试工具函数
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * 从文件系统读取测试视频文件
 * 在 Node.js 环境中使用 fs，在浏览器环境中使用 fetch
 */
export async function loadTestVideoFile(): Promise<File> {
  // 检查是否在 Node.js 环境中
  if (typeof window === 'undefined' || typeof process !== 'undefined') {
    // Node.js 环境：使用 fs 读取文件
    try {
      const videoPath = join(process.cwd(), 'tests', 'assets', 'drunk.mp4')
      if (existsSync(videoPath)) {
        const buffer = readFileSync(videoPath)
        const blob = new Blob([buffer], { type: 'video/mp4' })
        return new File([blob], 'drunk.mp4', { type: 'video/mp4' })
      } else {
        console.warn(`Video file not found at: ${videoPath}`)
        throw new Error(`Video file not found: ${videoPath}`)
      }
    } catch (error) {
      console.warn('Failed to load video file from filesystem:', error)
      throw error // 重新抛出错误，让测试知道文件加载失败
    }
  } else {
    // 浏览器环境：使用 fetch
    try {
      // 尝试多个可能的路径
      const paths = [
        '/tests/assets/drunk.mp4',
        './tests/assets/drunk.mp4',
        '../tests/assets/drunk.mp4'
      ]
      
      for (const path of paths) {
        try {
          const response = await fetch(path)
          if (response.ok) {
            const blob = await response.blob()
            return new File([blob], 'drunk.mp4', { type: 'video/mp4' })
          }
        } catch (e) {
          // 继续尝试下一个路径
          continue
        }
      }
      
      throw new Error('Failed to load video file from any path')
    } catch (error) {
      console.warn('Failed to load video file via fetch:', error)
      throw error
    }
  }
}

/**
 * 创建一个模拟的视频文件（用于测试错误处理）
 */
export function createMockVideoFile(name: string = 'mock.mp4'): File {
  const mockBlob = new Blob(['invalid video content'], { type: 'video/mp4' })
  return new File([mockBlob], name, { type: 'video/mp4' })
}
