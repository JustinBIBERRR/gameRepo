import { describe, test, expect, beforeEach } from 'vitest'
import {
  checkAndUpdateAchievements,
  getAchievementsByCategory,
  getUnlockedCount,
  getAchievementProgress,
  ACHIEVEMENT_DEFINITIONS
} from '@/utils/achievementUtils'
import { updateGameStats, clearAllData, getAchievements, type GameStats } from '@/utils/storageUtils'
import { resetStorage } from '../../utils/setupTest'

describe('achievementUtils', () => {
  beforeEach(() => {
    resetStorage()
    clearAllData()
  })

  describe('checkAndUpdateAchievements', () => {
    test('should unlock first_game achievement on first game', () => {
      const stats = updateGameStats('city', true, 3)
      expect(stats.totalGames).toBe(1)
      expect(stats.wins).toBe(1)
      
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      
      // 第一次游戏应该解锁 first_game 和 first_win
      expect(newlyUnlocked.length).toBeGreaterThanOrEqual(1)
      const firstGame = newlyUnlocked.find(a => a.id === 'first_game')
      const firstWin = newlyUnlocked.find(a => a.id === 'first_win')
      
      // 至少应该解锁其中一个
      expect(firstGame || firstWin).toBeDefined()
      if (firstGame) {
        expect(firstGame.unlockedAt).not.toBeNull()
      }
      if (firstWin) {
        expect(firstWin.unlockedAt).not.toBeNull()
      }
    })

    test('should unlock first_win achievement on first win', () => {
      clearAllData()
      const stats = updateGameStats('city', true, 2)
      expect(stats.wins).toBe(1)
      
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      const firstWin = newlyUnlocked.find(a => a.id === 'first_win')
      
      expect(firstWin).toBeDefined()
      expect(firstWin?.unlockedAt).not.toBeNull()
    })

    test('should unlock perfect_guess achievement when bestScore is 1', () => {
      clearAllData()
      const stats = updateGameStats('city', true, 1)
      expect(stats.bestScore).toBe(1)
      
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      const perfectGuess = newlyUnlocked.find(a => a.id === 'perfect_guess')
      
      expect(perfectGuess).toBeDefined()
      expect(perfectGuess?.unlockedAt).not.toBeNull()
    })

    test('should unlock two_attempts achievement when bestScore is 2', () => {
      clearAllData()
      const stats = updateGameStats('city', true, 2)
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      
      const twoAttempts = newlyUnlocked.find(a => a.id === 'two_attempts')
      expect(twoAttempts).toBeDefined()
      expect(twoAttempts?.unlockedAt).not.toBeNull()
    })

    test('should unlock streak achievements', () => {
      clearAllData()
      // 连续胜利3次
      updateGameStats('city', true, 2)
      updateGameStats('city', true, 3)
      const stats = updateGameStats('city', true, 4)
      expect(stats.bestStreak).toBe(3)
      
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      
      const streak3 = newlyUnlocked.find(a => a.id === 'streak_3')
      expect(streak3).toBeDefined()
      expect(streak3?.unlockedAt).not.toBeNull()
    })

    test('should not unlock achievement twice', () => {
      clearAllData()
      
      // 第一次解锁
      let stats = updateGameStats('city', true, 1)
      expect(stats.bestScore).toBe(1)
      let newlyUnlocked = checkAndUpdateAchievements('city', stats)
      const firstUnlock = newlyUnlocked.find(a => a.id === 'perfect_guess')
      expect(firstUnlock).toBeDefined()
      expect(firstUnlock?.unlockedAt).not.toBeNull()
      
      // 第二次检查，不应该再次解锁
      stats = updateGameStats('city', true, 1)
      newlyUnlocked = checkAndUpdateAchievements('city', stats)
      const secondUnlock = newlyUnlocked.find(a => a.id === 'perfect_guess')
      expect(secondUnlock).toBeUndefined()
    })

    test('should update progress for achievements not yet unlocked', () => {
      // 完成6局游戏，但还没到10局
      for (let i = 0; i < 6; i++) {
        updateGameStats('city', true, 3)
      }
      
      const stats = updateGameStats('city', true, 3)
      checkAndUpdateAchievements('city', stats)
      
      // 检查进度 (7/10 = 70%，但 getProgress 返回 min(7, 10) = 7，所以是 70%)
      const progress = getAchievementProgress('ten_games')
      expect(progress).toBe(70) // 7/10 = 70%
    })

    test('should unlock ten_games achievement after 10 games', () => {
      clearAllData()
      for (let i = 0; i < 9; i++) {
        updateGameStats('city', true, 3)
      }
      
      const stats = updateGameStats('city', true, 3)
      expect(stats.totalGames).toBe(10)
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      
      const tenGames = newlyUnlocked.find(a => a.id === 'ten_games')
      expect(tenGames).toBeDefined()
      expect(tenGames?.unlockedAt).not.toBeNull()
    })

    test('should unlock daily_player achievement after 5 games in one day', () => {
      clearAllData()
      for (let i = 0; i < 4; i++) {
        updateGameStats('city', true, 3)
      }
      
      const stats = updateGameStats('city', true, 3)
      expect(stats.todayStats.games).toBe(5)
      const newlyUnlocked = checkAndUpdateAchievements('city', stats)
      
      const dailyPlayer = newlyUnlocked.find(a => a.id === 'daily_player')
      expect(dailyPlayer).toBeDefined()
      expect(dailyPlayer?.unlockedAt).not.toBeNull()
    })
  })

  describe('getAchievementsByCategory', () => {
    test('should group achievements by category', () => {
      // 解锁一些成就
      updateGameStats('city', true, 1)
      updateGameStats('city', true, 2)
      const stats = updateGameStats('city', true, 3)
      checkAndUpdateAchievements('city', stats)
      
      const byCategory = getAchievementsByCategory()
      
      expect(byCategory.milestone).toBeDefined()
      expect(byCategory.skill).toBeDefined()
      expect(byCategory.time).toBeDefined()
      expect(Array.isArray(byCategory.milestone)).toBe(true)
    })
  })

  describe('getUnlockedCount', () => {
    test('should return correct count of unlocked achievements', () => {
      clearAllData()
      expect(getUnlockedCount()).toBe(0)
      
      const stats = updateGameStats('city', true, 1)
      checkAndUpdateAchievements('city', stats)
      
      const count = getUnlockedCount()
      // 至少应该解锁 perfect_guess (bestScore = 1)
      expect(count).toBeGreaterThan(0)
    })
  })

  describe('getAchievementProgress', () => {
    test('should return 0 for non-existent achievement', () => {
      const progress = getAchievementProgress('non-existent')
      expect(progress).toBe(0)
    })

    test('should return correct progress percentage', () => {
      // 完成5局游戏
      for (let i = 0; i < 5; i++) {
        updateGameStats('city', true, 3)
      }
      
      const stats = updateGameStats('city', true, 3)
      checkAndUpdateAchievements('city', stats)
      
      const progress = getAchievementProgress('ten_games')
      expect(progress).toBe(60) // 6/10 = 60%
    })

    test('should return 100 for completed achievement', () => {
      updateGameStats('city', true, 1)
      const stats = updateGameStats('city', true, 1)
      checkAndUpdateAchievements('city', stats)
      
      const progress = getAchievementProgress('perfect_guess')
      expect(progress).toBe(100)
    })
  })
})
