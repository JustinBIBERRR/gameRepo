import { pinyin } from 'pinyin-pro'

/**
 * 将中文转换为拼音（不带声调，小写，无空格）
 */
export function toPinyin(text: string): string {
  const result = pinyin(text, { toneType: 'none' })
  // pinyin-pro 默认返回字符串，如 "han yu pin yin"
  const pinyinStr = typeof result === 'string' ? result : (result as any[]).join(' ')
  return pinyinStr.toLowerCase().replace(/\s+/g, '')
}

/**
 * 获取中文的首字母拼音
 */
export function toPinyinInitials(text: string): string {
  return pinyin(text, { pattern: 'first', toneType: 'none' }).toLowerCase().replace(/\s+/g, '')
}

/**
 * 检查输入是否匹配中文文本（支持中文、拼音、首字母）
 * @param input 用户输入
 * @param text 要匹配的中文文本
 * @returns 是否匹配
 */
export function matchByPinyin(input: string, text: string): boolean {
  const normalizedInput = input.trim().toLowerCase()
  const normalizedText = text.trim().toLowerCase()
  
  // 1. 直接匹配中文
  if (normalizedText.includes(normalizedInput) || normalizedInput.includes(normalizedText)) {
    return true
  }
  
  // 2. 匹配完整拼音
  const textPinyin = toPinyin(text)
  if (textPinyin.includes(normalizedInput) || normalizedInput.includes(textPinyin)) {
    return true
  }
  
  // 3. 匹配首字母拼音
  const textInitials = toPinyinInitials(text)
  if (textInitials.includes(normalizedInput) || normalizedInput.includes(textInitials)) {
    return true
  }
  
  // 4. 部分拼音匹配（例如：输入 "sikong" 匹配 "司空震"）
  // 尝试匹配连续的中文字符的拼音
  let inputRemaining = normalizedInput
  let textIndex = 0
  
  while (inputRemaining.length > 0 && textIndex < text.length) {
    let matched = false
    
    // 尝试匹配单个字符的完整拼音
    const charPinyin = toPinyin(text[textIndex])
    if (inputRemaining.startsWith(charPinyin)) {
      inputRemaining = inputRemaining.slice(charPinyin.length)
      textIndex++
      matched = true
      continue
    }
    
    // 尝试匹配单个字符的首字母
    const charInitial = toPinyinInitials(text[textIndex])
    if (charInitial && inputRemaining.startsWith(charInitial)) {
      inputRemaining = inputRemaining.slice(1)
      textIndex++
      matched = true
      continue
    }
    
    // 尝试匹配多个连续字符的拼音（最多尝试3个字符）
    for (let len = 2; len <= Math.min(3, text.length - textIndex); len++) {
      const multiCharPinyin = toPinyin(text.slice(textIndex, textIndex + len))
      if (inputRemaining.startsWith(multiCharPinyin)) {
        inputRemaining = inputRemaining.slice(multiCharPinyin.length)
        textIndex += len
        matched = true
        break
      }
    }
    
    // 如果当前字符无法匹配，尝试从下一个字符开始
    if (!matched) {
      // 如果输入以当前字符的拼音开头（部分匹配）
      if (charPinyin.startsWith(inputRemaining) || inputRemaining.startsWith(charPinyin)) {
        return true
      }
      textIndex++
    }
  }
  
  // 如果所有输入都被匹配了，返回 true
  return inputRemaining.length === 0
}

/**
 * 搜索文本列表，支持拼音匹配
 * @param query 搜索关键词
 * @param items 要搜索的文本列表
 * @returns 匹配的文本列表
 */
export function searchByPinyin(query: string, items: string[]): string[] {
  if (!query.trim()) {
    return []
  }
  
  const normalizedQuery = query.trim().toLowerCase()
  const results: string[] = []
  
  for (const item of items) {
    if (matchByPinyin(normalizedQuery, item)) {
      results.push(item)
    }
  }
  
  return results
}
