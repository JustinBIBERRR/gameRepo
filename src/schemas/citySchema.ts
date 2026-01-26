import { GameDataSchema } from './types'

export const citySchema: GameDataSchema = {
  id: 'city',
  name: '城市猜测',
  description: '城市数据配置，包含城市名称、别名、坐标和特征',
  primaryKey: 'name',
  fields: [
    {
      key: 'name',
      label: '城市名称',
      type: 'string',
      required: true,
      placeholder: '例如：北京',
      validation: {
        min: 1,
        max: 50,
        message: '城市名称不能为空'
      }
    },
    {
      key: 'aliases',
      label: '别名',
      type: 'array',
      required: false,
      placeholder: '例如：北京市, Beijing',
      validation: {
        message: '别名必须是字符串数组'
      }
    },
    {
      key: 'latitude',
      label: '纬度',
      type: 'number',
      required: true,
      placeholder: '例如：39.9042',
      validation: {
        min: -90,
        max: 90,
        message: '纬度必须在 -90 到 90 之间'
      }
    },
    {
      key: 'longitude',
      label: '经度',
      type: 'number',
      required: true,
      placeholder: '例如：116.4074',
      validation: {
        min: -180,
        max: 180,
        message: '经度必须在 -180 到 180 之间'
      }
    },
    {
      key: 'features',
      label: '特征',
      type: 'array',
      required: false,
      placeholder: '例如：首都, 直辖市, 历史文化名城',
      validation: {
        message: '特征必须是字符串数组'
      }
    }
  ]
}

export interface CityData {
  name: string
  aliases?: string[]
  latitude: number
  longitude: number
  features?: string[]
}
