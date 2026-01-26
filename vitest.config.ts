import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router'
      ],
      dts: true,
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
        test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./tests/utils/setupTest.ts'],
          include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/e2e'],
          server: {
            fs: {
              // 允许访问测试资源文件
              allow: ['..']
            }
          },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        '**/coverage/',
        'src/main.ts',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        // 渐进式覆盖策略：核心功能 80%+，整体逐步提升
        // 当前阶段：核心工具函数和 Composables 已覆盖（164个测试通过）
        // 视图组件测试为中等优先级，可在后续迭代中补充
        lines: 45,  // 当前阶段目标（核心功能已覆盖），后续逐步提升到 70%
        functions: 45,
        branches: 30,  // 分支覆盖较低，因为视图组件未测试
        statements: 45
      }
    },
    testTimeout: 10000
  }
})
