/**
 * 打包视频 URL 解析
 * 将 data/videos 下的路径解析为 Vite 打包后的可播放 URL，供预加载与猜电影页面共用
 */

const localVideoModules = import.meta.glob<string>('@/data/videos/*.mp4', {
  eager: true,
  as: 'url'
})

/**
 * 将路径或文件名解析为可播放的 URL（/、http、blob 等）
 * 若已是完整 http(s) 地址（如本地演示用 http://127.0.0.1:8080/xxx.mp4），直接返回
 */
export function getLocalVideoUrl(pathOrFilename: string): string {
  if (!pathOrFilename) return ''
  const trimmed = pathOrFilename.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  const basename = pathOrFilename.replace(/^.*[/\\]/, '')
  const keys = Object.keys(localVideoModules)
  const key = keys.find(
    (k) =>
      k.endsWith(basename) ||
      k.endsWith('/' + basename) ||
      k.endsWith('\\' + basename)
  )
  const resolvedKey = key ?? (keys.length === 1 ? keys[0] : null)
  const url = resolvedKey ? localVideoModules[resolvedKey] : ''
  return url &&
    typeof url === 'string' &&
    (url.startsWith('/') ||
      url.startsWith('http') ||
      url.startsWith('blob:') ||
      url.startsWith('file:'))
    ? url
    : ''
}
