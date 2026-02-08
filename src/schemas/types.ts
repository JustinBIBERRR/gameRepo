/**
 * Schema 类型定义
 * 用于定义游戏数据的结构和验证规则
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'array' | 'select' | 'file'

export interface FieldSchema {
  key: string              // 字段键名
  label: string            // 显示名称
  type: FieldType          // 字段类型
  required?: boolean       // 是否必填
  options?: string[]       // select 类型的选项
  placeholder?: string     // 占位提示
  accept?: string          // 文件类型时使用的 accept 属性，如 audio/*、video/mp4
  rows?: number            // string 类型时作为 textarea 显示的行数（如 8），并带滚动
  validation?: {           // 验证规则
    min?: number
    max?: number
    maxSize?: number       // 文件类型最大字节数，如 5*1024*1024 表示 5MB
    pattern?: string
    message?: string
  }
}

export interface GameDataSchema {
  id: string               // Schema ID (如 'city', 'hero', 'movie')
  name: string             // 显示名称
  description: string      // 描述
  fields: FieldSchema[]    // 字段定义
  primaryKey: string       // 主键字段
}

/**
 * 验证字段值
 */
export function validateField(field: FieldSchema, value: any): string | null {
  // 必填验证
  if (field.required) {
    if (field.type === 'file') {
      // 文件类型：检查是否为File对象
      if (!(value instanceof File)) {
        return field.validation?.message || `${field.label}不能为空`
      }
    } else if (value === null || value === undefined || value === '') {
      return field.validation?.message || `${field.label}不能为空`
    }
  }

  // 类型验证
  if (value !== null && value !== undefined && value !== '' && !(field.type === 'file' && !(value instanceof File))) {
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          return `${field.label}必须是字符串`
        }
        if (field.validation?.min && value.length < field.validation.min) {
          return `${field.label}长度不能少于${field.validation.min}个字符`
        }
        if (field.validation?.max && value.length > field.validation.max) {
          return `${field.label}长度不能超过${field.validation.max}个字符`
        }
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(value)) {
            return field.validation.message || `${field.label}格式不正确`
          }
        }
        break
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${field.label}必须是数字`
        }
        if (field.validation?.min !== undefined && value < field.validation.min) {
          return `${field.label}不能小于${field.validation.min}`
        }
        if (field.validation?.max !== undefined && value > field.validation.max) {
          return `${field.label}不能大于${field.validation.max}`
        }
        break
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${field.label}必须是布尔值`
        }
        break
      case 'array':
        if (!Array.isArray(value)) {
          return `${field.label}必须是数组`
        }
        if (field.validation?.min !== undefined && value.length < field.validation.min) {
          return `${field.label}至少需要${field.validation.min}项`
        }
        if (field.validation?.max !== undefined && value.length > field.validation.max) {
          return `${field.label}不能超过${field.validation.max}项`
        }
        break
      case 'select':
        if (field.options && !field.options.includes(value)) {
          return `${field.label}必须是以下选项之一：${field.options.join('、')}`
        }
        break
      case 'file':
        if (value instanceof File) {
          if (field.validation?.maxSize !== undefined && value.size > field.validation.maxSize) {
            const mb = Math.round(field.validation.maxSize / 1024 / 1024)
            return `${field.label}不能超过 ${mb}MB`
          }
        } else if (field.required) {
          return field.validation?.message || `${field.label}必须是文件`
        }
        break
    }
  }

  return null
}

/**
 * 验证完整数据对象
 */
export function validateData(schema: GameDataSchema, data: Record<string, any>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const field of schema.fields) {
    const value = data[field.key]
    const error = validateField(field, value)
    if (error) {
      errors[field.key] = error
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
