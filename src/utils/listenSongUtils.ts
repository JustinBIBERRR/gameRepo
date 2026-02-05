import { getAllSongs, getSongWithAudio } from './listenSongStorage'
import type { ListenSongItem } from './listenSongStorage'
import { defaultListenSongs } from '../data/listenSongDefaults'

/** 仅返回含有效播放用音频的题目；无入库数据时使用默认歌曲，可直接开始游戏 */
export async function getSongsForGame(): Promise<ListenSongItem[]> {
  let all = await getAllSongs()
  if (all.length === 0) {
    all = defaultListenSongs.map((s) => ({ ...s, createdAt: Date.now() }))
  }
  const result: ListenSongItem[] = []
  for (const s of all) {
    const { item, audioBlob } = await getSongWithAudio(s.id)
    if (audioBlob) {
      result.push({
        id: item.id,
        lyrics: item.lyrics,
        answer: item.answer,
        artist: item.artist ?? '',
        hints: item.hints,
        createdAt: item.createdAt
      })
    }
  }
  return result
}

export function pickRandomSong(songs: ListenSongItem[]): ListenSongItem | null {
  if (!songs.length) return null
  return songs[Math.floor(Math.random() * songs.length)]
}

export function normalizeAnswer(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/[，。！？、；：""''（）【】\s,.\-!?;:'"()[\] ]/g, '')
    .toLowerCase()
}

/** 输入中必须包含歌曲名（answer）即判对，歌手（artist）可选 */
export function checkAnswer(userInput: string, answer: string): boolean {
  const normInput = normalizeAnswer(userInput)
  const normAnswer = normalizeAnswer(answer)
  return normInput.includes(normAnswer)
}
