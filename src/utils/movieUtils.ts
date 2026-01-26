/**
 * 电影工具函数
 * 处理电影数据的查询、匹配等功能
 */

import { getAllUserMovies } from './movieStorage'
import { getCustomGameData } from './storageUtils'
import moviesDataRaw from '../data/movies.json'
import type { MovieData } from '../schemas/movieSchema'

// 兼容旧的Movie接口（用于游戏逻辑）
export interface Movie {
  id: string
  name: string
  nameVariants: string[]
  duration: number
  hint?: string      // 初始提示（可选，如"漫威"、"国产动画"）
  videoUrl?: string  // 可选，因为现在使用本地文件
  videoType?: 'api' | 'local'  // 可选
  apiProvider?: 'youtube' | 'bilibili' | 'other'
  description?: string
  year?: number
}

// 默认电影数据
const defaultMoviesData = (moviesDataRaw as any).movies || []

// 缓存用户电影列表
let cachedMovies: Movie[] | null = null

/**
 * 获取所有电影（优先自定义数据，然后用户注册的电影，最后默认数据）
 */
export async function getAllMovies(): Promise<Movie[]> {
  try {
    // 1. 检查是否有自定义数据
    const customData = getCustomGameData<MovieData>('movie')
    if (customData && customData.useCustom && customData.items.length > 0) {
      // 使用自定义数据
      cachedMovies = customData.items.map(item => ({
        id: item.id,
        name: item.name,
        nameVariants: item.nameVariants || [],
        duration: item.duration || 0,
        hint: item.hint,
        description: item.description,
        year: item.year,
        videoType: 'api' as const,
        apiProvider: 'bilibili' as const
      }))
      return cachedMovies
    }
    
    // 2. 从IndexedDB读取用户注册的电影
    const userMovies = await getAllUserMovies()
    if (userMovies.length > 0) {
      cachedMovies = userMovies.map(movie => ({
        id: movie.id,
        name: movie.name,
        nameVariants: movie.nameVariants,
        duration: movie.duration,
        hint: movie.hint,
        description: movie.description,
        year: movie.year,
        videoType: 'local' as const
      }))
      return cachedMovies
    }
    
    // 3. 使用默认数据
    cachedMovies = defaultMoviesData.map((movie: any) => ({
      id: movie.id,
      name: movie.name,
      nameVariants: movie.nameVariants || [],
      duration: movie.duration || 0,
      hint: movie.hint,
      description: movie.description,
      year: movie.year,
      videoType: movie.videoType || 'api',
      apiProvider: movie.apiProvider || 'bilibili'
    }))
    return cachedMovies
  } catch (error) {
    console.error('获取电影列表失败:', error)
    return cachedMovies || []
  }
}

/**
 * 同步获取所有电影（使用缓存）
 */
export function getAllMoviesSync(): Movie[] {
  return cachedMovies || []
}

/**
 * 根据ID获取电影
 */
export async function getMovieById(id: string): Promise<Movie | null> {
  const movies = await getAllMovies()
  return movies.find(m => m.id === id) || null
}

/**
 * 同步根据ID获取电影（使用缓存）
 */
export function getMovieByIdSync(id: string): Movie | null {
  const movies = getAllMoviesSync()
  return movies.find(m => m.id === id) || null
}

/**
 * 随机选择一部电影
 */
export async function getRandomMovie(): Promise<Movie | null> {
  const movies = await getAllMovies()
  if (movies.length === 0) return null
  const randomIndex = Math.floor(Math.random() * movies.length)
  return movies[randomIndex]
}

/**
 * 同步随机选择一部电影（使用缓存）
 */
export function getRandomMovieSync(): Movie | null {
  const movies = getAllMoviesSync()
  if (movies.length === 0) return null
  const randomIndex = Math.floor(Math.random() * movies.length)
  return movies[randomIndex]
}

/**
 * 规范化字符串（用于匹配）
 * 移除空格、标点符号，转换为小写
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。！？、；：""''（）【】《》]/g, '')
}

/**
 * 精确匹配电影名称
 */
function exactMatch(input: string, movie: Movie): boolean {
  const normalizedInput = normalizeString(input)
  const normalizedName = normalizeString(movie.name)
  return normalizedInput === normalizedName
}

/**
 * 预设别名匹配
 */
function variantMatch(input: string, movie: Movie): boolean {
  const normalizedInput = normalizeString(input)
  return movie.nameVariants.some(variant => {
    const normalizedVariant = normalizeString(variant)
    return normalizedVariant === normalizedInput
  })
}

/**
 * 模糊匹配
 * 检查输入是否包含在电影名称中，或电影名称是否包含在输入中
 */
function fuzzyMatch(input: string, movie: Movie): boolean {
  const normalizedInput = normalizeString(input)
  const normalizedName = normalizeString(movie.name)
  
  // 完全包含匹配
  if (normalizedName.includes(normalizedInput) || normalizedInput.includes(normalizedName)) {
    return true
  }
  
  // 检查别名
  return movie.nameVariants.some(variant => {
    const normalizedVariant = normalizeString(variant)
    return normalizedVariant.includes(normalizedInput) || normalizedInput.includes(normalizedVariant)
  })
}

/**
 * 匹配电影（优先级：精确匹配 > 预设别名 > 模糊匹配）
 */
export function matchMovie(input: string): Movie | null {
  if (!input || !input.trim()) return null
  
  const movies = getAllMoviesSync()  // 使用同步方法获取电影列表
  if (movies.length === 0) return null  // 如果没有电影，返回null
  
  const trimmedInput = input.trim()
  
  // 1. 精确匹配
  for (const movie of movies) {
    if (exactMatch(trimmedInput, movie)) {
      return movie
    }
  }
  
  // 2. 预设别名匹配
  for (const movie of movies) {
    if (variantMatch(trimmedInput, movie)) {
      return movie
    }
  }
  
  // 3. 模糊匹配
  for (const movie of movies) {
    if (fuzzyMatch(trimmedInput, movie)) {
      return movie
    }
  }
  
  return null
}

/**
 * 搜索电影（用于自动完成）
 */
export function searchMovies(query: string): Movie[] {
  if (!query || !query.trim()) return []
  
  const movies = getAllMoviesSync()
  const normalizedQuery = normalizeString(query.trim())
  const results: Movie[] = []
  
  for (const movie of movies) {
    // 检查名称
    if (normalizeString(movie.name).includes(normalizedQuery)) {
      results.push(movie)
      continue
    }
    
    // 检查别名
    if (movie.nameVariants.some(variant => normalizeString(variant).includes(normalizedQuery))) {
      results.push(movie)
      continue
    }
  }
  
  return results
}

/**
 * 获取所有电影名称（用于自动完成）
 */
export function getAllMovieNames(): string[] {
  const movies = getAllMoviesSync()
  return movies.map(m => m.name)
}

/**
 * 格式化时间（秒转换为分钟:秒格式）
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}分${secs}秒`
}

/**
 * 解析时间字符串（分钟:秒格式转换为秒）
 */
export function parseTime(timeStr: string): number | null {
  const parts = timeStr.split(':')
  if (parts.length !== 2) return null
  
  const mins = parseInt(parts[0], 10)
  const secs = parseInt(parts[1], 10)
  
  if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs >= 60) {
    return null
  }
  
  return mins * 60 + secs
}

/**
 * 将秒数转换为分钟和秒数
 */
export function secondsToMinutesSeconds(seconds: number): { minutes: number; seconds: number } {
  return {
    minutes: Math.floor(seconds / 60),
    seconds: Math.floor(seconds % 60)
  }
}

/**
 * 将分钟和秒数转换为总秒数
 */
export function minutesSecondsToSeconds(minutes: number, seconds: number): number {
  return minutes * 60 + seconds
}
