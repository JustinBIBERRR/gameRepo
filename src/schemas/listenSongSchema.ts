import { GameDataSchema } from './types'

const LANG_OPTIONS = ['default', 'zh-CN', 'yue', 'ja', 'en']

export const listenSongSchema: GameDataSchema = {
  id: 'listenSong',
  name: '听歌识曲',
  description: '歌曲数据配置，包含歌词、答案、揭晓音频等',
  primaryKey: 'id',
  fields: [
    {
      key: 'id',
      label: '歌曲ID',
      type: 'string',
      required: true,
      placeholder: '例如：daoxiang',
      validation: {
        min: 1,
        max: 100,
        pattern: '^[a-zA-Z0-9_-]+$',
        message: '歌曲ID只能包含字母、数字、下划线和连字符'
      }
    },
    {
      key: 'lyrics',
      label: '黄金歌词',
      type: 'string',
      required: true,
      placeholder: '用于 AI 朗读的歌词文本',
      validation: {
        min: 1,
        max: 200,
        message: '歌词不能为空且不超过200字符'
      }
    },
    {
      key: 'answer',
      label: '答案（歌曲名称）',
      type: 'string',
      required: true,
      placeholder: '例如：稻香',
      validation: {
        min: 1,
        max: 100,
        message: '答案不能为空'
      }
    },
    {
      key: 'audioClip',
      label: '揭晓音频',
      type: 'file',
      required: false,
      accept: 'audio/*',
      placeholder: '5-10秒原曲高潮片段（MP3/WAV，不超过5MB）',
      validation: {
        maxSize: 5 * 1024 * 1024,
        message: '请上传音频文件'
      }
    },
    {
      key: 'lang',
      label: '朗读语种',
      type: 'select',
      required: false,
      options: LANG_OPTIONS,
      placeholder: '默认/普通话/粤语/日语/英语'
    },
    {
      key: 'rate',
      label: '语速',
      type: 'number',
      required: false,
      placeholder: '1.0 为正常，0 表示默认',
      validation: { min: 0, max: 2, message: '语速范围 0-2' }
    },
    {
      key: 'pitch',
      label: '音调',
      type: 'number',
      required: false,
      placeholder: '1.0 为正常，0 表示默认',
      validation: { min: 0, max: 2, message: '音调范围 0-2' }
    },
    {
      key: 'hints',
      label: '提示词',
      type: 'array',
      required: false,
      placeholder: '例如：男歌手、四个字',
      validation: { max: 5, message: '最多5条提示' }
    }
  ]
}
