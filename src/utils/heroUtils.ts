import heroesData from '../data/heroes.json'
import { matchByPinyin, searchByPinyin } from './pinyinUtils'
import { getCustomGameData } from './storageUtils'
import type { HeroData } from '../schemas/heroSchema'

export interface Hero {
  name: string
  role: string
  era: string
  nationality: string
  human: string
  gender: string
}

// 默认英雄数据
const defaultHeroes: Hero[] = heroesData as Hero[]

// 获取当前使用的英雄数据（优先自定义数据）
function getHeroes(): Hero[] {
  const customData = getCustomGameData<HeroData>('hero')
  if (customData && customData.useCustom && customData.items.length > 0) {
    // 使用自定义数据
    return customData.items.map(item => ({
      name: item.name,
      role: item.role || '',
      era: item.era || '',
      nationality: item.nationality || '',
      human: item.human || '',
      gender: item.gender || ''
    }))
  }
  // 使用默认数据
  return defaultHeroes
}

// 提供一个函数来获取最新的英雄数据（用于动态更新）
export function getCurrentHeroes(): Hero[] {
  return getHeroes()
}

// 为了向后兼容，提供一个 heroes 常量（但建议使用 getCurrentHeroes()）
export const heroes: Hero[] = getHeroes()

export const attributes = ['role', 'era', 'nationality', 'human', 'gender'] as const
export const attributeLabels = {
  role: '职业',
  era: '年代',
  nationality: '国籍',
  human: '人类',
  gender: '性别'
}

/**
 * 匹配人物名称（支持中文、拼音、首字母）
 */
export function matchHero(input: string): Hero | null {
  const normalizedInput = input.trim()
  const currentHeroes = getCurrentHeroes()
  
  // 优先精确匹配中文名称
  for (const hero of currentHeroes) {
    if (hero.name === normalizedInput) {
      return hero
    }
  }
  
  // 使用拼音匹配
  for (const hero of currentHeroes) {
    if (matchByPinyin(normalizedInput, hero.name)) {
      return hero
    }
  }
  
  return null
}

/**
 * 获取所有人物名称
 */
export function getAllHeroNames(): string[] {
  return getCurrentHeroes().map(hero => hero.name)
}

/**
 * 搜索人物（用于 autocomplete，支持中文、拼音、首字母）
 */
export function searchHeroes(query: string): string[] {
  if (!query.trim()) {
    return []
  }
  
  const heroNames = getCurrentHeroes().map(hero => hero.name)
  const results = searchByPinyin(query, heroNames)
  
  return results.slice(0, 10)
}

/**
 * 随机选择一个人物
 */
export function getRandomHero(): Hero {
  const currentHeroes = getCurrentHeroes()
  if (currentHeroes.length === 0) {
    throw new Error('没有可用的英雄数据')
  }
  const index = Math.floor(Math.random() * currentHeroes.length)
  return currentHeroes[index]
}

/**
 * 提取角色中的标准角色类型
 * 标准角色：战士、法师、刺客、射手、坦克、辅助
 */
const validRoleTypes = ['战士', '法师', '刺客', '射手', '坦克', '辅助']

function extractValidRoles(roleString: string): string[] {
  if (!roleString || typeof roleString !== 'string') {
    return []
  }
  const roles = roleString.split('/').map(r => r.trim())
  return roles.filter(r => validRoleTypes.includes(r))
}

/**
 * 比较两个角色字符串
 * 返回：'full' 完全匹配, 'partial' 部分匹配, 'none' 不匹配
 */
export function compareRoles(role1: string, role2: string): 'full' | 'partial' | 'none' {
  const roles1 = extractValidRoles(role1)
  const roles2 = extractValidRoles(role2)
  
  if (roles1.length === 0 || roles2.length === 0) {
    // 如果没有有效角色，使用完全匹配
    return role1.trim() === role2.trim() ? 'full' : 'none'
  }
  
  // 检查是否有完全匹配
  const role1Set = new Set(roles1)
  const role2Set = new Set(roles2)
  
  // 完全匹配：两个集合完全相同（顺序无关）
  if (role1Set.size === role2Set.size && 
      [...role1Set].every(r => role2Set.has(r))) {
    return 'full'
  }
  
  // 部分匹配：有重叠的角色
  const hasOverlap = [...role1Set].some(r => role2Set.has(r))
  return hasOverlap ? 'partial' : 'none'
}

/**
 * 获取角色匹配的显示字符串
 * @param guessedRole 猜测英雄的角色
 * @param targetRole 目标英雄的角色
 * @param matchStatus 匹配状态
 * @returns 显示字符串，如 "法师 / 打野" 或 "法师 / **"
 */
export function getRoleDisplayString(
  guessedRole: string,
  targetRole: string,
  matchStatus: 'full' | 'partial' | 'none'
): string {
  // 防御性检查
  if (!guessedRole || !targetRole) {
    return guessedRole || targetRole || ''
  }
  
  const guessedRoles = extractValidRoles(guessedRole)
  const targetRoles = extractValidRoles(targetRole)
  
  if (matchStatus === 'full') {
    // 完全匹配：显示目标英雄的所有角色（使用目标角色的顺序）
    return targetRoles.length > 0 ? targetRoles.join(' / ') : targetRole.trim()
  } else if (matchStatus === 'partial') {
    // 部分匹配：找出匹配的角色，目标英雄中未匹配的用 ** 表示
    const matchedRoles: string[] = []
    const unmatchedTargetRoles: string[] = []
    
    // 遍历目标角色的顺序
    for (const targetRoleItem of targetRoles) {
      if (guessedRoles.includes(targetRoleItem)) {
        // 如果猜测英雄有这个角色，加入匹配列表
        matchedRoles.push(targetRoleItem)
      } else {
        // 如果猜测英雄没有这个角色，用 ** 表示
        unmatchedTargetRoles.push('**')
      }
    }
    
    // 组合显示：匹配的角色 + **（未匹配的）
    const displayParts = [...matchedRoles, ...unmatchedTargetRoles]
    return displayParts.length > 0 ? displayParts.join(' / ') : guessedRole.trim()
  } else {
    // 不匹配：显示猜测英雄的所有角色
    return guessedRoles.length > 0 ? guessedRoles.join(' / ') : guessedRole.trim()
  }
}

/**
 * 比较两个人物的属性
 * 返回：Record<string, 'full' | 'partial' | 'none'>
 */
export function compareAttributes(
  hero1: Hero, 
  hero2: Hero
): Record<string, 'full' | 'partial' | 'none'> {
  const matches: Record<string, 'full' | 'partial' | 'none'> = {}
  
  for (const attr of attributes) {
    if (attr === 'role') {
      // 角色使用部分匹配逻辑
      matches[attr] = compareRoles(hero1[attr], hero2[attr])
    } else {
      // 其他属性使用完全匹配
      matches[attr] = hero1[attr] === hero2[attr] ? 'full' : 'none'
    }
  }
  
  return matches
}
