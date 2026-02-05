import type { ListenSongItem } from '../utils/listenSongStorage'

/** 默认示例音频（bundled），导入时 fetch 并写入 IndexedDB */
import defaultAudioUrl from './specialPerson.mp3'

export const defaultListenSongAudioUrl = defaultAudioUrl

/** 唯一默认示例：方大同《特别的人》 */
export const defaultListenSongs: Omit<ListenSongItem, 'createdAt'>[] = [
  {
    id: 'special-person',
    lyrics:
      '懂一個人也許要忍耐\n要經過了意外\n才瞭解所謂的愛\n今後的歲月 讓我們一起瞭解\n多少天長地久\n有幾回細水長流',
    answer: '特别的人',
    artist: '方大同',
    hints: ['方大同', '四个字']
  }
]
