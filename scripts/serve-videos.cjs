#!/usr/bin/env node
/**
 * 本地资源静态服务器（带 CORS）
 * 用于在本机提供视频/音频资源，游戏可配置为 http://127.0.0.1:8080/xxx.mp4
 *
 * 用法：
 *   node scripts/serve-videos.cjs [--open]              # 使用配置文件或默认目录（见下）
 *   node scripts/serve-videos.cjs <目录> [端口] [--open]
 *
 * 默认目录（无参数且无配置文件时）：
 *   Windows: C:\Users\<当前用户名>\Videos
 *   其他:    ~/Videos
 * 配置文件：与本脚本同目录下的 resource-server.config.txt，第一行写资源目录路径。
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')
const os = require('os')
const { execSync } = require('child_process')

const args = process.argv.slice(2).filter((a) => a !== '--open')
const doOpen = process.argv.includes('--open')

function getDefaultDir() {
  const home = os.homedir()
  return path.join(home, 'Videos')
}

function readConfigDir() {
  const scriptDir = path.dirname(__filename)
  const configPath = path.join(scriptDir, 'resource-server.config.txt')
  if (!fs.existsSync(configPath)) return null
  const content = fs.readFileSync(configPath, 'utf8')
  const line = content.split(/\r?\n/).find((l) => {
    const t = l.split('#')[0].trim()
    return t.length > 0
  })
  if (!line) return null
  return line.split('#')[0].trim()
}

let dir
let port = 8080

if (args.length >= 2) {
  dir = path.resolve(args[0])
  port = parseInt(args[1], 10) || 8080
} else if (args.length === 1) {
  if (/^\d+$/.test(args[0])) {
    port = parseInt(args[0], 10)
    dir = readConfigDir() || getDefaultDir()
  } else {
    dir = path.resolve(args[0])
  }
} else {
  dir = readConfigDir() || getDefaultDir()
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
  const baseUrl = 'http://127.0.0.1:' + port + '/'
  console.log('资源服务器已启动（CORS 已开启）')
  console.log('  目录:', dir)
  console.log('  地址:', baseUrl)
  console.log('  示例: 文件 mry.mp4 -> ' + baseUrl + 'mry.mp4')
  console.log('在游戏中将电影/歌曲资源地址设为上述 URL 即可。按 Ctrl+C 停止。')
  if (doOpen && os.platform() === 'win32') {
    try {
      execSync('start "" "' + baseUrl + '"', { stdio: 'ignore' })
    } catch (e) {
      // ignore
    }
  }
})
