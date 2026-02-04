/**
 * 统一存储管理工具
 * 管理 localStorage 和 sessionStorage 的统一接口
 */

const STORAGE_KEYS = {
  // 游戏统计数据
  CITY_GAME_STATS: 'cityGameStats',
  HERO_GAME_STATS: 'heroGameStats',
  MOVIE_GAME_STATS: 'movieGameStats',
  VISUAL_GAME_STATS: 'visualGameStats',
  LISTEN_SONG_GAME_STATS: 'listenSongGameStats',
  // 成就系统
  ACHIEVEMENTS: 'achievements',
  // 游戏历史记录
  GAME_HISTORY: 'gameHistory',
  // 会话统计（保留兼容性）
  GAME_STATS: 'gameStats',
  // 游戏设置
  GAME_SETTINGS: 'gameSettings',
  // 倒计时状态
  GAME_TIMER_STATE: 'gameTimerState',
  // 迁移标记
  SETTINGS_MIGRATED: 'settingsMigrated',
  // 自定义游戏数据
  CUSTOM_CITY_DATA: 'customCityData',
  CUSTOM_HERO_DATA: 'customHeroData',
  CUSTOM_MOVIE_DATA: 'customMovieData',
  CUSTOM_VISUAL_DATA: 'customVisualData',
  // 游戏显示/隐藏状态
  GAME_VISIBILITY: 'gameVisibility',
  // Settings 元数据
  SETTINGS_META: 'settingsMeta',
  // 年会活动：随机奖惩列表、人员名单
  PARTY_REWARDS_PUNISHMENTS: 'partyRewardsPunishments',
  PARTY_PERSONNEL: 'partyPersonnel'
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
  gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong'
  date: number
  won: boolean
  attempts: number
  target: string
}

export interface GameSettings {
  defaults: {
    enableTimer: boolean        // 是否启用倒计时，默认true
    timerDuration: number      // 倒计时时长（分钟），默认5
    limitAttempts: boolean     // 是否启用尝试次数限制，默认 false = 无限次
    maxAttempts: number        // 启用限制时的最大尝试次数，默认5
    showInitialHint: boolean     // 是否显示初始提示，默认true
    maxPlaybackPerSegment?: number  // 每个片段最多播放次数（仅电影游戏），默认1
  }
  overrides: {
    city?: {
      enableTimer?: boolean
      timerDuration?: number
      limitAttempts?: boolean
      maxAttempts?: number
      showInitialHint?: boolean
    }
    hero?: {
      enableTimer?: boolean
      timerDuration?: number
      limitAttempts?: boolean
      maxAttempts?: number
      showInitialHint?: boolean
    }
    movie?: {
      enableTimer?: boolean
      timerDuration?: number
      limitAttempts?: boolean
      maxAttempts?: number
      showInitialHint?: boolean
      maxPlaybackPerSegment?: number  // 每个片段最多播放次数
    }
    visual?: {
      enableTimer?: boolean
      timerDuration?: number
      limitAttempts?: boolean
      maxAttempts?: number
      showInitialHint?: boolean
      showCategoryHint?: boolean
      /** 游戏开始时显示的初始提示文案，如：生活用品、品牌logo、国旗等 */
      initialHint?: string
      /** 图片壳等分：行数、列数，如 2×2=4 格 */
      gridRows?: number
      gridCols?: number
    }
    listenSong?: {
      enableTimer?: boolean
      timerDuration?: number
      limitAttempts?: boolean
      maxAttempts?: number
      showInitialHint?: boolean
    }
  }
}

export interface GameConfig {
  enableTimer: boolean
  timerDuration: number
  /** 是否启用尝试次数限制；不启用时 maxAttempts 在运行时为 Infinity */
  limitAttempts: boolean
  maxAttempts: number
  showInitialHint: boolean
  maxPlaybackPerSegment?: number  // 每个片段最多播放次数（仅电影游戏）
}

/** 运行时“无限次尝试”时的 maxAttempts 值 */
export const UNLIMITED_ATTEMPTS = Infinity

export interface TimerState {
  gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong'
  startTime: number        // 倒计时开始时间戳
  remainingSeconds: number // 剩余秒数
  isRunning: boolean       // 是否正在运行
}

export interface CustomGameData<T> {
  useCustom: boolean       // 是否使用自定义数据
  items: T[]               // 自定义数据项
  lastModified: number     // 最后修改时间
  expiresAt: number        // 过期时间戳（基于 lastModified + 过期天数计算）
}

export interface GameVisibility {
  city: boolean
  hero: boolean
  movie: boolean
  visual: boolean
  listenSong: boolean
}

export interface SettingsMeta {
  dataExpirationDays: number  // 数据过期天数，默认 30
  lastAccess: number          // 最后访问时间
}

/** 年会：奖惩条目（奖励/惩罚 + 文字描述） */
export interface PartyRewardPunishmentItem {
  id: string
  type: 'reward' | 'punishment'
  text: string
}

/** 年会：人员名单条目 */
export interface PartyPersonnelItem {
  id: string
  name: string
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
export function getGameStats(gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong'): GameStats {
  const keyMap: Record<typeof gameType, string> = {
    city: STORAGE_KEYS.CITY_GAME_STATS,
    hero: STORAGE_KEYS.HERO_GAME_STATS,
    movie: STORAGE_KEYS.MOVIE_GAME_STATS,
    visual: STORAGE_KEYS.VISUAL_GAME_STATS,
    listenSong: STORAGE_KEYS.LISTEN_SONG_GAME_STATS
  }
  return getLocalStorage(keyMap[gameType], initGameStats())
}

/**
 * 更新游戏统计数据
 */
export function updateGameStats(
  gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong',
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

  const keyMap: Record<typeof gameType, string> = {
    city: STORAGE_KEYS.CITY_GAME_STATS,
    hero: STORAGE_KEYS.HERO_GAME_STATS,
    movie: STORAGE_KEYS.MOVIE_GAME_STATS,
    visual: STORAGE_KEYS.VISUAL_GAME_STATS,
    listenSong: STORAGE_KEYS.LISTEN_SONG_GAME_STATS
  }
  setLocalStorage(keyMap[gameType], stats)

  // 保存游戏历史
  addGameHistory(gameType, won, attempts)

  return stats
}

/**
 * 添加游戏历史记录
 */
function addGameHistory(gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong', won: boolean, attempts: number): void {
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
export function clearGameData(gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong'): void {
  const keyMap: Record<typeof gameType, string> = {
    city: STORAGE_KEYS.CITY_GAME_STATS,
    hero: STORAGE_KEYS.HERO_GAME_STATS,
    movie: STORAGE_KEYS.MOVIE_GAME_STATS,
    visual: STORAGE_KEYS.VISUAL_GAME_STATS,
    listenSong: STORAGE_KEYS.LISTEN_SONG_GAME_STATS
  }
  localStorage.removeItem(keyMap[gameType])
  const sessionKeyMap: Record<typeof gameType, string> = {
    city: 'cityGuessGame',
    hero: 'heroGuessGame',
    movie: 'movieGuessGame',
    visual: 'visualGuessGame',
    listenSong: 'listenSongGuessGame'
  }
  sessionStorage.removeItem(sessionKeyMap[gameType])
}

/**
 * 初始化游戏设置
 */
function initGameSettings(): GameSettings {
  return {
    defaults: {
      enableTimer: false,
      timerDuration: 5,
      limitAttempts: false,
      maxAttempts: 5,
      showInitialHint: true,
      maxPlaybackPerSegment: 1  // 默认每个片段最多播放1次
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
export function getGameConfig(gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong'): GameConfig {
  const settings = getGameSettings()
  const override = settings.overrides[gameType]
  // 兼容旧数据：未设置 limitAttempts 时视为启用限制
  const defaultLimitAttempts = (settings.defaults as { limitAttempts?: boolean }).limitAttempts
  const limitAttemptsRaw = override?.limitAttempts ?? defaultLimitAttempts
  const limitAttempts = limitAttemptsRaw === undefined ? true : limitAttemptsRaw
  const rawMaxAttempts = override?.maxAttempts ?? settings.defaults.maxAttempts

  const config: GameConfig = {
    enableTimer: override?.enableTimer ?? settings.defaults.enableTimer,
    timerDuration: override?.timerDuration ?? settings.defaults.timerDuration,
    limitAttempts: limitAttempts === true,
    maxAttempts: limitAttempts ? rawMaxAttempts : UNLIMITED_ATTEMPTS,
    showInitialHint: override?.showInitialHint ?? settings.defaults.showInitialHint
  }

  if (gameType === 'visual' && limitAttempts) {
    config.maxAttempts = override?.maxAttempts ?? 3
  }

  if (gameType === 'movie') {
    const movieOverride = settings.overrides.movie
    config.timerDuration = movieOverride?.timerDuration ?? 30
    config.maxPlaybackPerSegment = movieOverride?.maxPlaybackPerSegment ?? settings.defaults.maxPlaybackPerSegment ?? 1
  }

  if (gameType === 'listenSong' && limitAttempts) {
    config.maxAttempts = override?.maxAttempts ?? 5
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

/**
 * 初始化游戏可见性配置
 */
function initGameVisibility(): GameVisibility {
  return {
    city: true,
    hero: true,
    movie: true,
    visual: true,
    listenSong: true
  }
}

/**
 * 获取游戏可见性配置
 */
export function getGameVisibility(): GameVisibility {
  const stored = getLocalStorage<Partial<GameVisibility>>(STORAGE_KEYS.GAME_VISIBILITY, {})
  const defaults = initGameVisibility()
  return {
    city: stored.city ?? defaults.city,
    hero: stored.hero ?? defaults.hero,
    movie: stored.movie ?? defaults.movie,
    visual: stored.visual ?? defaults.visual,
    listenSong: stored.listenSong ?? defaults.listenSong
  }
}

/**
 * 保存游戏可见性配置
 */
export function saveGameVisibility(visibility: GameVisibility): void {
  setLocalStorage(STORAGE_KEYS.GAME_VISIBILITY, visibility)
}

/**
 * 更新单个游戏的可见性
 */
export function updateGameVisibility(gameType: 'city' | 'hero' | 'movie' | 'visual' | 'listenSong', visible: boolean): void {
  const visibility = getGameVisibility()
  visibility[gameType] = visible
  saveGameVisibility(visibility)
}

/**
 * 初始化 Settings 元数据
 */
function initSettingsMeta(): SettingsMeta {
  return {
    dataExpirationDays: 30,
    lastAccess: Date.now()
  }
}

/**
 * 获取 Settings 元数据
 */
export function getSettingsMeta(): SettingsMeta {
  return getLocalStorage(STORAGE_KEYS.SETTINGS_META, initSettingsMeta())
}

/**
 * 保存 Settings 元数据
 */
export function saveSettingsMeta(meta: SettingsMeta): void {
  setLocalStorage(STORAGE_KEYS.SETTINGS_META, meta)
}

/**
 * 更新数据过期天数
 */
export function updateDataExpirationDays(days: number): void {
  const meta = getSettingsMeta()
  meta.dataExpirationDays = Math.max(1, Math.min(365, days))
  saveSettingsMeta(meta)
}

/** 年会：默认奖励/惩罚 mock 数据 */
const PARTY_DEFAULT_REWARDS: PartyRewardPunishmentItem[] = [
  { id: 'party-reward-1', type: 'reward', text: '领取毛绒玩具一个' },
  { id: 'party-reward-2', type: 'reward', text: '领取扑克牌一副' },
  { id: 'party-reward-3', type: 'reward', text: '领取限定饮料一瓶' }
]
const PARTY_DEFAULT_PUNISHMENTS: PartyRewardPunishmentItem[] = [
  { id: 'party-punishment-1', type: 'punishment', text: '唱30s歌' },
  { id: 'party-punishment-2', type: 'punishment', text: '喝一杯养生特制饮料' },
  { id: 'party-punishment-3', type: 'punishment', text: '发一个红包' }
]

function initPartyRewardsPunishments(): PartyRewardPunishmentItem[] {
  return [...PARTY_DEFAULT_REWARDS, ...PARTY_DEFAULT_PUNISHMENTS]
}

/** 年会：默认人员名单 mock 数据 */
const PARTY_DEFAULT_PERSONNEL: PartyPersonnelItem[] = [
  { id: 'party-person-1', name: '张三' },
  { id: 'party-person-2', name: '李四' },
  { id: 'party-person-3', name: '王五' }
]

function initPartyPersonnel(): PartyPersonnelItem[] {
  return [...PARTY_DEFAULT_PERSONNEL]
}

/**
 * 获取年会随机奖惩列表
 */
export function getPartyRewardsPunishments(): PartyRewardPunishmentItem[] {
  return getLocalStorage(STORAGE_KEYS.PARTY_REWARDS_PUNISHMENTS, initPartyRewardsPunishments())
}

/**
 * 保存年会随机奖惩列表
 */
export function savePartyRewardsPunishments(items: PartyRewardPunishmentItem[]): void {
  setLocalStorage(STORAGE_KEYS.PARTY_REWARDS_PUNISHMENTS, items)
}

/**
 * 获取年会人员名单
 */
export function getPartyPersonnel(): PartyPersonnelItem[] {
  return getLocalStorage(STORAGE_KEYS.PARTY_PERSONNEL, initPartyPersonnel())
}

/**
 * 保存年会人员名单
 */
export function savePartyPersonnel(items: PartyPersonnelItem[]): void {
  setLocalStorage(STORAGE_KEYS.PARTY_PERSONNEL, items)
}

/**
 * 获取自定义游戏数据
 */
export function getCustomGameData<T>(gameType: 'city' | 'hero' | 'movie' | 'visual'): CustomGameData<T> | null {
  const key = gameType === 'city'
    ? STORAGE_KEYS.CUSTOM_CITY_DATA
    : gameType === 'hero'
    ? STORAGE_KEYS.CUSTOM_HERO_DATA
    : gameType === 'movie'
    ? STORAGE_KEYS.CUSTOM_MOVIE_DATA
    : STORAGE_KEYS.CUSTOM_VISUAL_DATA
  return getLocalStorage<CustomGameData<T> | null>(key, null)
}

/**
 * 保存自定义游戏数据
 */
export function saveCustomGameData<T>(gameType: 'city' | 'hero' | 'movie' | 'visual', data: CustomGameData<T>): void {
  const meta = getSettingsMeta()
  const expirationMs = meta.dataExpirationDays * 24 * 60 * 60 * 1000

  const customData: CustomGameData<T> = {
    ...data,
    lastModified: Date.now(),
    expiresAt: Date.now() + expirationMs
  }

  const key = gameType === 'city'
    ? STORAGE_KEYS.CUSTOM_CITY_DATA
    : gameType === 'hero'
    ? STORAGE_KEYS.CUSTOM_HERO_DATA
    : gameType === 'movie'
    ? STORAGE_KEYS.CUSTOM_MOVIE_DATA
    : STORAGE_KEYS.CUSTOM_VISUAL_DATA
  setLocalStorage(key, customData)
}

/**
 * 清除自定义游戏数据
 */
export function clearCustomGameData(gameType: 'city' | 'hero' | 'movie' | 'visual'): void {
  const key = gameType === 'city'
    ? STORAGE_KEYS.CUSTOM_CITY_DATA
    : gameType === 'hero'
    ? STORAGE_KEYS.CUSTOM_HERO_DATA
    : gameType === 'movie'
    ? STORAGE_KEYS.CUSTOM_MOVIE_DATA
    : STORAGE_KEYS.CUSTOM_VISUAL_DATA
  localStorage.removeItem(key)
}

/**
 * 检查并清除过期的自定义数据
 * @returns 返回被清除的游戏类型数组
 */
export function checkAndClearExpiredData(): ('city' | 'hero' | 'movie' | 'visual')[] {
  const meta = getSettingsMeta()
  const now = Date.now()
  const expirationMs = meta.dataExpirationDays * 24 * 60 * 60 * 1000
  const clearedGames: ('city' | 'hero' | 'movie' | 'visual')[] = []

  for (const gameType of ['city', 'hero', 'movie', 'visual'] as const) {
    const data = getCustomGameData(gameType)
    if (data && data.useCustom && data.lastModified + expirationMs < now) {
      clearCustomGameData(gameType)
      clearedGames.push(gameType)
    }
  }
  
  // 更新最后访问时间
  meta.lastAccess = now
  saveSettingsMeta(meta)
  
  return clearedGames
}

/**
 * 切换为使用自定义数据（复制默认数据）
 */
export function switchToCustomData<T>(gameType: 'city' | 'hero' | 'movie' | 'visual', defaultData: T[]): CustomGameData<T> {
  const customData: CustomGameData<T> = {
    useCustom: true,
    items: [...defaultData], // 深拷贝
    lastModified: Date.now(),
    expiresAt: 0 // 将在保存时计算
  }
  
  saveCustomGameData(gameType, customData)
  return customData
}

/**
 * 重置为默认数据
 */
export function resetToDefaultData(gameType: 'city' | 'hero' | 'movie' | 'visual'): void {
  clearCustomGameData(gameType)
}

/**
 * 迁移旧设置数据到新格式
 * 将全局默认设置迁移到各游戏的独立配置中
 */
export function migrateSettings(): void {
  // 检查是否已经迁移过
  const migrated = getLocalStorage(STORAGE_KEYS.SETTINGS_MIGRATED, false)
  if (migrated) {
    return
  }
  
  const settings = getGameSettings()
  
  // 如果有全局默认设置，且各游戏没有独立配置，则迁移
  if (settings.defaults && Object.keys(settings.overrides).length === 0) {
    const defaults = settings.defaults
    const limitAttemptsDefault = (defaults as { limitAttempts?: boolean }).limitAttempts ?? true

    // 为每个游戏创建独立配置
    const newOverrides: GameSettings['overrides'] = {
      city: {
        enableTimer: defaults.enableTimer,
        timerDuration: defaults.timerDuration,
        limitAttempts: limitAttemptsDefault,
        maxAttempts: defaults.maxAttempts,
        showInitialHint: defaults.showInitialHint
      },
      hero: {
        enableTimer: defaults.enableTimer,
        timerDuration: defaults.timerDuration,
        limitAttempts: limitAttemptsDefault,
        maxAttempts: defaults.maxAttempts,
        showInitialHint: defaults.showInitialHint
      },
      movie: {
        enableTimer: defaults.enableTimer,
        timerDuration: defaults.timerDuration,
        limitAttempts: limitAttemptsDefault,
        maxAttempts: defaults.maxAttempts,
        showInitialHint: defaults.showInitialHint,
        maxPlaybackPerSegment: defaults.maxPlaybackPerSegment
      }
    }
    
    // 保存迁移后的设置
    saveGameSettings({
      defaults: settings.defaults, // 保留默认值作为后备
      overrides: newOverrides
    })
  }
  
  // 标记迁移完成
  setLocalStorage(STORAGE_KEYS.SETTINGS_MIGRATED, true)
}
