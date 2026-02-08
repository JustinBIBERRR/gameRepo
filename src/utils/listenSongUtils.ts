import { getAllSongs, getSongWithAudio } from './listenSongStorage'
import type { ListenSongItem } from './listenSongStorage'

/** 仅返回配置中且含有效播放用音频的题目；配置为空时返回空，游戏会提示前往配置 */
export async function getSongsForGame(): Promise<ListenSongItem[]> {
  const all = await getAllSongs()
  const result: ListenSongItem[] = []
  for (const s of all) {
    const { item, audioBlob, audioUrl } = await getSongWithAudio(s.id)
    if (audioBlob || audioUrl) {
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

/** 在同一 session 内避免重复歌曲；用完后重新循环 */
export function pickRandomSongAvoiding(
  songs: ListenSongItem[],
  usedIds: Set<string>
): ListenSongItem | null {
  if (!songs.length) return null
  const available = songs.filter((s) => !usedIds.has(s.id))
  const pool = available.length > 0 ? available : songs
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]
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
