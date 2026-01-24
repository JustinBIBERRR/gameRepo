/**
 * 成就系统工具
 * 定义和管理游戏成就
 */

import { getAchievements, saveAchievements, type Achievement } from './storageUtils'
import type { GameStats } from './storageUtils'

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: 'milestone' | 'skill' | 'exploration' | 'time'
  checkCondition: (stats: GameStats, gameType: 'city' | 'hero') => boolean
  getProgress: (stats: GameStats, gameType: 'city' | 'hero') => number
  maxProgress: number
}

// 成就定义列表
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // 里程碑成就
  {
    id: 'first_game',
    name: '初次尝试',
    description: '完成第一局游戏',
    icon: '🎮',
    category: 'milestone',
    maxProgress: 1,
    checkCondition: (stats) => stats.totalGames >= 1,
    getProgress: (stats) => Math.min(stats.totalGames, 1)
  },
  {
    id: 'ten_games',
    name: '游戏新手',
    description: '完成10局游戏',
    icon: '🎯',
    category: 'milestone',
    maxProgress: 10,
    checkCondition: (stats) => stats.totalGames >= 10,
    getProgress: (stats) => Math.min(stats.totalGames, 10)
  },
  {
    id: 'fifty_games',
    name: '游戏达人',
    description: '完成50局游戏',
    icon: '🏆',
    category: 'milestone',
    maxProgress: 50,
    checkCondition: (stats) => stats.totalGames >= 50,
    getProgress: (stats) => Math.min(stats.totalGames, 50)
  },
  {
    id: 'first_win',
    name: '首胜',
    description: '获得第一次胜利',
    icon: '✨',
    category: 'milestone',
    maxProgress: 1,
    checkCondition: (stats) => stats.wins >= 1,
    getProgress: (stats) => Math.min(stats.wins, 1)
  },
  {
    id: 'ten_wins',
    name: '十连胜',
    description: '累计获得10次胜利',
    icon: '🌟',
    category: 'milestone',
    maxProgress: 10,
    checkCondition: (stats) => stats.wins >= 10,
    getProgress: (stats) => Math.min(stats.wins, 10)
  },
  // 技能成就
  {
    id: 'perfect_guess',
    name: '一次猜中',
    description: '仅用1次尝试就猜中答案',
    icon: '🎯',
    category: 'skill',
    maxProgress: 1,
    checkCondition: (stats) => stats.bestScore === 1,
    getProgress: (stats) => stats.bestScore === 1 ? 1 : 0
  },
  {
    id: 'two_attempts',
    name: '两发必中',
    description: '仅用2次尝试就猜中答案',
    icon: '🎪',
    category: 'skill',
    maxProgress: 1,
    checkCondition: (stats) => stats.bestScore <= 2,
    getProgress: (stats) => stats.bestScore <= 2 ? 1 : 0
  },
  {
    id: 'streak_3',
    name: '三连胜',
    description: '连续3次成功',
    icon: '🔥',
    category: 'skill',
    maxProgress: 3,
    checkCondition: (stats) => stats.bestStreak >= 3,
    getProgress: (stats) => Math.min(stats.bestStreak, 3)
  },
  {
    id: 'streak_5',
    name: '五连胜',
    description: '连续5次成功',
    icon: '💪',
    category: 'skill',
    maxProgress: 5,
    checkCondition: (stats) => stats.bestStreak >= 5,
    getProgress: (stats) => Math.min(stats.bestStreak, 5)
  },
  {
    id: 'streak_10',
    name: '十连胜',
    description: '连续10次成功',
    icon: '👑',
    category: 'skill',
    maxProgress: 10,
    checkCondition: (stats) => stats.bestStreak >= 10,
    getProgress: (stats) => Math.min(stats.bestStreak, 10)
  },
  // 时间成就
  {
    id: 'daily_player',
    name: '每日玩家',
    description: '一天内完成5局游戏',
    icon: '📅',
    category: 'time',
    maxProgress: 5,
    checkCondition: (stats) => stats.todayStats.games >= 5,
    getProgress: (stats) => Math.min(stats.todayStats.games, 5)
  }
]

/**
 * 检查并更新所有成就
 */
export function checkAndUpdateAchievements(
  gameType: 'city' | 'hero',
  stats: GameStats
): Achievement[] {
  const achievements = getAchievements()
  const newlyUnlocked: Achievement[] = []
  
  ACHIEVEMENT_DEFINITIONS.forEach(def => {
    const progress = def.getProgress(stats, gameType)
    const maxProgress = def.maxProgress
    
    // 查找或创建成就
    let achievement = achievements.find(a => a.id === def.id)
    const wasUnlocked = achievement?.unlockedAt !== null
    
    if (!achievement) {
      achievement = {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlockedAt: null,
        progress,
        maxProgress
      }
      achievements.push(achievement)
    } else {
      achievement.progress = progress
      achievement.maxProgress = maxProgress
    }
    
    // 检查是否解锁
    if (progress >= maxProgress && !wasUnlocked) {
      achievement.unlockedAt = Date.now()
      newlyUnlocked.push(achievement)
    }
  })
  
  saveAchievements(achievements)
  return newlyUnlocked
}

/**
 * 获取所有成就（按分类）
 */
export function getAchievementsByCategory(): Record<string, Achievement[]> {
  const achievements = getAchievements()
  const byCategory: Record<string, Achievement[]> = {
    milestone: [],
    skill: [],
    exploration: [],
    time: []
  }
  
  achievements.forEach(achievement => {
    const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === achievement.id)
    if (def) {
      byCategory[def.category].push(achievement)
    }
  })
  
  return byCategory
}

/**
 * 获取已解锁的成就数量
 */
export function getUnlockedCount(): number {
  const achievements = getAchievements()
  return achievements.filter(a => a.unlockedAt !== null).length
}

/**
 * 获取成就进度百分比
 */
export function getAchievementProgress(achievementId: string): number {
  const achievements = getAchievements()
  const achievement = achievements.find(a => a.id === achievementId)
  if (!achievement) return 0
  return Math.min((achievement.progress / achievement.maxProgress) * 100, 100)
}
