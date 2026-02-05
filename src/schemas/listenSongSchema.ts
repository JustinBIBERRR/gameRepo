import { GameDataSchema } from './types'

export const listenSongSchema: GameDataSchema = {
  id: 'listenSong',
  name: '听歌识曲',
  description: '歌曲数据配置，包含歌词、答案、歌手、AI 生成歌（MP3）等',
  primaryKey: 'id',
  fields: [
    {
      key: 'id',
      label: '歌曲ID',
      type: 'string',
      required: true,
      placeholder: '例如：special-person',
      validation: {
        min: 1,
        max: 100,
        pattern: '^[a-zA-Z0-9_-]+$',
        message: '歌曲ID只能包含字母、数字、下划线和连字符'
      }
    },
    {
      key: 'lyrics',
      label: '歌词',
      type: 'string',
      required: true,
      placeholder: '揭晓时展示的歌词文本',
      validation: {
        min: 1,
        max: 500,
        message: '歌词不能为空且不超过500字符'
      }
    },
    {
      key: 'answer',
      label: '答案（歌曲名称）',
      type: 'string',
      required: true,
      placeholder: '例如：特别的人',
      validation: {
        min: 1,
        max: 100,
        message: '答案不能为空'
      }
    },
    {
      key: 'artist',
      label: '歌手',
      type: 'string',
      required: true,
      placeholder: '例如：方大同',
      validation: {
        min: 1,
        max: 100,
        message: '歌手不能为空且不超过100字符'
      }
    },
    {
      key: 'audioClip',
      label: 'AI 生成歌（MP3）',
      type: 'file',
      required: false,
      accept: 'audio/mpeg,audio/mp3,audio/*',
      placeholder: '游戏内播放的 AI 生成歌（MP3，不超过5MB）；新建时必传',
      validation: {
        maxSize: 5 * 1024 * 1024,
        message: '请上传 MP3 音频文件（不超过5MB）'
      }
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
