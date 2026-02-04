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

export type GameType = 'city' | 'hero' | 'movie' | 'visual'

export type IconColor = 'blue' | 'purple' | 'red' | 'green' | 'orange'

export interface GameConfig {
  gameType: GameType
  title: string
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
    title: '城市猜测',
    description: '系统随机选择一个国内城市，你有5次机会猜测。每次猜测后会显示距离、方位和城市特点。',
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
    title: '王者荣耀人物猜测',
    description: '系统随机选择一个王者荣耀英雄，你有5次机会猜测。通过职业、年代、国籍、人类、性别等属性提示来找到答案。',
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
    title: '听片段猜电影',
    description: '系统随机选择一部电影，你有8次机会猜测。通过听15秒音频片段来找到答案。',
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
    gameType: 'visual',
    title: '看图猜测物品',
    description: '系统随机选择一件物品（生活用品、品牌logo、国旗、专辑封面等），你有5次提示机会。通过局部细节→轮廓剪影→30%→50%→70%区域逐步猜测。',
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
