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
      placeholder: '揭晓时展示的歌词文本（多行）',
      rows: 8,
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
      key: 'audioUrl',
      label: '音频地址（URL）',
      type: 'string',
      required: false,
      placeholder: '例如：http://127.0.0.1:8080/xxx.mp3（与下方文件二选一）',
      validation: { max: 2048, message: '音频地址过长' }
    },
    {
      key: 'audioClip',
      label: 'AI 生成歌（MP3 本地上传）',
      type: 'file',
      required: false,
      accept: 'audio/mpeg,audio/mp3,audio/*',
      placeholder: '游戏内播放的 AI 生成歌（MP3）；与 URL 二选一',
      validation: {
        message: '请上传 MP3 或填写音频地址'
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
