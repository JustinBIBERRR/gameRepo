/**
 * 听歌识曲数据存储
 * 使用 IndexedDB 存储歌曲元数据与揭晓音频
 */

export interface ListenSongItem {
  id: string
  lyrics: string
  answer: string
  lang?: string
  rate?: number
  pitch?: number
  hints?: string[]
  createdAt: number
}

interface StoredSong extends ListenSongItem {
  audioBlob?: Blob
}

const DB_NAME = 'ListenSongDB'
const DB_VERSION = 1
const STORE_NAME = 'songs'

const MAX_AUDIO_SIZE = 5 * 1024 * 1024 // 5MB

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
      const items = (request.result as StoredSong[]).map(({ audioBlob: _b, ...item }) => item)
      resolve(items)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getSongWithAudio(id: string): Promise<{ item: ListenSongItem; audioBlob: Blob | null }> {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_NAME], 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => {
      const stored = request.result as StoredSong | undefined
      if (!stored) {
        resolve({ item: {} as ListenSongItem, audioBlob: null })
        return
      }
      const { audioBlob, ...item } = stored
      resolve({ item, audioBlob: audioBlob ?? null })
    }
    request.onerror = () => reject(request.error)
  })
}

export async function saveSong(
  item: Omit<ListenSongItem, 'createdAt'>,
  audioFile?: File | null
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
  // 构造纯对象，避免 Vue 响应式代理导致 IndexedDB 克隆失败
  const hintsPlain = Array.isArray(item.hints)
    ? item.hints.map((h) => String(h))
    : []
  const toSave: StoredSong = {
    id: String(item.id),
    lyrics: String(item.lyrics),
    answer: String(item.answer),
    lang: item.lang ? String(item.lang) : undefined,
    rate: typeof item.rate === 'number' ? item.rate : undefined,
    pitch: typeof item.pitch === 'number' ? item.pitch : undefined,
    hints: hintsPlain,
    createdAt: (item as ListenSongItem).createdAt ?? existing?.createdAt ?? now
  }
  if (audioFile) {
    if (audioFile.size > MAX_AUDIO_SIZE) {
      throw new Error(`音频文件不能超过 ${MAX_AUDIO_SIZE / 1024 / 1024}MB`)
    }
    toSave.audioBlob = new Blob([audioFile], { type: audioFile.type })
  } else if (existing?.audioBlob) {
    toSave.audioBlob = existing.audioBlob
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
