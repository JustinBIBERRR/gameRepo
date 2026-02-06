/**
 * 看图猜梗工具：题目列表、答案匹配（与电影猜测一致：精确 → 别名 → 模糊）
 */

import { getCustomGameData } from './storageUtils'
import { defaultImageMemeItems } from '../data/imageMemeDefaults'
import type { ImageMemeItem } from '../schemas/imageMemeSchema'

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。！？、；：""''（）【】《》]/g, '')
}

function exactMatch(input: string, item: ImageMemeItem): boolean {
  const n = normalizeString(input)
  return n === normalizeString(item.answer)
}

function aliasMatch(input: string, item: ImageMemeItem): boolean {
  const n = normalizeString(input)
  return (item.aliases ?? []).some(a => normalizeString(a) === n)
}

function fuzzyMatch(input: string, item: ImageMemeItem): boolean {
  const n = normalizeString(input)
  const answerN = normalizeString(item.answer)
  if (answerN.includes(n) || n.includes(answerN)) return true
  return (item.aliases ?? []).some(a => {
    const an = normalizeString(a)
    return an.includes(n) || n.includes(an)
  })
}

/** 获取当前题目列表：优先自定义数据，否则默认 2 条 */
export function getImageMemeItems(): ImageMemeItem[] {
  const custom = getCustomGameData<ImageMemeItem>('imageMeme')
  if (custom?.useCustom && Array.isArray(custom.items) && custom.items.length > 0) {
    return custom.items
  }
  return [...defaultImageMemeItems]
}

/** 匹配当前题目的答案（精确 → 别名 → 模糊），与电影猜测逻辑一致 */
export function matchImageMemeAnswer(input: string, item: ImageMemeItem): boolean {
  const t = input?.trim()
  if (!t) return false
  if (exactMatch(t, item)) return true
  if (aliasMatch(t, item)) return true
  if (fuzzyMatch(t, item)) return true
  return false
}

/** 从尚未使用的题目中随机选一道；usedIds 仅存内存，用光后清空再选 */
export function pickRandomUnusedItem(
  items: ImageMemeItem[],
  usedIds: Set<string>
): ImageMemeItem | null {
  if (items.length === 0) return null
  const available = items.filter(i => !usedIds.has(i.id))
  const pool = available.length > 0 ? available : items
  if (pool.length === 0) return null
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}
