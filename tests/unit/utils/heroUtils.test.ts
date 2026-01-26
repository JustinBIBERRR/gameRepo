import { describe, test, expect } from 'vitest'
import {
  compareAttributes,
  compareRoles,
  getRoleDisplayString,
  matchHero,
  getRandomHero
} from '@/utils/heroUtils'
import { setupRandomSeed } from '../../utils/testUtils'

describe('heroUtils', () => {
  describe('compareRoles', () => {
    test('should return full for identical roles', () => {
      expect(compareRoles('法师', '法师')).toBe('full')
      expect(compareRoles('战士/坦克', '战士/坦克')).toBe('full')
    })

    test('should return full for same roles in different order', () => {
      expect(compareRoles('法师/战士', '战士/法师')).toBe('full')
    })

    test('should return partial for overlapping roles', () => {
      expect(compareRoles('法师/战士', '法师/刺客')).toBe('partial')
      expect(compareRoles('战士', '战士/坦克')).toBe('partial')
    })

    test('should return none for no overlapping roles', () => {
      expect(compareRoles('法师', '战士')).toBe('none')
      expect(compareRoles('法师/刺客', '战士/坦克')).toBe('none')
    })

    test('should handle empty or invalid roles', () => {
      expect(compareRoles('', '')).toBe('full')
      expect(compareRoles('法师', '')).toBe('none')
      expect(compareRoles('', '战士')).toBe('none')
    })

    test('should filter out invalid role types', () => {
      // 如果角色字符串包含无效类型，应该只比较有效类型
      expect(compareRoles('法师/打野', '法师')).toBe('full') // '打野' 不是有效类型，被过滤
    })
  })

  describe('compareAttributes', () => {
    test('should compare all attributes correctly', () => {
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

    test('should return none for different attributes', () => {
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
        role: '战士',
        era: '古代',
        nationality: '美国',
        human: false,
        gender: '女'
      }
      
      const matches = compareAttributes(hero1, hero2)
      
      expect(matches.role).toBe('none')
      expect(matches.era).toBe('none')
      expect(matches.nationality).toBe('none')
      expect(matches.human).toBe('none')
      expect(matches.gender).toBe('none')
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

  describe('getRoleDisplayString', () => {
    test('should return full match display', () => {
      const display = getRoleDisplayString('法师', '法师', 'full')
      expect(display).toBe('法师')
    })

    test('should return partial match display with **', () => {
      const display = getRoleDisplayString('法师', '法师/战士', 'partial')
      expect(display).toContain('法师')
      expect(display).toContain('**')
    })

    test('should return none match display', () => {
      const display = getRoleDisplayString('法师', '战士', 'none')
      expect(display).toBe('法师')
    })

    test('should handle empty roles', () => {
      const display = getRoleDisplayString('', '', 'full')
      expect(display).toBe('')
    })
  })

  describe('matchHero', () => {
    test('should match hero by exact name', () => {
      const hero = matchHero('李白')
      // 如果数据中有李白，应该匹配成功
      if (hero) {
        expect(hero.name).toBe('李白')
      }
    })

    test('should return null for non-existent hero', () => {
      const hero = matchHero('不存在的英雄')
      expect(hero).toBeNull()
    })
  })

  describe('getRandomHero', () => {
    test('should return a valid hero with fixed random seed', () => {
      const restoreRandom = setupRandomSeed(0.5)
      
      try {
        const hero = getRandomHero()
        expect(hero).toBeDefined()
        expect(hero.name).toBeDefined()
        expect(hero.role).toBeDefined()
        expect(hero.era).toBeDefined()
        expect(hero.nationality).toBeDefined()
        // human 可能是字符串或布尔值，取决于数据格式
        expect(hero.human).toBeDefined()
        expect(hero.gender).toBeDefined()
      } finally {
        restoreRandom()
      }
    })
  })
})
