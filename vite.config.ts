import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router'
      ],
      dts: true, // 生成类型声明文件
      eslintrc: {
        enabled: true, // 生成 .eslintrc-auto-import.json
        filepath: './.eslintrc-auto-import.json'
      }
    }),
    // 打包体积分析插件
    visualizer({
      filename: './dist/stats.html', // 输出文件路径
      open: process.env.CI !== 'true', // CI 环境不自动打开浏览器
      gzipSize: true, // 显示 gzip 压缩后的大小
      brotliSize: true, // 显示 brotli 压缩后的大小
      template: 'treemap' // 使用树状图模板 (可选: treemap, sunburst, network)
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 开发环境使用相对路径，生产环境使用 /gameRepo/
  base: process.env.NODE_ENV === 'production' ? '/gameRepo/' : '/'
})
