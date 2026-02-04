import type { ListenSongItem } from '../utils/listenSongStorage'

export const defaultListenSongs: Omit<ListenSongItem, 'createdAt'>[] = [
  {
    id: 'daoxiang',
    lyrics: '不要哭让萤火虫带着你逃跑，乡间的歌谣永远的依靠，回家吧回到最初的美好',
    answer: '稻香',
    lang: 'default',
    rate: 1,
    pitch: 1,
    hints: ['周杰伦', '2个字']
  },
  {
    id: 'qingtian',
    lyrics: '有没有口罩一个给我，释怀说了太多就成真不了，也许时间是一种解药',
    answer: '晴天',
    lang: 'yue',
    rate: 1,
    pitch: 1,
    hints: ['周杰伦', '2个字']
  },
  {
    id: 'dongfengpo',
    lyrics: '一盏离愁孤单伫立在窗口，我在门后假装你人还没走，旧地如重游月圆更寂寞',
    answer: '东风破',
    lang: 'ja',
    rate: 0.9,
    pitch: 1,
    hints: ['周杰伦', '三个字']
  }
]
