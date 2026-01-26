import { describe, test, expect, beforeEach } from 'vitest'
import {
  getGameStats,
  updateGameStats,
  getAchievements,
  saveAchievements,
  getGameSettings,
  saveGameSettings,
  getGameConfig,
  saveTimerState,
  loadTimerState,
  clearTimerState,
  getCustomGameData,
  saveCustomGameData,
  checkAndClearExpiredData,
  clearAllData,
  clearGameData,
  getGameVisibility,
  saveGameVisibility,
  updateGameVisibility,
  getSettingsMeta,
  saveSettingsMeta,
  updateDataExpirationDays,
  type GameStats,
  type Achievement,
  type GameSettings,
  type TimerState
} from '@/utils/storageUtils'
import { resetStorage } from '../../utils/setupTest'

describe('storageUtils', () => {
  beforeEach(() => {
    resetStorage()
  })

  describe('getGameStats and updateGameStats', () => {
    test('should return default stats when no data exists', () => {
      const stats = getGameStats('city')
      
      expect(stats.totalGames).toBe(0)
      expect(stats.wins).toBe(0)
      expect(stats.losses).toBe(0)
      expect(stats.bestScore).toBe(Infinity)
      expect(stats.currentStreak).toBe(0)
      expect(stats.bestStreak).toBe(0)
    })

    test('should update stats correctly on win', () => {
      const initialStats = getGameStats('city')
      const updatedStats = updateGameStats('city', true, 3)
      
      expect(updatedStats.totalGames).toBe(initialStats.totalGames + 1)
      expect(updatedStats.wins).toBe(initialStats.wins + 1)
      expect(updatedStats.losses).toBe(initialStats.losses)
      expect(updatedStats.bestScore).toBe(3)
      expect(updatedStats.currentStreak).toBe(1)
      expect(updatedStats.bestStreak).toBe(1)
    })

    test('should update stats correctly on loss', () => {
      // 先设置一些胜利记录
      updateGameStats('city', true, 2)
      updateGameStats('city', true, 3)
      
      const stats = updateGameStats('city', false, 5)
      
      expect(stats.totalGames).toBe(3)
      expect(stats.wins).toBe(2)
      expect(stats.losses).toBe(1)
      expect(stats.currentStreak).toBe(0) // 失败后重置连胜
      expect(stats.bestStreak).toBe(2) // 保持最佳连胜
    })

    test('should update best score correctly', () => {
      updateGameStats('city', true, 5)
      updateGameStats('city', true, 3)
      updateGameStats('city', true, 4)
      
      const stats = getGameStats('city')
      expect(stats.bestScore).toBe(3) // 最少尝试次数
    })

    test('should update average attempts correctly', () => {
      updateGameStats('city', true, 3)
      updateGameStats('city', true, 5)
      updateGameStats('city', true, 4)
      
      const stats = getGameStats('city')
      expect(stats.averageAttempts).toBe(4) // (3+5+4)/3 = 4
    })

    test('should update today stats correctly', () => {
      const stats = updateGameStats('city', true, 2)
      
      expect(stats.todayStats.date).toBe(new Date().toDateString())
      expect(stats.todayStats.games).toBe(1)
      expect(stats.todayStats.wins).toBe(1)
    })

    test('should handle different game types independently', () => {
      updateGameStats('city', true, 2)
      updateGameStats('hero', true, 3)
      updateGameStats('movie', false, 5)
      
      const cityStats = getGameStats('city')
      const heroStats = getGameStats('hero')
      const movieStats = getGameStats('movie')
      
      expect(cityStats.wins).toBe(1)
      expect(heroStats.wins).toBe(1)
      expect(movieStats.losses).toBe(1)
    })
  })

  describe('getAchievements and saveAchievements', () => {
    test('should return empty array when no achievements exist', () => {
      const achievements = getAchievements()
      expect(achievements).toEqual([])
    })

    test('should save and retrieve achievements', () => {
      const achievements: Achievement[] = [
        {
          id: 'test-1',
          name: 'Test Achievement 1',
          description: 'Test description',
          icon: '🎮',
          unlockedAt: null,
          progress: 0,
          maxProgress: 1
        },
        {
          id: 'test-2',
          name: 'Test Achievement 2',
          description: 'Test description 2',
          icon: '🏆',
          unlockedAt: Date.now(),
          progress: 1,
          maxProgress: 1
        }
      ]
      
      saveAchievements(achievements)
      const retrieved = getAchievements()
      
      expect(retrieved).toHaveLength(2)
      expect(retrieved[0].id).toBe('test-1')
      expect(retrieved[1].id).toBe('test-2')
      expect(retrieved[1].unlockedAt).not.toBeNull()
    })
  })

  describe('getGameSettings and saveGameSettings', () => {
    test('should return default settings when no settings exist', () => {
      const settings = getGameSettings()
      
      expect(settings.defaults.enableTimer).toBe(true)
      expect(settings.defaults.timerDuration).toBe(5)
      expect(settings.defaults.maxAttempts).toBe(5)
      expect(settings.defaults.showInitialHint).toBe(true)
    })

    test('should save and retrieve settings', () => {
      const settings: GameSettings = {
        defaults: {
          enableTimer: false,
          timerDuration: 10,
          maxAttempts: 8,
          showInitialHint: false
        },
        overrides: {
          city: {
            enableTimer: true,
            timerDuration: 15
          }
        }
      }
      
      saveGameSettings(settings)
      const retrieved = getGameSettings()
      
      expect(retrieved.defaults.enableTimer).toBe(false)
      expect(retrieved.defaults.timerDuration).toBe(10)
      expect(retrieved.overrides.city?.enableTimer).toBe(true)
    })
  })

  describe('getGameConfig', () => {
    test('should return default config when no overrides exist', () => {
      const config = getGameConfig('city')
      
      expect(config.enableTimer).toBe(true)
      expect(config.timerDuration).toBe(5)
      expect(config.maxAttempts).toBe(5)
      expect(config.showInitialHint).toBe(true)
    })

    test('should return override config when exists', () => {
      const settings: GameSettings = {
        defaults: {
          enableTimer: true,
          timerDuration: 5,
          maxAttempts: 5,
          showInitialHint: true
        },
        overrides: {
          city: {
            enableTimer: false,
            timerDuration: 10,
            maxAttempts: 8
          }
        }
      }
      
      saveGameSettings(settings)
      const config = getGameConfig('city')
      
      expect(config.enableTimer).toBe(false)
      expect(config.timerDuration).toBe(10)
      expect(config.maxAttempts).toBe(8)
    })

    test('should use default for movie game timer duration (30 minutes)', () => {
      const config = getGameConfig('movie')
      expect(config.timerDuration).toBe(30)
    })

    test('should include maxPlaybackPerSegment for movie game', () => {
      const config = getGameConfig('movie')
      expect(config.maxPlaybackPerSegment).toBe(1)
    })
  })

  describe('saveTimerState and loadTimerState', () => {
    test('should save and load timer state', () => {
      const state: TimerState = {
        gameType: 'city',
        startTime: Date.now(),
        remainingSeconds: 300,
        isRunning: true
      }
      
      saveTimerState(state)
      const loaded = loadTimerState()
      
      expect(loaded).not.toBeNull()
      expect(loaded?.gameType).toBe('city')
      expect(loaded?.remainingSeconds).toBe(300)
      expect(loaded?.isRunning).toBe(true)
    })

    test('should return null when no timer state exists', () => {
      clearTimerState()
      const loaded = loadTimerState()
      expect(loaded).toBeNull()
    })

    test('should clear timer state', () => {
      const state: TimerState = {
        gameType: 'city',
        startTime: Date.now(),
        remainingSeconds: 300,
        isRunning: true
      }
      
      saveTimerState(state)
      clearTimerState()
      const loaded = loadTimerState()
      
      expect(loaded).toBeNull()
    })
  })

  describe('getCustomGameData and saveCustomGameData', () => {
    test('should return null when no custom data exists', () => {
      const data = getCustomGameData('city')
      expect(data).toBeNull()
    })

    test('should save and retrieve custom game data', () => {
      const customData = {
        useCustom: true,
        items: [
          { name: 'Test City', latitude: 39.9, longitude: 116.4, features: [] }
        ],
        lastModified: Date.now(),
        expiresAt: 0
      }
      
      saveCustomGameData('city', customData)
      const retrieved = getCustomGameData('city')
      
      expect(retrieved).not.toBeNull()
      expect(retrieved?.useCustom).toBe(true)
      expect(retrieved?.items).toHaveLength(1)
    })

    test('should calculate expiration time based on settings meta', () => {
      // 设置过期天数为 30 天
      updateDataExpirationDays(30)
      
      const customData = {
        useCustom: true,
        items: [],
        lastModified: Date.now(),
        expiresAt: 0
      }
      
      saveCustomGameData('city', customData)
      const retrieved = getCustomGameData('city')
      
      expect(retrieved?.expiresAt).toBeGreaterThan(Date.now())
    })
  })

  describe('checkAndClearExpiredData', () => {
    test('should clear expired custom data', () => {
      // 设置过期天数为 1 天
      updateDataExpirationDays(1)
      const expirationMs = 1 * 24 * 60 * 60 * 1000
      
      // 创建过期数据（lastModified 是 2 天前，超过过期时间）
      const expiredData = {
        useCustom: true,
        items: [],
        lastModified: Date.now() - 2 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + expirationMs // 已过期
      }
      
      // 直接设置到 localStorage，因为 saveCustomGameData 会重新计算 expiresAt
      localStorage.setItem('customCityData', JSON.stringify(expiredData))
      
      // 检查并清除过期数据
      const cleared = checkAndClearExpiredData()
      
      expect(cleared).toContain('city')
      const data = getCustomGameData('city')
      expect(data).toBeNull()
    })

    test('should not clear non-expired data', () => {
      updateDataExpirationDays(30)
      
      const validData = {
        useCustom: true,
        items: [],
        lastModified: Date.now(),
        expiresAt: 0
      }
      
      saveCustomGameData('city', validData)
      const cleared = checkAndClearExpiredData()
      
      expect(cleared).not.toContain('city')
      const data = getCustomGameData('city')
      expect(data).not.toBeNull()
    })
  })

  describe('clearAllData and clearGameData', () => {
    test('should clear all game data', () => {
      // 设置一些数据
      updateGameStats('city', true, 2)
      updateGameStats('hero', true, 3)
      saveAchievements([{
        id: 'test',
        name: 'Test',
        description: 'Test',
        icon: '🎮',
        unlockedAt: null,
        progress: 0,
        maxProgress: 1
      }])
      
      clearAllData()
      
      expect(getGameStats('city').totalGames).toBe(0)
      expect(getGameStats('hero').totalGames).toBe(0)
      expect(getAchievements()).toHaveLength(0)
    })

    test('should clear specific game data', () => {
      updateGameStats('city', true, 2)
      updateGameStats('hero', true, 3)
      
      clearGameData('city')
      
      expect(getGameStats('city').totalGames).toBe(0)
      expect(getGameStats('hero').totalGames).toBe(1) // hero 数据保留
    })
  })

  describe('getGameVisibility and saveGameVisibility', () => {
    test('should return default visibility (all true)', () => {
      const visibility = getGameVisibility()
      
      expect(visibility.city).toBe(true)
      expect(visibility.hero).toBe(true)
      expect(visibility.movie).toBe(true)
    })

    test('should save and retrieve visibility', () => {
      const visibility = {
        city: true,
        hero: false,
        movie: true
      }
      
      saveGameVisibility(visibility)
      const retrieved = getGameVisibility()
      
      expect(retrieved.city).toBe(true)
      expect(retrieved.hero).toBe(false)
      expect(retrieved.movie).toBe(true)
    })

    test('should update single game visibility', () => {
      updateGameVisibility('hero', false)
      
      const visibility = getGameVisibility()
      expect(visibility.hero).toBe(false)
      expect(visibility.city).toBe(true) // 其他保持不变
    })
  })

  describe('getSettingsMeta and saveSettingsMeta', () => {
    test('should return default meta', () => {
      const meta = getSettingsMeta()
      
      expect(meta.dataExpirationDays).toBe(30)
      expect(meta.lastAccess).toBeGreaterThan(0)
    })

    test('should update data expiration days', () => {
      updateDataExpirationDays(60)
      
      const meta = getSettingsMeta()
      expect(meta.dataExpirationDays).toBe(60)
    })

    test('should clamp expiration days between 1 and 365', () => {
      updateDataExpirationDays(0)
      expect(getSettingsMeta().dataExpirationDays).toBe(1)
      
      updateDataExpirationDays(500)
      expect(getSettingsMeta().dataExpirationDays).toBe(365)
    })
  })
})
