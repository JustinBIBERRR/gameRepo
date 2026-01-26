import { describe, test, expect, beforeEach, vi } from 'vitest'
import { resetStorage, setupRandomSeed } from '../../utils/testUtils'
import { clearAllData, updateGameStats } from '@/utils/storageUtils'
import { getRandomHero, matchHero, compareAttributes } from '@/utils/heroUtils'

describe('HeroGuess Integration Tests', () => {
  beforeEach(() => {
    resetStorage()
    clearAllData()
  })

  describe('game initialization', () => {
    test('should initialize game with random hero', () => {
      const restoreRandom = setupRandomSeed(0.5)
      
      try {
        const hero = getRandomHero()
        expect(hero).toBeDefined()
        expect(hero.name).toBeDefined()
        expect(hero.role).toBeDefined()
        expect(hero.era).toBeDefined()
        expect(hero.nationality).toBeDefined()
      } finally {
        restoreRandom()
      }
    })
  })

  describe('attribute comparison', () => {
    test('should compare hero attributes correctly', () => {
      const hero1 = {
        name: '测试英雄1',
        role: '法师',
        era: '现代',
        nationality: '中国',
        human: true,
        gender: '男'
      }
      
      const hero2 = {
        name: '测试英雄2',
        role: '法师',
        era: '现代',
        nationality: '中国',
        human: true,
        gender: '男'
      }
      
      const matches = compareAttributes(hero1, hero2)
      
      expect(matches.role).toBe('full')
      expect(matches.era).toBe('full')
      expect(matches.nationality).toBe('full')
      expect(matches.human).toBe('full')
      expect(matches.gender).toBe('full')
    })

    test('should handle partial role match', () => {
      const hero1 = {
        name: '测试英雄1',
        role: '法师/战士',
        era: '现代',
        nationality: '中国',
        human: true,
        gender: '男'
      }
      
      const hero2 = {
        name: '测试英雄2',
        role: '法师/刺客',
        era: '现代',
        nationality: '中国',
        human: true,
        gender: '男'
      }
      
      const matches = compareAttributes(hero1, hero2)
      expect(matches.role).toBe('partial')
    })
  })

  describe('game win and loss flow', () => {
    test('should update stats on win', () => {
      clearAllData()
      const stats = updateGameStats('hero', true, 2)
      
      expect(stats.wins).toBe(1)
      expect(stats.totalGames).toBe(1)
      expect(stats.bestScore).toBe(2)
    })

    test('should update stats on loss', () => {
      clearAllData()
      const stats = updateGameStats('hero', false, 5)
      
      expect(stats.losses).toBe(1)
      expect(stats.totalGames).toBe(1)
      expect(stats.currentStreak).toBe(0)
    })
  })
})
