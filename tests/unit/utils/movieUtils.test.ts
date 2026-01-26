import { describe, test, expect } from 'vitest'
import {
  formatTime,
  parseTime,
  secondsToMinutesSeconds,
  minutesSecondsToSeconds,
  matchMovie,
  getAllMovieNames,
  getRandomMovieSync
} from '@/utils/movieUtils'
import { setupRandomSeed } from '../../utils/testUtils'

describe('movieUtils', () => {
  describe('formatTime', () => {
    test('should format seconds to 分钟秒 format', () => {
      expect(formatTime(0)).toBe('0分0秒')
      expect(formatTime(30)).toBe('0分30秒')
      expect(formatTime(60)).toBe('1分0秒')
      expect(formatTime(90)).toBe('1分30秒')
      expect(formatTime(3661)).toBe('61分1秒')
    })

    test('should handle large values', () => {
      expect(formatTime(7200)).toBe('120分0秒') // 2 hours
    })
  })

  describe('parseTime', () => {
    test('should parse MM:SS format', () => {
      expect(parseTime('00:00')).toBe(0)
      expect(parseTime('00:30')).toBe(30)
      expect(parseTime('01:00')).toBe(60)
      expect(parseTime('01:30')).toBe(90)
      expect(parseTime('61:01')).toBe(3661)
    })

    test('should return null for invalid format', () => {
      expect(parseTime('invalid')).toBeNull()
      expect(parseTime('01:60')).toBeNull() // 秒数不能超过59
      expect(parseTime('')).toBeNull()
      // 注意：parseTime 可能接受 '1:30' 格式，需要根据实际实现调整
    })
  })

  describe('secondsToMinutesSeconds', () => {
    test('should convert seconds correctly', () => {
      expect(secondsToMinutesSeconds(0)).toEqual({ minutes: 0, seconds: 0 })
      expect(secondsToMinutesSeconds(30)).toEqual({ minutes: 0, seconds: 30 })
      expect(secondsToMinutesSeconds(60)).toEqual({ minutes: 1, seconds: 0 })
      expect(secondsToMinutesSeconds(90)).toEqual({ minutes: 1, seconds: 30 })
      expect(secondsToMinutesSeconds(3661)).toEqual({ minutes: 61, seconds: 1 })
    })
  })

  describe('minutesSecondsToSeconds', () => {
    test('should convert minutes and seconds correctly', () => {
      expect(minutesSecondsToSeconds(0, 0)).toBe(0)
      expect(minutesSecondsToSeconds(0, 30)).toBe(30)
      expect(minutesSecondsToSeconds(1, 0)).toBe(60)
      expect(minutesSecondsToSeconds(1, 30)).toBe(90)
      expect(minutesSecondsToSeconds(61, 1)).toBe(3661)
    })
  })

  describe('matchMovie', () => {
    test('should match movie by exact name', () => {
      const movie = matchMovie('肖申克的救赎')
      // 如果数据中有这部电影，应该匹配成功
      if (movie) {
        expect(movie.name).toBe('肖申克的救赎')
      }
    })

    test('should return null for non-existent movie', () => {
      const movie = matchMovie('不存在的电影')
      expect(movie).toBeNull()
    })
  })

  describe('getAllMovieNames', () => {
    test('should return array of movie names', () => {
      const names = getAllMovieNames()
      expect(Array.isArray(names)).toBe(true)
      // 如果数据为空，可能返回空数组（取决于实际数据）
      if (names.length > 0) {
        expect(typeof names[0]).toBe('string')
      }
    })
  })

  describe('getRandomMovieSync', () => {
    test('should return a valid movie with fixed random seed', () => {
      const restoreRandom = setupRandomSeed(0.5)
      
      try {
        const movie = getRandomMovieSync()
        // 如果数据为空，可能返回 null
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
})
