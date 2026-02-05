import type { ListenSongItem } from '../utils/listenSongStorage'

/** 默认示例音频（bundled），每首歌对应独立 URL */
import specialPersonAudio from './songs/specialPerson.mp3'
import liushaAudio from './songs/liusha.mp3'

export type DefaultListenSongItem = Omit<ListenSongItem, 'createdAt'> & { audioUrl: string }

/** 默认示例歌曲（含打包音频 URL） */
export const defaultListenSongs: DefaultListenSongItem[] = [
  {
    id: 'special-person',
    lyrics:
      '懂一個人也許要忍耐\n要經過了意外\n才瞭解所謂的愛\n今後的歲月 讓我們一起瞭解\n多少天長地久\n有幾回細水長流',
    answer: '特别的人',
    artist: '方大同',
    hints: ['方大同', '四个字'],
    audioUrl: specialPersonAudio
  },
  {
    id: 'liusha',
    lyrics:
      '並不是真的路過而已\n也不是真的不會想你\n全都不是真的是騙自己\n其實還愛你 愛著你',
    answer: '流沙',
    artist: '陶喆',
    hints: ['陶喆', '两个字'],
    audioUrl: liushaAudio
  }
]

/** @deprecated 请使用各歌曲的 audioUrl，保留仅为兼容 */
export const defaultListenSongAudioUrl = specialPersonAudio
