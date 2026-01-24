import heroesData from '../data/heroes.json'

export interface Hero {
  name: string
  role: string
  era: string
  nationality: string
  human: string
  gender: string
}

export const heroes: Hero[] = heroesData as Hero[]

export const attributes = ['role', 'era', 'nationality', 'human', 'gender'] as const
export const attributeLabels = {
  role: '职业',
  era: '年代',
  nationality: '国籍',
  human: '人类',
  gender: '性别'
}

/**
 * 匹配人物名称
 */
export function matchHero(input: string): Hero | null {
  const normalizedInput = input.trim()
  
  for (const hero of heroes) {
    if (hero.name === normalizedInput) {
      return hero
    }
  }
  
  return null
}

/**
 * 获取所有人物名称
 */
export function getAllHeroNames(): string[] {
  return heroes.map(hero => hero.name)
}

/**
 * 搜索人物（用于 autocomplete）
 */
export function searchHeroes(query: string): string[] {
  if (!query.trim()) {
    return []
  }
  
  const normalizedQuery = query.trim()
  const results: string[] = []
  
  for (const hero of heroes) {
    if (hero.name.includes(normalizedQuery)) {
      results.push(hero.name)
    }
  }
  
  return results.slice(0, 10)
}

/**
 * 随机选择一个人物
 */
export function getRandomHero(): Hero {
  const index = Math.floor(Math.random() * heroes.length)
  return heroes[index]
}

/**
 * 比较两个人物的属性
 */
export function compareAttributes(hero1: Hero, hero2: Hero): Record<string, boolean> {
  const matches: Record<string, boolean> = {}
  
  for (const attr of attributes) {
    matches[attr] = hero1[attr] === hero2[attr]
  }
  
  return matches
}
