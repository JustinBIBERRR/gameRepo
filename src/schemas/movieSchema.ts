import { GameDataSchema } from './types'

export const movieSchema: GameDataSchema = {
  id: 'movie',
  name: '电影猜测',
  description: '电影数据配置，包含电影名称、描述、提示和视频文件',
  primaryKey: 'id',
  fields: [
    {
      key: 'id',
      label: '电影ID',
      type: 'string',
      required: true,
      placeholder: '例如：nezha',
      validation: {
        min: 1,
        max: 100,
        pattern: '^[a-zA-Z0-9_-]+$',
        message: '电影ID只能包含字母、数字、下划线和连字符'
      }
    },
    {
      key: 'name',
      label: '电影名称',
      type: 'string',
      required: true,
      placeholder: '例如：哪吒之魔童降世',
      validation: {
        min: 1,
        max: 100,
        message: '电影名称不能为空'
      }
    },
    {
      key: 'description',
      label: '电影描述',
      type: 'string',
      required: false,
      placeholder: '例如：国产动画电影，讲述哪吒的成长故事',
      validation: {
        max: 500,
        message: '描述不能超过500个字符'
      }
    },
    {
      key: 'hint',
      label: '提示信息',
      type: 'string',
      required: false,
      placeholder: '例如：国产动画、漫威',
      validation: {
        max: 50,
        message: '提示不能超过50个字符'
      }
    },
    {
      key: 'videoUrl',
      label: '视频地址（URL）',
      type: 'string',
      required: false,
      placeholder: '例如：http://127.0.0.1:8080/mry.mp4 或留空后上传文件',
      validation: {
        max: 2048,
        message: '视频地址过长'
      }
    },
    {
      key: 'videoFile',
      label: '电影文件（与 URL 二选一）',
      type: 'file',
      required: false,
      placeholder: '请选择视频文件（MP4格式）或在上方填写 URL',
      validation: {
        message: '请填写视频地址或上传视频文件'
      }
    },
    {
      key: 'nameVariants',
      label: '别名',
      type: 'array',
      required: false,
      placeholder: '例如：哪吒, 魔童降世',
      validation: {
        message: '别名必须是字符串数组'
      }
    },
    {
      key: 'duration',
      label: '时长（秒）',
      type: 'number',
      required: false,
      placeholder: '例如：6660',
      validation: {
        min: 1,
        message: '时长必须大于0'
      }
    },
    {
      key: 'year',
      label: '年份',
      type: 'number',
      required: false,
      placeholder: '例如：2019',
      validation: {
        min: 1900,
        max: 2100,
        message: '年份必须在1900到2100之间'
      }
    }
  ]
}

export interface MovieData {
  id: string
  name: string
  description?: string
  hint?: string
  videoUrl?: string         // 视频地址（优先使用，无需 blob）
  videoFile?: File | string // 或本地上传的文件/路径
  nameVariants?: string[]
  duration?: number
  year?: number
}
