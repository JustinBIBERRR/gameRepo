/**
 * 听歌识曲数据存储
 * 使用 IndexedDB 存储歌曲元数据与揭晓音频；未入库时使用默认歌曲与打包音频，可直接开始游戏
 */

import { defaultListenSongs } from '../data/listenSongDefaults'

export interface ListenSongItem {
  id: string
  lyrics: string
  answer: string
  artist: string
  hints?: string[]
  createdAt: number
  audioUrl?: string  // 有则按 URL 播放，不落 blob
}

interface StoredSong extends ListenSongItem {
  audioBlob?: Blob
  audioUrl?: string  // 有则直接按 URL 播放，无需 blob
}

const DB_NAME = 'ListenSongDB'
const DB_VERSION = 1
const STORE_NAME = 'songs'

let db: IDBDatabase | null = null

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(new Error('无法打开 IndexedDB'))
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function getAllSongs(): Promise<ListenSongItem[]> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => {
      const items = (request.result as StoredSong[]).map(({ audioBlob: _b, ...raw }) => ({
        id: raw.id,
        lyrics: raw.lyrics,
        answer: raw.answer,
        artist: raw.artist ?? '',
        hints: raw.hints,
        createdAt: raw.createdAt,
        audioUrl: raw.audioUrl
      }))
      resolve(items)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getSongWithAudio(id: string): Promise<{
  item: ListenSongItem
  audioBlob: Blob | null
  audioUrl?: string
}> {
  const database = await initDB()
  const stored = await new Promise<StoredSong | undefined>((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result as StoredSong | undefined)
    request.onerror = () => reject(request.error)
  })
  if (stored) {
    const { audioBlob, audioUrl, ...item } = stored
    if (audioUrl) {
      return { item, audioBlob: null, audioUrl }
    }
    return { item, audioBlob: audioBlob ?? null }
  }
  // 未入库时使用默认歌曲：若有 audioUrl 直接返回 URL，不拉取 blob
  const defaultSong = defaultListenSongs.find((s) => s.id === id)
  if (defaultSong && 'audioUrl' in defaultSong && defaultSong.audioUrl) {
    const item: ListenSongItem = { ...defaultSong, createdAt: Date.now() }
    return { item, audioBlob: null, audioUrl: defaultSong.audioUrl }
  }
  return { item: {} as ListenSongItem, audioBlob: null }
}

export async function saveSong(
  item: Omit<ListenSongItem, 'createdAt'>,
  audioFile?: File | null,
  audioUrl?: string | null
): Promise<void> {
  const database = await initDB()
  const now = Date.now()
  let existing: StoredSong | undefined
  try {
    const res = await new Promise<StoredSong | undefined>((res, rej) => {
      const tx = database.transaction([STORE_NAME], 'readonly')
      const req = tx.objectStore(STORE_NAME).get(item.id)
      req.onsuccess = () => res(req.result)
      req.onerror = () => rej(req.error)
    })
    existing = res
  } catch {
    existing = undefined
  }
  const hintsPlain = Array.isArray(item.hints)
    ? item.hints.map((h) => String(h))
    : []
  const toSave: StoredSong = {
    id: String(item.id),
    lyrics: String(item.lyrics),
    answer: String(item.answer),
    artist: String(item.artist ?? ''),
    hints: hintsPlain,
    createdAt: (item as ListenSongItem).createdAt ?? existing?.createdAt ?? now
  }
  const urlTrimmed = audioUrl?.trim()
  if (urlTrimmed && (urlTrimmed.startsWith('http://') || urlTrimmed.startsWith('https://'))) {
    toSave.audioUrl = urlTrimmed
  } else if (audioFile) {
    toSave.audioBlob = new Blob([audioFile], { type: audioFile.type })
  } else if (existing?.audioBlob) {
    toSave.audioBlob = existing.audioBlob
  } else if (existing?.audioUrl) {
    toSave.audioUrl = existing.audioUrl
  }
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(toSave)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteSong(id: string): Promise<void> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
