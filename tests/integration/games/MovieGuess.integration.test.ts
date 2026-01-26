import { describe, test, expect, beforeEach, vi } from 'vitest'
import { resetStorage, setupRandomSeed } from '../../utils/testUtils'
import { clearAllData, updateGameStats } from '@/utils/storageUtils'
import { 
  getRandomMovieSync, 
  matchMovie, 
  formatTime, 
  parseTime,
  secondsToMinutesSeconds,
  minutesSecondsToSeconds
} from '@/utils/movieUtils'

describe('MovieGuess Integration Tests', () => {
  beforeEach(() => {
    resetStorage()
    clearAllData()
  })

  describe('game initialization', () => {
    test('should initialize game with random movie', () => {
      const restoreRandom = setupRandomSeed(0.5)
      
      try {
        const movie = getRandomMovieSync()
        if (movie) {
          expect(movie.name).toBeDefined()
          expect(movie.duration).toBeDefined()
          expect(typeof movie.duration).toBe('number')
        }
      } finally {
        restoreRandom()
      }
    })
  })

  describe('time selection', () => {
    test('should format and parse time correctly', () => {
      const seconds = 3661 // 61分1秒
      const formatted = formatTime(seconds)
      expect(formatted).toBe('61分1秒')
      
      const parsed = parseTime('61:01')
      expect(parsed).toBe(3661)
    })

    test('should convert between seconds and minutes:seconds', () => {
      const seconds = 3661
      const { minutes, seconds: secs } = secondsToMinutesSeconds(seconds)
      expect(minutes).toBe(61)
      expect(secs).toBe(1)
      
      const convertedBack = minutesSecondsToSeconds(minutes, secs)
      expect(convertedBack).toBe(3661)
    })
  })

  describe('game win and loss flow', () => {
    test('should update stats on win', () => {
      clearAllData()
      const stats = updateGameStats('movie', true, 3)
      
      expect(stats.wins).toBe(1)
      expect(stats.totalGames).toBe(1)
    })

    test('should update stats on loss', () => {
      clearAllData()
      const stats = updateGameStats('movie', false, 8)
      
      expect(stats.losses).toBe(1)
      expect(stats.totalGames).toBe(1)
    })
  })
})
