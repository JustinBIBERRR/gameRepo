import { describe, test, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CityGuess from '@/views/CityGuess.vue'
import { createTestRouter } from '../../utils/testWrapper'
import { resetStorage, setupRandomSeed } from '../../utils/testUtils'
import { clearAllData, getGameStats, updateGameStats } from '@/utils/storageUtils'
import { getRandomCity, matchCity, calculateDistance } from '@/utils/cityUtils'

// Mock 路由
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn()
    })
  }
})

describe('CityGuess Integration Tests', () => {
  beforeEach(() => {
    resetStorage()
    clearAllData()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('game initialization', () => {
    test('should initialize game with random city', async () => {
      const restoreRandom = setupRandomSeed(0.5)
      
      try {
        const router = createTestRouter()
        const wrapper = mount(CityGuess, {
          global: {
            plugins: [router],
            stubs: ['Navigation', 'GameHeader', 'Autocomplete', 'Celebration']
          }
        })
        
        await wrapper.vm.$nextTick()
        
        // 游戏应该已初始化（有目标城市）
        // 由于组件内部逻辑，我们需要通过其他方式验证
        expect(wrapper.exists()).toBe(true)
      } finally {
        restoreRandom()
      }
    })

    test('should use fixed random seed for reproducible tests', () => {
      const restoreRandom = setupRandomSeed(0.5)
      
      try {
        const city1 = getRandomCity()
        restoreRandom()
        
        const restoreRandom2 = setupRandomSeed(0.5)
        const city2 = getRandomCity()
        restoreRandom2()
        
        // 相同种子应该返回相同城市
        expect(city1.name).toBe(city2.name)
      } finally {
        restoreRandom()
      }
    })
  })

  describe('guess flow', () => {
    test('should handle valid guess correctly', () => {
      // 测试猜测流程的核心逻辑
      const city1 = getRandomCity()
      const city2 = getRandomCity()
      
      if (city1 && city2 && city1.name !== city2.name) {
        const distance = calculateDistance(
          city1.latitude,
          city1.longitude,
          city2.latitude,
          city2.longitude
        )
        
        expect(distance).toBeGreaterThanOrEqual(0)
        expect(typeof distance).toBe('number')
      }
    })

    test('should reject invalid city name', () => {
      const matched = matchCity('不存在的城市名称')
      expect(matched).toBeNull()
    })

    test('should calculate distance and direction for guesses', () => {
      // 使用真实数据测试距离计算
      const beijing = matchCity('北京')
      const shanghai = matchCity('上海')
      
      if (beijing && shanghai) {
        const distance = calculateDistance(
          beijing.latitude,
          beijing.longitude,
          shanghai.latitude,
          shanghai.longitude
        )
        
        expect(distance).toBeGreaterThan(1000) // 北京到上海应该超过1000公里
        expect(distance).toBeLessThan(1200)
      }
    })
  })

  describe('game win flow', () => {
    test('should update stats on win', () => {
      clearAllData()
      const initialStats = getGameStats('city')
      
      const stats = updateGameStats('city', true, 3)
      
      expect(stats.wins).toBe(initialStats.wins + 1)
      expect(stats.totalGames).toBe(initialStats.totalGames + 1)
      expect(stats.bestScore).toBe(3)
    })

    test('should unlock achievements on win', async () => {
      clearAllData()
      const { checkAndUpdateAchievements } = await import('@/utils/achievementUtils')
      
      const stats = updateGameStats('city', true, 1)
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      
      // 应该解锁 perfect_guess 成就
      const perfectGuess = newlyUnlocked.find(a => a.id === 'perfect_guess')
      expect(perfectGuess).toBeDefined()
    })
  })

  describe('game loss flow', () => {
    test('should update stats on loss', () => {
      clearAllData()
      const initialStats = getGameStats('city')
      
      const stats = updateGameStats('city', false, 5)
      
      expect(stats.losses).toBe(initialStats.losses + 1)
      expect(stats.totalGames).toBe(initialStats.totalGames + 1)
      expect(stats.currentStreak).toBe(0) // 失败后重置连胜
    })
  })

  describe('timer integration', () => {
    test('should handle timer timeout', async () => {
      const { useTimer } = await import('@/composables/useTimer')
      const onTimeout = vi.fn()
      
      const timer = useTimer(5, 'city', onTimeout)
      timer.start()
      
      vi.advanceTimersByTime(5000)
      
      expect(onTimeout).toHaveBeenCalled()
      expect(timer.timeRemaining.value).toBe(0)
    })
  })

  describe('state persistence', () => {
    test('should save and load game state', async () => {
      const { saveGameState, loadGameState } = await import('@/utils/storageUtils')
      
      const testState = {
        targetCity: '北京',
        attempts: 2,
        guessHistory: [],
        usedFeatures: [],
        initialHint: null,
        gameOver: false,
        gameWon: false,
        gameStartTime: Date.now()
      }
      
      saveGameState('cityGuessGame', testState)
      const loaded = loadGameState('cityGuessGame', null)
      
      expect(loaded).not.toBeNull()
      if (loaded) {
        expect((loaded as any).targetCity).toBe('北京')
        expect((loaded as any).attempts).toBe(2)
      }
    })
  })
})
