import itemsData from '../data/items.json'
import { getCustomGameData } from './storageUtils'
import { matchByPinyin, searchByPinyin } from './pinyinUtils'
import type { ItemData } from '../schemas/itemSchema'

const defaultItems: ItemData[] = Array.isArray(itemsData) ? (itemsData as ItemData[]) : []

function normalizeItem(row: Record<string, unknown>): ItemData {
  const fullUrl = (row.imageFullUrl as string) || (row.images as { full?: string })?.full || ''
  return {
    ...row,
    name: row.name as string,
    category: row.category as string,
    difficulty: row.difficulty as ItemData['difficulty'],
    images: { full: fullUrl },
    aliases: row.aliases as string[] | undefined,
    hints: row.hints as string[] | undefined,
    description: row.description as string | undefined,
    country: row.country as string | undefined,
    artist: row.artist as string | undefined,
    year: row.year as number | undefined
  } as ItemData
}

function getVisualItems(): ItemData[] {
  const customData = getCustomGameData<Record<string, unknown>>('visual')
  if (customData && customData.useCustom && Array.isArray(customData.items) && customData.items.length > 0) {
    return customData.items.map(normalizeItem)
  }
  return defaultItems
}

export function getCurrentVisualItems(): ItemData[] {
  return getVisualItems()
}

export function matchItem(input: string): ItemData | null {
  const normalized = input.trim()
  if (!normalized) return null
  const items = getCurrentVisualItems()
  for (const item of items) {
    if (item.name === normalized) return item
    if (item.aliases?.some(a => a === normalized)) return item
    if (matchByPinyin(normalized, item.name)) return item
    if (item.aliases?.some(a => matchByPinyin(normalized, a))) return item
    if (item.name.toLowerCase() === normalized.toLowerCase()) return item
    if (item.aliases?.some(a => a.toLowerCase() === normalized.toLowerCase())) return item
  }
  return null
}

export function getAllItemNames(): string[] {
  return getCurrentVisualItems().map(i => i.name)
}

export function searchItems(query: string, limit = 10): string[] {
  if (!query.trim()) return []
  const names = getAllItemNames()
  const results = searchByPinyin(query.trim(), names)
  return results.slice(0, limit)
}

export function getRandomItem(): ItemData | null {
  const items = getCurrentVisualItems()
  if (items.length === 0) return null
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}
