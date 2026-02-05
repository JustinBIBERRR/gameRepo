import citiesData from '@/data/json/cities.json'
import heroesData from '@/data/json/heroes.json'
import moviesData from '@/data/json/movies.json'
import { resetStorage } from './setupTest'

// 固定随机种子，确保测试可重复
export function setupRandomSeed(seed: number = 0.5) {
  const originalRandom = Math.random
  Math.random = () => seed
  return () => {
    Math.random = originalRandom
  }
}

// 获取 Mock 城市数据
export function getMockCity() {
  return citiesData[0]
}

// 获取 Mock 英雄数据
export function getMockHero() {
  return heroesData[0]
}

// 获取 Mock 电影数据（movies.json 结构为 { movies: [...] }）
export function getMockMovie() {
  const data = moviesData as { movies?: unknown[] }
  return Array.isArray(data.movies) && data.movies.length > 0 ? data.movies[0] : undefined
}

// 重置所有存储
export { resetStorage }

// 等待函数（用于异步测试）
export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 创建测试用的游戏统计数据
export function createMockGameStats(overrides = {}) {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    bestScore: Infinity,
    averageAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    todayStats: {
      date: new Date().toDateString(),
      games: 0,
      wins: 0
    },
    ...overrides
  }
}

// 创建测试用的成就数据
export function createMockAchievement(overrides = {}) {
  return {
    id: 'test-achievement',
    name: '测试成就',
    description: '这是一个测试成就',
    icon: '🎮',
    unlockedAt: null,
    progress: 0,
    maxProgress: 1,
    ...overrides
  }
}
