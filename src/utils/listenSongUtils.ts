import { getAllSongs } from './listenSongStorage'
import type { ListenSongItem } from './listenSongStorage'

export function getSongsForGame(): Promise<ListenSongItem[]> {
  return getAllSongs()
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

export function checkAnswer(userInput: string, answer: string): boolean {
  return normalizeAnswer(userInput) === normalizeAnswer(answer)
}
