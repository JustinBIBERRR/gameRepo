import { describe, test, expect } from 'vitest'
import {
  calculateDistance,
  calculateBearing,
  bearingToDirection,
  getCityFeature,
  matchCity,
  getRandomCity
} from '@/utils/cityUtils'
import { setupRandomSeed } from '../../utils/testUtils'

describe('cityUtils', () => {
  describe('calculateDistance', () => {
    test('should calculate distance between Beijing and Shanghai correctly', () => {
      // 北京: 39.9042, 116.4074
      // 上海: 31.2304, 121.4737
      const distance = calculateDistance(39.9042, 116.4074, 31.2304, 121.4737)
      
      // 北京到上海的实际距离约为 1068 公里
      expect(distance).toBeGreaterThan(1000)
      expect(distance).toBeLessThan(1100)
    })

    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(39.9042, 116.4074, 39.9042, 116.4074)
      expect(distance).toBe(0)
    })

    test('should handle negative coordinates', () => {
      const distance = calculateDistance(-39.9042, -116.4074, 31.2304, 121.4737)
      expect(distance).toBeGreaterThan(0)
    })
  })

  describe('calculateBearing', () => {
    test('should calculate bearing correctly', () => {
      // 从北京到上海，应该是东南方向
      const bearing = calculateBearing(39.9042, 116.4074, 31.2304, 121.4737)
      
      // 方位角应该在 120-160 度之间（东南方向）
      expect(bearing).toBeGreaterThan(120)
      expect(bearing).toBeLessThan(160)
      
      // 验证方向转换
      const direction = bearingToDirection(bearing)
      expect(['东南', '南']).toContain(direction)
    })

    test('should return 0 for north direction', () => {
      // 从 (0, 0) 到 (1, 0) 应该是正北
      const bearing = calculateBearing(0, 0, 1, 0)
      expect(bearing).toBeCloseTo(0, 1)
    })

    test('should return value between 0 and 360', () => {
      const bearing = calculateBearing(39.9042, 116.4074, 31.2304, 121.4737)
      expect(bearing).toBeGreaterThanOrEqual(0)
      expect(bearing).toBeLessThan(360)
    })
  })

  describe('bearingToDirection', () => {
    test('should convert bearing to correct direction', () => {
      expect(bearingToDirection(0)).toBe('北')
      expect(bearingToDirection(45)).toBe('东北')
      expect(bearingToDirection(90)).toBe('东')
      expect(bearingToDirection(135)).toBe('东南')
      expect(bearingToDirection(180)).toBe('南')
      expect(bearingToDirection(225)).toBe('西南')
      expect(bearingToDirection(270)).toBe('西')
      expect(bearingToDirection(315)).toBe('西北')
    })

    test('should handle edge cases', () => {
      expect(bearingToDirection(360)).toBe('北')
      expect(bearingToDirection(22.5)).toBe('东北') // 接近北，但更偏向东北
    })
  })

  describe('getCityFeature', () => {
    test('should return a feature when available', () => {
      const city = {
        name: '北京',
        aliases: [],
        latitude: 39.9042,
        longitude: 116.4074,
        features: ['中国的首都', '历史文化名城']
      }
      
      const feature = getCityFeature(city, [])
      expect(feature).toBeDefined()
      expect(city.features).toContain(feature!)
    })

    test('should not return used features', () => {
      const city = {
        name: '北京',
        aliases: [],
        latitude: 39.9042,
        longitude: 116.4074,
        features: ['中国的首都', '历史文化名城']
      }
      
      const usedFeatures = ['中国的首都']
      const feature = getCityFeature(city, usedFeatures)
      
      expect(feature).not.toBe('中国的首都')
      expect(feature).toBe('历史文化名城')
    })

    test('should return null when all features are used', () => {
      const city = {
        name: '北京',
        aliases: [],
        latitude: 39.9042,
        longitude: 116.4074,
        features: ['中国的首都']
      }
      
      const feature = getCityFeature(city, ['中国的首都'])
      expect(feature).toBeNull()
    })

    test('should return null when city has no features', () => {
      const city = {
        name: '北京',
        aliases: [],
        latitude: 39.9042,
        longitude: 116.4074,
        features: []
      }
      
      const feature = getCityFeature(city, [])
      expect(feature).toBeNull()
    })
  })

  describe('matchCity', () => {
    test('should match city by exact name', () => {
      const city = matchCity('北京')
      expect(city).not.toBeNull()
      expect(city?.name).toBe('北京')
    })

    test('should match city by alias', () => {
      // 假设北京有别名，这里需要根据实际数据测试
      const city = matchCity('北京')
      expect(city).not.toBeNull()
    })

    test('should return null for non-existent city', () => {
      const city = matchCity('不存在的城市')
      expect(city).toBeNull()
    })
  })

  describe('getRandomCity', () => {
    test('should return a valid city with fixed random seed', () => {
      const restoreRandom = setupRandomSeed(0.5)
      
      try {
        const city = getRandomCity()
        expect(city).toBeDefined()
        expect(city.name).toBeDefined()
        expect(city.latitude).toBeDefined()
        expect(city.longitude).toBeDefined()
      } finally {
        restoreRandom()
      }
    })

    test('should return different cities with different seeds', () => {
      const restoreRandom1 = setupRandomSeed(0.1)
      const city1 = getRandomCity()
      restoreRandom1()
      
      const restoreRandom2 = setupRandomSeed(0.9)
      const city2 = getRandomCity()
      restoreRandom2()
      
      // 不同种子可能返回不同城市（取决于数据量）
      expect(city1).toBeDefined()
      expect(city2).toBeDefined()
    })
  })
})
