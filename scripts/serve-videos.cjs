#!/usr/bin/env node
/**
 * 本地视频静态服务器（带 CORS）
 * 用于在本机演示时提供视频资源，游戏可配置 videoUrl 为 http://127.0.0.1:8080/xxx.mp4
 *
 * 用法：
 *   node scripts/serve-videos.cjs                    # 使用当前目录下的 videos 文件夹，端口 8080
 *   node scripts/serve-videos.cjs C:\Users\xxx\Videos   # 指定目录
 *   node scripts/serve-videos.cjs ./videos 3000      # 指定目录和端口
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const args = process.argv.slice(2)
let dir = path.join(process.cwd(), 'videos')
let port = 8080
if (args.length >= 2) {
  dir = path.resolve(args[0])
  port = parseInt(args[1], 10) || 8080
} else if (args.length === 1) {
  if (/^\d+$/.test(args[0])) {
    port = parseInt(args[0], 10)
  } else {
    dir = path.resolve(args[0])
  }
}

if (!fs.existsSync(dir)) {
  console.error('目录不存在:', dir)
  console.error('请创建该目录并放入视频文件，或传入有效路径，例如：')
  console.error('  node scripts/serve-videos.cjs "C:\\Users\\你的用户名\\Videos"')
  process.exit(1)
}

const mime = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4'
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true)
  let filePath = path.join(dir, parsed.pathname === '/' ? '' : path.normalize(parsed.pathname))
  if (path.relative(dir, filePath).startsWith('..')) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not Found')
      return
    }
    const ext = path.extname(filePath)
    const contentType = mime[ext] || 'application/octet-stream'
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stat.size)
    fs.createReadStream(filePath).pipe(res)
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log('视频服务器已启动（CORS 已开启）')
  console.log('  目录:', dir)
  console.log('  地址: http://127.0.0.1:' + port + '/')
  console.log('  示例: 视频文件 mry.mp4 -> http://127.0.0.1:' + port + '/mry.mp4')
  console.log('在游戏配置中将电影 videoUrl 设为上述地址即可。按 Ctrl+C 停止。')
})
