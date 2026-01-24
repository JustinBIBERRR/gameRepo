import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 开发环境使用相对路径，生产环境使用 /gameRepo/
  base: process.env.NODE_ENV === 'production' ? '/gameRepo/' : '/'
})
