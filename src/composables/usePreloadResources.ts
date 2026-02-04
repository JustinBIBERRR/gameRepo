/**
 * 游戏资源预加载
 * 用于在开始计时/展示内容前预加载图片、视频等资源，避免初次展示时卡顿。
 * 可被看图猜测、电影猜测等游戏复用。
 */

/**
 * 预加载单张图片，返回 Promise
 */
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== 'string') {
      resolve()
      return
    }
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`))
    }
    img.src = url
  })
}

/**
 * 预加载多张图片，全部完成或任一失败后 resolve（失败时仍视为可继续游戏）
 */
export function preloadImages(urls: string[]): Promise<{ success: boolean; error?: Error }> {
  if (!urls?.length) return Promise.resolve({ success: true })
  const promises = urls.map((url) =>
    preloadImage(url).then(
      () => ({ success: true as const }),
      (err: Error) => ({ success: false as const, error: err })
    )
  )
  return Promise.all(promises).then((results) => {
    const failed = results.find((r) => !r.success)
    return failed ? { success: false, error: failed.error } : { success: true }
  })
}

export interface UsePreloadResourcesOptions {
  /** 需要预加载的 URL 列表（ref），一般为当前关卡/题目用到的图片或视频地址 */
  urls: Ref<string[]>
  /** 无 URL 时是否视为已就绪（默认 true） */
  emptyAsReady?: boolean
}

export interface UsePreloadResourcesReturn {
  /** 资源是否已就绪（已预加载完成或无需预加载） */
  isReady: Ref<boolean>
  /** 预加载过程中的错误（可选，用于提示） */
  error: Ref<Error | null>
  /** 手动触发一次预加载（例如 URL 未通过 ref 传入时） */
  preload: (urls: string[]) => Promise<void>
}

/**
 * 根据传入的 URL ref 自动预加载资源，适用于「进入游戏前 / 开始计时前」的 loading 流程。
 * 可覆盖图片、电影等资源的加载。
 */
export function usePreloadResources(
  options: UsePreloadResourcesOptions
): UsePreloadResourcesReturn {
  const { urls, emptyAsReady = true } = options
  const isReady = ref(true)
  const error = ref<Error | null>(null)

  async function doPreload(urlList: string[]) {
    if (!urlList?.length) {
      isReady.value = emptyAsReady
      error.value = null
      return
    }
    isReady.value = false
    error.value = null
    const result = await preloadImages(urlList)
    isReady.value = true
    if (!result.success && result.error) {
      error.value = result.error
    }
  }

  async function preload(urlList: string[]) {
    await doPreload(urlList)
  }

  watch(
    urls,
    (urlList) => {
      doPreload(urlList || [])
    },
    { immediate: true }
  )

  return {
    isReady,
    error,
    preload
  }
}
