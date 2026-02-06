/**
 * 游戏配置统一管理
 * 
 * 此文件包含所有游戏的基础配置信息，包括：
 * - 游戏类型、标题、描述
 * - 路由路径
 * - 图标和颜色
 * 
 * 所有使用游戏列表的地方都应该从此文件导入，确保数据一致性
 */

import { h } from 'vue'

export type GameType = 'city' | 'hero' | 'movie' | 'visual' | 'listenSong' | 'imageMeme'

export type IconColor = 'blue' | 'purple' | 'red' | 'green' | 'orange'

export interface GameConfig {
  gameType: GameType
  /** i18n key for title, e.g. games.city.title */
  title: string
  /** i18n key for description, e.g. games.city.description */
  description: string
  path: string
  settingsPath: string
  iconColor: IconColor
  icon: () => ReturnType<typeof h>
}

/**
 * 所有游戏的配置列表
 */
export const allGamesConfig: GameConfig[] = [
  {
    gameType: 'city',
    title: 'games.city.title',
    description: 'games.city.description',
    path: '/city-guess',
    settingsPath: '/settings/city',
    iconColor: 'blue',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
      }),
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'
      })
    ])
  },
  {
    gameType: 'hero',
    title: 'games.hero.title',
    description: 'games.hero.description',
    path: '/hero-guess',
    settingsPath: '/settings/hero',
    iconColor: 'purple',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      })
    ])
  },
  {
    gameType: 'movie',
    title: 'games.movie.title',
    description: 'games.movie.description',
    path: '/movie-guess',
    settingsPath: '/settings/movie',
    iconColor: 'red',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
      })
    ])
  },
  {
    gameType: 'listenSong',
    title: 'games.listenSong.title',
    description: 'games.listenSong.description',
    path: '/listen-song-guess',
    settingsPath: '/settings/listen-song',
    iconColor: 'green',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
      })
    ])
  },
  {
    gameType: 'visual',
    title: 'games.visual.title',
    description: 'games.visual.description',
    path: '/visual-guess',
    settingsPath: '/settings/visual',
    iconColor: 'orange',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
      })
    ])
  },
  {
    gameType: 'imageMeme',
    title: 'games.imageMeme.title',
    description: 'games.imageMeme.description',
    path: '/image-meme-guess',
    settingsPath: '/settings/image-meme',
    iconColor: 'orange',
    icon: () => h('svg', {
      class: 'w-6 h-6',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24'
    }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
      })
    ])
  }
]

/**
 * 根据游戏类型获取游戏配置
 */
export function getGameConfig(gameType: GameType): GameConfig | undefined {
  return allGamesConfig.find(game => game.gameType === gameType)
}

/**
 * 根据路径获取游戏配置
 */
export function getGameConfigByPath(path: string): GameConfig | undefined {
  return allGamesConfig.find(game => game.path === path || game.settingsPath === path)
}

/**
 * 获取所有游戏类型
 */
export function getAllGameTypes(): GameType[] {
  return allGamesConfig.map(game => game.gameType)
}
