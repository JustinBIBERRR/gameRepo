import { GameDataSchema } from './types'

export const heroSchema: GameDataSchema = {
  id: 'hero',
  name: '英雄猜测',
  description: '王者荣耀英雄数据配置',
  primaryKey: 'name',
  fields: [
    {
      key: 'name',
      label: '英雄名称',
      type: 'string',
      required: true,
      placeholder: '例如：李白',
      validation: {
        min: 1,
        max: 50,
        message: '英雄名称不能为空'
      }
    },
    {
      key: 'role',
      label: '角色定位',
      type: 'select',
      required: false,
      options: ['打野', '法师', '射手', '辅助', '战士', '坦克'],
      placeholder: '选择角色定位'
    },
    {
      key: 'era',
      label: '时代',
      type: 'select',
      required: false,
      options: ['唐朝', '汉朝', '三国', '宋朝', '明朝', '其他'],
      placeholder: '选择时代'
    },
    {
      key: 'nationality',
      label: '国籍',
      type: 'select',
      required: false,
      options: ['中国', '日本', '其他'],
      placeholder: '选择国籍'
    },
    {
      key: 'human',
      label: '类型',
      type: 'select',
      required: false,
      options: ['人类', '非人类'],
      placeholder: '选择类型'
    },
    {
      key: 'gender',
      label: '性别',
      type: 'select',
      required: false,
      options: ['男性', '女性', '其他'],
      placeholder: '选择性别'
    }
  ]
}

export interface HeroData {
  name: string
  role?: string
  era?: string
  nationality?: string
  human?: string
  gender?: string
}
