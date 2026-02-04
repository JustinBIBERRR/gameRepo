import { GameDataSchema } from './types'

export const itemSchema: GameDataSchema = {
  id: 'visual',
  name: '看图猜测物品',
  description: '物品数据配置，支持生活用品、品牌logo、国旗、专辑封面等',
  primaryKey: 'name',
  fields: [
    {
      key: 'name',
      label: '物品名称',
      type: 'string',
      required: true,
      placeholder: '例如：键盘、苹果、中国',
      validation: {
        min: 1,
        max: 100,
        message: '物品名称不能为空'
      }
    },
    {
      key: 'aliases',
      label: '别名',
      type: 'array',
      required: false,
      placeholder: '例如：电脑键盘, 机械键盘',
      validation: { message: '别名必须是字符串数组' }
    },
    {
      key: 'category',
      label: '类别',
      type: 'string',
      required: true,
      placeholder: '例如：电子产品、科技品牌、亚洲国家'
    },
    {
      key: 'difficulty',
      label: '难度',
      type: 'select',
      required: true,
      options: ['simple', 'medium', 'hard'],
      placeholder: '选择难度'
    },
    {
      key: 'imageFullUrl',
      label: '图片URL',
      type: 'string',
      required: true,
      placeholder: 'https://... 或 placehold.co/400x300?text=名称'
    },
    {
      key: 'description',
      label: '描述',
      type: 'string',
      required: false,
      placeholder: '物品描述'
    },
    {
      key: 'country',
      label: '国家（国旗必填）',
      type: 'string',
      required: false,
      placeholder: '例如：中国'
    },
    {
      key: 'artist',
      label: '艺术家（专辑可选）',
      type: 'string',
      required: false,
      placeholder: '例如：周杰伦'
    },
    {
      key: 'year',
      label: '年份（专辑可选）',
      type: 'number',
      required: false,
      placeholder: '例如：2001'
    }
  ]
}

export interface ItemImages {
  full: string
  detail?: string
  silhouette?: string
  partial30?: string
  partial50?: string
  partial70?: string
}

export interface ItemData {
  name: string
  aliases?: string[]
  category: string
  difficulty: 'simple' | 'medium' | 'hard'
  images: ItemImages
  hints?: string[]
  description?: string
  country?: string
  artist?: string
  year?: number
}
