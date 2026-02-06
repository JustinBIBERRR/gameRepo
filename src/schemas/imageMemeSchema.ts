import { GameDataSchema } from './types'

export const imageMemeSchema: GameDataSchema = {
  id: 'imageMeme',
  name: '看图猜梗',
  description: '题目数据配置，每题包含图片与答案（支持 URL 或本地上传）',
  primaryKey: 'id',
  fields: [
    {
      key: 'id',
      label: '题目ID',
      type: 'string',
      required: true,
      placeholder: '例如：pig-guess',
      validation: {
        min: 1,
        max: 100,
        pattern: '^[a-zA-Z0-9_-]+$',
        message: '题目ID只能包含字母、数字、下划线和连字符'
      }
    },
    {
      key: 'image',
      label: '图片',
      type: 'string',
      required: true,
      placeholder: '相对路径如 img/guessPic/xxx.png 或完整 URL；也可在编辑时上传本地文件',
      validation: {
        min: 1,
        max: 2000,
        message: '图片不能为空'
      }
    },
    {
      key: 'answer',
      label: '答案（谜底）',
      type: 'string',
      required: true,
      placeholder: '例如：二锅头',
      validation: {
        min: 1,
        max: 100,
        message: '答案不能为空'
      }
    },
    {
      key: 'aliases',
      label: '别名（可选，用于匹配）',
      type: 'array',
      required: false,
      placeholder: '例如：二锅头酒、erguotou',
      validation: {
        message: '别名必须是字符串数组'
      }
    }
  ]
}

export interface ImageMemeItem {
  id: string
  image: string
  answer: string
  aliases?: string[]
}
