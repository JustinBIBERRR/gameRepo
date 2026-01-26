# 测试文档

## 概述

本项目使用 Vitest 进行单元测试和集成测试，使用 Playwright 进行 E2E 测试。

## 测试结构

```
tests/
├── unit/                    # 单元测试
│   ├── utils/              # 工具函数测试
│   ├── composables/        # Composables 测试
│   └── components/         # 组件测试
├── integration/            # 集成测试
│   └── games/              # 游戏逻辑测试
├── e2e/                    # E2E 测试
│   ├── home.spec.ts
│   ├── city-guess.spec.ts
│   └── settings.spec.ts
├── utils/                  # 测试工具函数
│   ├── setupTest.ts        # 测试设置
│   ├── testUtils.ts        # 通用测试工具
│   ├── mockData.ts         # Mock 数据
│   └── testWrapper.ts      # Vue 组件测试包装器
└── fixtures/               # 测试数据文件
```

## 运行测试

### 运行所有单元测试
```bash
npm run test:unit
```

### 运行所有测试（包括 watch 模式）
```bash
npm run test
```

### 运行 E2E 测试
```bash
npm run test:e2e
```

### 运行测试 UI（可视化界面）
```bash
npm run test:ui
```

### 生成覆盖率报告
```bash
npm run test:coverage
```

### 运行特定测试文件
```bash
npm run test:unit -- tests/unit/utils/storageUtils.test.ts
```

## 测试编写指南

### 测试命名规范

使用描述性的测试名称，清晰说明测试场景：

```typescript
// ✅ Good
test('should calculate distance between Beijing and Shanghai correctly', () => {})

// ❌ Bad
test('test distance', () => {})
```

### AAA 模式

使用 Arrange-Act-Assert 模式组织测试：

```typescript
test('should update game stats on win', () => {
  // Arrange - 准备测试数据
  const initialStats = getGameStats('city')
  
  // Act - 执行操作
  const updatedStats = updateGameStats('city', true, 3)
  
  // Assert - 验证结果
  expect(updatedStats.wins).toBe(initialStats.wins + 1)
})
```

### 测试数据管理

- **使用真实数据文件**：测试使用项目中的真实数据文件（`src/data/*.json`）
- **固定随机种子**：使用 `setupRandomSeed()` 确保测试可重复
- **清理状态**：每个测试后使用 `resetStorage()` 清理存储

```typescript
import { setupRandomSeed, resetStorage } from '../../utils/testUtils'

beforeEach(() => {
  resetStorage()
})

test('should get random city with fixed seed', () => {
  const restoreRandom = setupRandomSeed(0.5)
  try {
    const city = getRandomCity()
    // 测试逻辑
  } finally {
    restoreRandom()
  }
})
```

### Mock 策略

- **只 mock 外部依赖**：localStorage, sessionStorage, Date, 浏览器 API
- **不 mock 项目内部代码**：除非测试复杂依赖关系
- **使用真实数据**：优先使用项目中的真实数据文件

### 测试覆盖率

- **核心功能**（工具函数、Composables、游戏逻辑）：目标 80%+
- **非核心组件**（UI 展示组件）：目标 60%+
- **整体覆盖率**：目标 70%+

## 最佳实践

### 1. 清晰、简洁、可维护

- 测试名称即文档，清晰描述测试场景
- 代码简洁，遵循 AAA 模式
- 易于修改，重构时测试同步更新

### 2. 真实场景覆盖

- 优先测试用户可见的行为
- 覆盖真实用户场景，而非实现细节
- 使用真实数据文件

### 3. 独立测试

- 每个测试独立运行，不依赖其他测试
- 测试后清理状态，避免测试间污染
- 使用 `beforeEach` 重置状态

### 4. 错误信息清晰

- 失败时提供清晰的错误消息和上下文
- 使用描述性的断言消息
- E2E 测试自动截图和视频（失败时）

## 常见问题

### Q: 如何测试 Vue 组件？

A: 使用 Vue Test Utils 和 `createTestWrapper` 辅助函数：

```typescript
import { createTestWrapper } from '../../utils/testWrapper'
import MyComponent from '@/components/MyComponent.vue'

test('should render component', () => {
  const wrapper = createTestWrapper(MyComponent)
  expect(wrapper.exists()).toBe(true)
})
```

### Q: 如何测试异步操作？

A: 使用 `async/await` 和 `vi.useFakeTimers()`：

```typescript
test('should handle async operation', async () => {
  vi.useFakeTimers()
  const timer = useTimer(5, 'city', onTimeout)
  timer.start()
  
  vi.advanceTimersByTime(5000)
  expect(onTimeout).toHaveBeenCalled()
  
  vi.useRealTimers()
})
```

### Q: 如何测试 localStorage/sessionStorage？

A: 使用 `setupTest.ts` 中提供的 mock，或使用 `resetStorage()` 清理：

```typescript
import { resetStorage } from '../../utils/setupTest'

beforeEach(() => {
  resetStorage() // 自动清理所有存储
})
```

## CI/CD 集成

测试在 CI/CD 流程中自动运行：

- **PR 阶段**：运行快速测试（单元测试 + 集成测试，<2分钟）
- **合并前**：运行完整测试（包括 E2E，<10分钟）
- **测试失败**：阻止合并（严格模式）

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Playwright 文档](https://playwright.dev/)
- [测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
