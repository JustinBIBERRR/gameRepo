/**
 * 统一存储管理工具
 * 管理 localStorage 和 sessionStorage 的统一接口
 */

const STORAGE_KEYS = {
  // 游戏统计数据
  CITY_GAME_STATS: 'cityGameStats',
  HERO_GAME_STATS: 'heroGameStats',
  MOVIE_GAME_STATS: 'movieGameStats',
  // 成就系统
  ACHIEVEMENTS: 'achievements',
  // 游戏历史记录
  GAME_HISTORY: 'gameHistory',
  // 会话统计（保留兼容性）
  GAME_STATS: 'gameStats',
  // 游戏设置
  GAME_SETTINGS: 'gameSettings',
  // 倒计时状态
  GAME_TIMER_STATE: 'gameTimerState'
} as const

export interface GameStats {
  totalGames: number
  wins: number
  losses: number
  bestScore: number // 最少尝试次数
  averageAttempts: number
  currentStreak: number // 当前连续成功次数
  bestStreak: number // 最佳连续成功次数
  todayStats: {
    date: string
    games: number
    wins: number
  }
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: number | null // 时间戳
  progress: number
  maxProgress: number
}

export interface GameHistoryEntry {
  gameType: 'city' | 'hero' | 'movie'
  date: number
  won: boolean
  attempts: number
  target: string
}

export interface GameSettings {
  defaults: {
    timerDuration: number      // 倒计时时长（分钟），默认5
    maxAttempts: number         // 最大尝试次数，默认5
    showInitialHint: boolean     // 是否显示初始提示，默认true
    maxPlaybackPerSegment?: number  // 每个片段最多播放次数（仅电影游戏），默认3
  }
  overrides: {
    city?: {
      timerDuration?: number
      maxAttempts?: number
      showInitialHint?: boolean
    }
    hero?: {
      timerDuration?: number
      maxAttempts?: number
      showInitialHint?: boolean
    }
    movie?: {
      timerDuration?: number
      maxAttempts?: number
      showInitialHint?: boolean
      maxPlaybackPerSegment?: number  // 每个片段最多播放次数
    }
  }
}

export interface GameConfig {
  timerDuration: number
  maxAttempts: number
  showInitialHint: boolean
  maxPlaybackPerSegment?: number  // 每个片段最多播放次数（仅电影游戏）
}

export interface TimerState {
  gameType: 'city' | 'hero' | 'movie'
  startTime: number        // 倒计时开始时间戳
  remainingSeconds: number // 剩余秒数
  isRunning: boolean       // 是否正在运行
}

/**
 * 获取 localStorage 数据
 */
function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (e) {
    console.error(`Failed to get localStorage key ${key}:`, e)
    return defaultValue
  }
}

/**
 * 设置 localStorage 数据
 */
function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to set localStorage key ${key}:`, e)
  }
}

/**
 * 获取 sessionStorage 数据
 */
function getSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = sessionStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (e) {
    console.error(`Failed to get sessionStorage key ${key}:`, e)
    return defaultValue
  }
}

/**
 * 设置 sessionStorage 数据
 */
function setSessionStorage<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Failed to set sessionStorage key ${key}:`, e)
  }
}

/**
 * 初始化游戏统计数据
 */
function initGameStats(): GameStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    bestScore: Infinity,
    averageAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    todayStats: {
      date: new Date().toDateString(),
      games: 0,
      wins: 0
    }
  }
}

/**
 * 获取游戏统计数据
 */
export function getGameStats(gameType: 'city' | 'hero' | 'movie'): GameStats {
  const key = gameType === 'city' 
    ? STORAGE_KEYS.CITY_GAME_STATS 
    : gameType === 'hero'
    ? STORAGE_KEYS.HERO_GAME_STATS
    : STORAGE_KEYS.MOVIE_GAME_STATS
  return getLocalStorage(key, initGameStats())
}

/**
 * 更新游戏统计数据
 */
export function updateGameStats(
  gameType: 'city' | 'hero' | 'movie',
  won: boolean,
  attempts: number
): GameStats {
  const stats = getGameStats(gameType)
  const today = new Date().toDateString()
  
  // 更新今日统计
  if (stats.todayStats.date !== today) {
    stats.todayStats = {
      date: today,
      games: 0,
      wins: 0
    }
  }
  
  stats.totalGames++
  stats.todayStats.games++
  
  if (won) {
    stats.wins++
    stats.todayStats.wins++
    stats.currentStreak++
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak
    }
    // 更新最佳成绩（最少尝试次数）
    if (attempts < stats.bestScore) {
      stats.bestScore = attempts
    }
  } else {
    stats.losses++
    stats.currentStreak = 0
  }
  
  // 更新平均尝试次数
  const totalAttempts = stats.averageAttempts * (stats.totalGames - 1) + attempts
  stats.averageAttempts = Math.round((totalAttempts / stats.totalGames) * 10) / 10
  
  const key = gameType === 'city' 
    ? STORAGE_KEYS.CITY_GAME_STATS 
    : gameType === 'hero'
    ? STORAGE_KEYS.HERO_GAME_STATS
    : STORAGE_KEYS.MOVIE_GAME_STATS
  setLocalStorage(key, stats)
  
  // 保存游戏历史
  addGameHistory(gameType, won, attempts)
  
  return stats
}

/**
 * 添加游戏历史记录
 */
function addGameHistory(gameType: 'city' | 'hero' | 'movie', won: boolean, attempts: number): void {
  const history = getGameHistory()
  const entry: GameHistoryEntry = {
    gameType,
    date: Date.now(),
    won,
    attempts,
    target: '' // 目标信息，由游戏组件填充
  }
  history.push(entry)
  
  // 只保留最近 100 条记录
  if (history.length > 100) {
    history.shift()
  }
  
  setLocalStorage(STORAGE_KEYS.GAME_HISTORY, history)
}

/**
 * 获取游戏历史记录
 */
export function getGameHistory(): GameHistoryEntry[] {
  return getLocalStorage(STORAGE_KEYS.GAME_HISTORY, [])
}

/**
 * 获取成就数据
 */
export function getAchievements(): Achievement[] {
  return getLocalStorage(STORAGE_KEYS.ACHIEVEMENTS, [])
}

/**
 * 保存成就数据
 */
export function saveAchievements(achievements: Achievement[]): void {
  setLocalStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements)
}

/**
 * 更新成就进度
 */
export function updateAchievementProgress(
  achievementId: string,
  progress: number,
  maxProgress: number
): Achievement | null {
  const achievements = getAchievements()
  let achievement = achievements.find(a => a.id === achievementId)
  
  if (!achievement) {
    // 创建新成就
    achievement = {
      id: achievementId,
      name: '',
      description: '',
      icon: '',
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
  if (achievement.progress >= achievement.maxProgress && !achievement.unlockedAt) {
    achievement.unlockedAt = Date.now()
  }
  
  saveAchievements(achievements)
  return achievement
}

/**
 * 迁移 sessionStorage 数据到 localStorage
 */
export function migrateSessionToLocal(): void {
  // 迁移游戏统计
  const sessionStats = getSessionStorage(STORAGE_KEYS.GAME_STATS, { wins: 0, losses: 0, total: 0 })
  
  if (sessionStats.total > 0) {
    // 如果有会话数据，合并到本地存储
    const cityStats = getGameStats('city')
    const heroStats = getGameStats('hero')
    
    // 简单合并逻辑：如果有会话数据，说明用户之前使用过
    // 这里可以根据需要调整合并策略
    if (cityStats.totalGames === 0 && heroStats.totalGames === 0) {
      // 如果本地没有数据，可以尝试分配会话数据
      // 但无法确定是哪个游戏的，所以暂时不自动分配
    }
  }
}

/**
 * 保存当前游戏状态到 sessionStorage（临时）
 */
export function saveGameState<T>(key: string, state: T): void {
  setSessionStorage(key, state)
}

/**
 * 从 sessionStorage 加载游戏状态（临时）
 */
export function loadGameState<T>(key: string, defaultValue: T): T {
  return getSessionStorage(key, defaultValue)
}

/**
 * 清除所有数据
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  // 不清除 sessionStorage，因为可能还有当前游戏状态
}

/**
 * 清除特定游戏的数据
 */
export function clearGameData(gameType: 'city' | 'hero' | 'movie'): void {
  const key = gameType === 'city' 
    ? STORAGE_KEYS.CITY_GAME_STATS 
    : gameType === 'hero'
    ? STORAGE_KEYS.HERO_GAME_STATS
    : STORAGE_KEYS.MOVIE_GAME_STATS
  localStorage.removeItem(key)
  const sessionKey = gameType === 'city' 
    ? 'cityGuessGame' 
    : gameType === 'hero'
    ? 'heroGuessGame'
    : 'movieGuessGame'
  sessionStorage.removeItem(sessionKey)
}

/**
 * 初始化游戏设置
 */
function initGameSettings(): GameSettings {
  return {
    defaults: {
      timerDuration: 5,
      maxAttempts: 5,
      showInitialHint: true,
      maxPlaybackPerSegment: 3  // 默认每个片段最多播放3次
    },
    overrides: {}
  }
}

/**
 * 获取游戏设置
 */
export function getGameSettings(): GameSettings {
  return getLocalStorage(STORAGE_KEYS.GAME_SETTINGS, initGameSettings())
}

/**
 * 保存游戏设置
 */
export function saveGameSettings(settings: GameSettings): void {
  setLocalStorage(STORAGE_KEYS.GAME_SETTINGS, settings)
}

/**
 * 获取游戏配置（优先返回游戏类型覆盖，否则返回全局默认值）
 */
export function getGameConfig(gameType: 'city' | 'hero' | 'movie'): GameConfig {
  const settings = getGameSettings()
  const override = settings.overrides[gameType]
  
  const config: GameConfig = {
    timerDuration: override?.timerDuration ?? settings.defaults.timerDuration,
    maxAttempts: override?.maxAttempts ?? settings.defaults.maxAttempts,
    showInitialHint: override?.showInitialHint ?? settings.defaults.showInitialHint
  }
  
  // 电影游戏特有的配置
  if (gameType === 'movie') {
    config.maxPlaybackPerSegment = override?.maxPlaybackPerSegment ?? settings.defaults.maxPlaybackPerSegment ?? 3
  }
  
  return config
}

/**
 * 保存倒计时状态到 sessionStorage
 */
export function saveTimerState(state: TimerState): void {
  setSessionStorage(STORAGE_KEYS.GAME_TIMER_STATE, state)
}

/**
 * 从 sessionStorage 加载倒计时状态
 */
export function loadTimerState(): TimerState | null {
  return getSessionStorage<TimerState | null>(STORAGE_KEYS.GAME_TIMER_STATE, null)
}

/**
 * 清除倒计时状态
 */
export function clearTimerState(): void {
  sessionStorage.removeItem(STORAGE_KEYS.GAME_TIMER_STATE)
}
