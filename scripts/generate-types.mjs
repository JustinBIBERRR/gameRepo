import { build } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')

// 执行构建来触发类型生成
// 即使构建失败，类型文件也会在构建过程中生成
try {
  await build({
    configFile: resolve(root, 'vite.config.ts'),
    mode: 'development',
    build: {
      write: false, // 不写入文件，只生成类型
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(root, 'src', 'main.ts')
      }
    }
  })
  console.log('✓ 类型文件生成成功')
} catch (error) {
  // 类型文件可能在构建过程中已经生成
  // 检查文件是否存在
  const fs = await import('fs')
  const typesFile = resolve(root, 'auto-imports.d.ts')
  if (fs.existsSync(typesFile)) {
    console.log('✓ 类型文件已生成')
    process.exit(0)
  } else {
    console.error('类型文件生成失败:', error.message)
    process.exit(1)
  }
}
