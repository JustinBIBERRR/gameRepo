/**
 * 电影文件存储工具
 * 使用 IndexedDB 存储本地电影文件（File对象）
 */

interface VideoSegment {
  startTime: number       // 片段在电影中的开始时间（秒）
  duration: number        // 片段时长（秒，通常15秒）
  audioFile: File         // 音频文件（MP3）
  videoFile: File         // 视频文件（MP4）
}

// 用户自定义电影信息
export interface UserMovie {
  id: string
  name: string
  nameVariants: string[]  // 别名，用于匹配猜测
  duration: number        // 总时长（秒）
  hint?: string           // 初始提示（可选，如"漫威"、"国产动画"）
  description?: string    // 电影描述（可选）
  year?: number           // 上映年份（可选）
  createdAt: number       // 创建时间戳
}

interface LocalMovieFiles {
  movieId: string
  movie?: UserMovie       // 电影信息（如果存在，说明是用户注册的电影）
  keySegments?: VideoSegment[]  // 关键片段数组（快速路径，可选）
  sourceFile?: File            // 原文件（精确路径，可选）
  sourceBlob?: Blob            // 原文件的Blob数据（用于持久化存储）
  sliceInterval?: number       // 切片间隔（秒，如300表示每5分钟一个片段）
  playbackMode?: 'fast' | 'precise' | 'auto'  // 播放模式
  selectedAt: number           // 选择时间戳
}

const DB_NAME = 'MovieGameDB'
const DB_VERSION = 2  // 升级版本号
const STORE_NAME = 'movieFiles'
const MOVIES_STORE_NAME = 'userMovies'  // 用户电影信息存储

let db: IDBDatabase | null = null

/**
 * 初始化 IndexedDB
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('无法打开 IndexedDB'))
    }

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      const oldVersion = event.oldVersion || 0
      
      // 创建或升级 movieFiles store
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'movieId' })
      }
      
      // 创建或升级 userMovies store（版本2新增）
      if (oldVersion < 2 && !database.objectStoreNames.contains(MOVIES_STORE_NAME)) {
        database.createObjectStore(MOVIES_STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * 保存电影文件配置
 */
export async function saveMovieFiles(movieFiles: LocalMovieFiles): Promise<void> {
  const database = await initDB()
  
  // 如果有sourceFile但没有sourceBlob，将File转换为Blob进行持久化存储
  const filesToSave = { ...movieFiles }
  if (filesToSave.sourceFile && !filesToSave.sourceBlob) {
    filesToSave.sourceBlob = new Blob([filesToSave.sourceFile], { type: filesToSave.sourceFile.type })
  }
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.put(filesToSave)
    
    request.onsuccess = () => {
      resolve()
    }
    
    request.onerror = () => {
      reject(new Error('保存电影文件失败'))
    }
  })
}

/**
 * 获取电影文件配置
 */
export async function getMovieFiles(movieId: string): Promise<LocalMovieFiles | null> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.get(movieId)
    
    request.onsuccess = () => {
      const result = request.result
      if (result) {
        // 如果有sourceBlob但没有sourceFile，从Blob恢复File对象
        if (result.sourceBlob && !result.sourceFile) {
          // 从Blob创建File对象（使用电影ID作为文件名）
          result.sourceFile = new File([result.sourceBlob], `${movieId}.mp4`, { type: result.sourceBlob.type || 'video/mp4' })
        }
      }
      resolve(result || null)
    }
    
    request.onerror = () => {
      reject(new Error('获取电影文件失败'))
    }
  })
}

/**
 * 删除电影文件配置
 */
export async function deleteMovieFiles(movieId: string): Promise<void> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.delete(movieId)
    
    request.onsuccess = () => {
      resolve()
    }
    
    request.onerror = () => {
      reject(new Error('删除电影文件失败'))
    }
  })
}

/**
 * 获取所有电影文件配置
 */
export async function getAllMovieFiles(): Promise<LocalMovieFiles[]> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.getAll()
    
    request.onsuccess = () => {
      resolve(request.result || [])
    }
    
    request.onerror = () => {
      reject(new Error('获取所有电影文件失败'))
    }
  })
}

/**
 * 检查电影是否有本地文件配置
 */
export async function hasMovieFiles(movieId: string): Promise<boolean> {
  const files = await getMovieFiles(movieId)
  return files !== null && (files.sourceFile !== undefined || (files.keySegments && files.keySegments.length > 0))
}

/**
 * 保存用户自定义电影
 */
export async function saveUserMovie(movie: UserMovie): Promise<void> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOVIES_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(MOVIES_STORE_NAME)
    
    const request = store.put(movie)
    
    request.onsuccess = () => {
      resolve()
    }
    
    request.onerror = () => {
      reject(new Error('保存电影信息失败'))
    }
  })
}

/**
 * 获取用户自定义电影
 */
export async function getUserMovie(movieId: string): Promise<UserMovie | null> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOVIES_STORE_NAME], 'readonly')
    const store = transaction.objectStore(MOVIES_STORE_NAME)
    
    const request = store.get(movieId)
    
    request.onsuccess = () => {
      resolve(request.result || null)
    }
    
    request.onerror = () => {
      reject(new Error('获取电影信息失败'))
    }
  })
}

/**
 * 获取所有用户自定义电影
 */
export async function getAllUserMovies(): Promise<UserMovie[]> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOVIES_STORE_NAME], 'readonly')
    const store = transaction.objectStore(MOVIES_STORE_NAME)
    
    const request = store.getAll()
    
    request.onsuccess = () => {
      resolve(request.result || [])
    }
    
    request.onerror = () => {
      reject(new Error('获取所有电影信息失败'))
    }
  })
}

/**
 * 删除用户自定义电影
 */
export async function deleteUserMovie(movieId: string): Promise<void> {
  const database = await initDB()
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOVIES_STORE_NAME], 'readwrite')
    const store = transaction.objectStore(MOVIES_STORE_NAME)
    
    const request = store.delete(movieId)
    
    request.onsuccess = () => {
      resolve()
    }
    
    request.onerror = () => {
      reject(new Error('删除电影信息失败'))
    }
  })
}

/**
 * 导出类型供其他模块使用
 */
export type { LocalMovieFiles, VideoSegment }
