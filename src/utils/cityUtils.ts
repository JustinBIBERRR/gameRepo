import citiesData from '../data/cities.json'
import { matchByPinyin } from './pinyinUtils'
import { getCustomGameData } from './storageUtils'
import type { CityData } from '../schemas/citySchema'

export interface City {
  name: string
  aliases: string[]
  latitude: number
  longitude: number
  features: string[]
}

// 默认城市数据
const defaultCities: City[] = citiesData as City[]

// 获取当前使用的城市数据（优先自定义数据）
function getCities(): City[] {
  const customData = getCustomGameData<CityData>('city')
  if (customData && customData.useCustom && customData.items.length > 0) {
    // 使用自定义数据
    return customData.items.map(item => ({
      name: item.name,
      aliases: item.aliases || [],
      latitude: item.latitude,
      longitude: item.longitude,
      features: item.features || []
    }))
  }
  // 使用默认数据
  return defaultCities
}

// 提供一个函数来获取最新的城市数据（用于动态更新）
export function getCurrentCities(): City[] {
  return getCities()
}

// 为了向后兼容，提供一个 cities 常量（但建议使用 getCurrentCities()）
export const cities: City[] = getCities()

/**
 * 使用 Haversine 公式计算两点间的距离（公里）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // 保留一位小数
}

/**
 * 计算方位角（度）
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRad(lon2 - lon1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)
  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
  let bearing = toDeg(Math.atan2(y, x))
  bearing = (bearing + 360) % 360
  return bearing
}

/**
 * 将方位角转换为方向文字
 */
export function bearingToDirection(bearing: number): string {
  const directions = [
    '北',
    '东北',
    '东',
    '东南',
    '南',
    '西南',
    '西',
    '西北'
  ]
  const index = Math.round(bearing / 45) % 8
  return directions[index]
}

/**
 * 智能匹配城市名称（支持中文、拼音、首字母）
 */
export function matchCity(input: string): City | null {
  const normalizedInput = input.trim()
  const currentCities = getCurrentCities()
  
  for (const city of currentCities) {
    // 精确匹配主名称
    if (city.name === normalizedInput) {
      return city
    }
    
    // 匹配别名（精确匹配）
    for (const alias of city.aliases) {
      if (alias.toLowerCase() === normalizedInput.toLowerCase()) {
        return city
      }
    }
    
    // 使用拼音匹配主名称
    if (matchByPinyin(normalizedInput, city.name)) {
      return city
    }
    
    // 使用拼音匹配别名
    for (const alias of city.aliases) {
      if (matchByPinyin(normalizedInput, alias)) {
        return city
      }
    }
  }
  
  return null
}

/**
 * 获取所有城市名称（用于 autocomplete）
 */
export function getAllCityNames(): string[] {
  return getCurrentCities().map(city => city.name)
}

/**
 * 根据输入搜索城市（用于 autocomplete，支持中文、拼音、首字母）
 */
export function searchCities(query: string): string[] {
  if (!query.trim()) {
    return []
  }
  
  const normalizedQuery = query.trim().toLowerCase()
  const results: string[] = []
  const addedCities = new Set<string>()
  const currentCities = getCurrentCities()
  
  for (const city of currentCities) {
    // 如果已经添加过，跳过
    if (addedCities.has(city.name)) {
      continue
    }
    
    // 检查主名称（使用拼音匹配）
    if (matchByPinyin(normalizedQuery, city.name)) {
      results.push(city.name)
      addedCities.add(city.name)
      continue
    }
    
    // 检查别名（使用拼音匹配）
    for (const alias of city.aliases) {
      if (matchByPinyin(normalizedQuery, alias)) {
        results.push(city.name)
        addedCities.add(city.name)
        break
      }
    }
  }
  
  return results.slice(0, 10) // 最多返回10个结果
}

/**
 * 随机选择一个城市
 */
export function getRandomCity(): City {
  const currentCities = getCurrentCities()
  if (currentCities.length === 0) {
    throw new Error('没有可用的城市数据')
  }
  const index = Math.floor(Math.random() * currentCities.length)
  return currentCities[index]
}

/**
 * 获取城市特点（按顺序，不重复）
 */
export function getCityFeature(city: City, usedFeatures: string[]): string | null {
  for (const feature of city.features) {
    if (!usedFeatures.includes(feature)) {
      return feature
    }
  }
  return null
}

// 辅助函数
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

function toDeg(radians: number): number {
  return radians * (180 / Math.PI)
}
