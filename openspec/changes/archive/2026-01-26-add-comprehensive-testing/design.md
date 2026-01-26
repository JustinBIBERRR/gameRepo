# Testing Infrastructure Design

## Context

项目是一个 Vue 3 + TypeScript 的游戏平台，包含三个主要游戏（城市猜测、英雄猜测、电影猜测），以及设置管理、成就系统、计时器等功能。项目使用 Vite 构建，目前没有任何测试代码。

## Goals

1. **全面性**: 覆盖所有核心功能和用户流程
2. **可维护性**: 测试代码简洁、易读，便于后续维护
3. **真实性**: 模拟真实用户操作，验证端到端体验
4. **专业性**: 遵循最佳实践，让维护者"热泪盈眶"
5. **效率**: 快速执行，支持并行运行

## Non-Goals

- 不追求 100% 代码覆盖率（目标 80%+）
- 不过度测试实现细节
- 不引入复杂的测试框架或工具

## Decisions

### Decision: 使用 Vitest 作为单元测试框架

**Rationale**:
- Vitest 是 Vite 的原生测试框架，与项目构建工具完美集成
- 支持 TypeScript 开箱即用，无需额外配置
- 提供与 Jest 兼容的 API，学习成本低
- 执行速度快，支持 ESM
- 内置代码覆盖率支持

**Alternatives considered**:
- Jest: 需要额外配置，与 Vite 集成不够顺畅
- Mocha: 需要更多配置，功能相对基础

### Decision: 使用 Playwright 作为 E2E 测试框架

**Rationale**:
- Playwright 支持多浏览器（Chromium, Firefox, WebKit）
- 提供强大的自动等待和网络拦截功能
- 执行速度快，支持并行运行
- 提供优秀的调试工具和截图功能
- 社区活跃，文档完善

**Alternatives considered**:
- Cypress: 执行速度较慢，不支持多标签页测试
- Puppeteer: 功能相对基础，调试工具不够完善

### Decision: 测试目录结构

```
tests/
├── unit/                    # 单元测试
│   ├── utils/               # 工具函数测试
│   ├── composables/         # Composables 测试
│   └── components/          # 组件测试
├── integration/             # 集成测试
│   └── games/               # 游戏逻辑测试
├── e2e/                     # E2E 测试
│   ├── home.spec.ts
│   ├── city-guess.spec.ts
│   ├── hero-guess.spec.ts
│   ├── movie-guess.spec.ts
│   └── settings.spec.ts
├── utils/                   # 测试工具函数
│   ├── setupTest.ts         # 测试设置
│   ├── testUtils.ts         # 通用测试工具
│   └── mockData.ts          # Mock 数据
└── fixtures/                # 测试数据文件
    ├── cities.json
    ├── heroes.json
    └── movies.json
```

**Rationale**:
- 清晰的分类便于维护和查找
- 工具函数和 mock 数据集中管理
- 符合常见测试项目结构

### Decision: 测试编写风格

**原则**（已澄清：清晰、简洁、可维护 + 真实场景覆盖）:
1. **描述性命名**: 测试名称清晰描述测试场景（这是最重要的文档）
   ```typescript
   // ✅ Good - 名称即文档，清晰描述场景
   test('should calculate distance between Beijing and Shanghai correctly', () => {})
   
   // ❌ Bad - 需要看代码才知道测什么
   test('test distance', () => {})
   ```

2. **AAA 模式**: Arrange-Act-Assert（结构清晰，无需额外注释）
   ```typescript
   test('should update game stats on win', () => {
     // Arrange - 清晰的变量名和结构已经说明意图
     const initialStats = getGameStats('city')
     
     // Act - 操作明确
     const updatedStats = updateGameStats('city', true, 3)
     
     // Assert - 断言清晰，错误消息有上下文
     expect(updatedStats.wins).toBe(initialStats.wins + 1)
   })
   ```

3. **独立测试**: 每个测试独立运行，不依赖其他测试
4. **真实场景**: 优先测试用户可见的行为，而非实现细节
5. **清晰断言**: 使用描述性的断言消息，失败时提供足够上下文
6. **适度注释**: 仅在复杂逻辑或特殊场景添加注释说明意图，避免过度注释
7. **易于维护**: 测试代码易于修改，重构时测试同步更新
8. **错误信息**: 失败时提供清晰的错误消息、上下文信息和快速定位方法

### Decision: Mock 策略

**原则**:
- 只 mock 外部依赖（localStorage, sessionStorage, Date, 浏览器 API）
- 不 mock 项目内部代码（除非测试复杂依赖关系）
- 使用真实数据文件作为 fixtures

**Mock 实现**:
```typescript
// tests/utils/setupTest.ts
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock as any
```

### Decision: 测试数据管理

**策略**（已澄清：测试数据与生产数据同步 + 版本控制）:
- **使用真实数据文件 + 固定随机种子 + 版本控制**
- 测试使用与生产相同的数据文件（`src/data/*.json`），确保一致性
- 数据更新时，测试自动使用新数据
- 使用固定随机种子（如 `Math.random = () => 0.5`）保证"随机选择城市"等测试的可重复性
- 为关键测试场景创建固定的测试数据集（fixtures），不受生产数据变化影响
- 在测试文档中说明数据依赖关系
- 测试后清理状态，避免测试间污染

**实现**:
```typescript
// tests/utils/testUtils.ts
import citiesData from '@/data/cities.json'

// 固定随机种子，确保测试可重复
export function setupRandomSeed(seed: number = 0.5) {
  const originalRandom = Math.random
  Math.random = () => seed
  return () => {
    Math.random = originalRandom
  }
}

export function getMockCity() {
  return citiesData[0]
}

export function resetStorage() {
  localStorage.clear()
  sessionStorage.clear()
}
```

### Decision: E2E 测试策略

**原则**（已澄清：关键用户流程 + 核心交互点）:
- 测试关键用户流程，而非所有功能
- 覆盖完整游戏流程（开始→猜测→胜利/失败）
- 测试关键交互（输入、提交、状态恢复）
- 验证跨页面导航
- 不测试 UI 细节（颜色、间距等）
- 不测试所有边界组合，仅测试常见场景
- 使用数据属性（data-testid）而非 CSS 选择器
- 优先测试用户可见的行为
- 支持并行执行

**示例**:
```typescript
test('should complete a city guess game', async ({ page }) => {
  await page.goto('/city-guess')
  
  // 等待游戏加载
  await page.waitForSelector('[data-testid="game-header"]')
  
  // 输入猜测
  await page.fill('[data-testid="city-input"]', '北京')
  await page.click('[data-testid="submit-guess"]')
  
  // 验证结果显示
  await expect(page.locator('[data-testid="guess-history"]')).toBeVisible()
})
```

### Decision: 性能测试策略

**原则**（已澄清：关键游戏性能监控）:
- 为关键操作设置性能基准（游戏初始化、数据加载、状态保存）
- 在 CI 中监控性能回归（执行时间超过阈值则失败）
- 特别关注需要加载资源的游戏（如猜电影游戏的视频加载）
- 记录性能指标，便于长期追踪
- 不追求全面的性能测试，仅关注用户感知的关键路径

**实现**:
```typescript
// tests/integration/movie-guess.performance.test.ts
test('movie game should load resources within acceptable time', async () => {
  const startTime = performance.now()
  
  // 模拟游戏初始化（包括视频资源加载）
  await initializeMovieGame()
  
  const loadTime = performance.now() - startTime
  
  // 性能基准：资源加载应在 3 秒内完成
  expect(loadTime).toBeLessThan(3000)
})
```

### Decision: 测试报告和可视化

**原则**（已澄清：集成到开发工具）:
- 在 IDE 中显示测试结果和覆盖率（Vitest 和 Playwright 都支持 IDE 集成）
- 支持一键运行测试和查看失败详情
- 集成到 CI/CD 报告
- 提供测试趋势和统计信息
- E2E 测试失败时自动截图和视频
- 性能测试结果可视化展示

## Risks / Trade-offs

### Risk: 测试维护成本

**Mitigation**（已澄清：测试代码 = 生产代码标准 + 明确维护责任）:
- 测试代码审查标准与生产代码相同
- 测试代码修改需要同样严格的审查
- 明确测试维护责任人
- 定期审查测试质量（覆盖率、稳定性、可维护性）
- 测试代码重构纳入技术债务管理
- 编写清晰的测试文档
- 使用描述性命名和注释
- 保持测试代码简洁

### Risk: 测试执行时间

**Mitigation**（已澄清：分层测试策略）:
- **PR 阶段**: 运行快速测试（单元测试 + 集成测试，<2分钟），提供快速反馈
- **合并前**: 运行完整测试（包括 E2E，<10分钟），确保质量
- **本地开发**: 开发者可选运行，支持 watch 模式
- 使用并行执行
- 优化慢速测试（使用 mock 而非真实 API）
- 区分单元测试和 E2E 测试，分别运行

### Risk: Flaky Tests（不稳定测试）

**Mitigation**（已澄清：严格模式 + 智能分析）:
- 使用 Playwright 的自动等待功能
- 避免依赖时间或随机性（使用固定 seed）
- 区分测试失败类型（代码问题 vs 测试问题 vs 环境问题）
- 对于偶发失败（flaky tests），记录并逐步修复
- 设置测试稳定性监控
- 提供清晰的失败原因分析

### Trade-off: 测试覆盖率 vs 开发速度

**Decision**（已澄清）: **渐进式覆盖 + 关键路径优先**
- 初期核心功能（工具函数、游戏逻辑）达到 80%+ 覆盖率
- 非核心组件（如 UI 展示组件）可降低到 60%+ 覆盖率
- 设置质量门禁，但允许逐步提升
- 重点关注关键用户流程的 E2E 覆盖

**Rationale**: 
- 工具函数和游戏逻辑是核心，出问题影响大，需要高覆盖率
- UI 组件变化频繁，过度测试维护成本高，适度覆盖即可
- 渐进式策略允许团队在保证质量的同时逐步完善测试

## Migration Plan

**优先级策略**（已澄清）: **核心业务逻辑优先 + 渐进式重构**
- Phase 1-2: 工具函数 + Composables（核心基础）
- Phase 3: 游戏逻辑集成测试（核心业务）
- Phase 4: 关键 E2E 测试（核心用户流程）
- Phase 5: 组件测试和其他 E2E（补充完善）
- 贯穿始终: 渐进式重构，在测试保护下提升代码可测试性

**实施阶段**:
1. **Phase 1**: 搭建测试基础设施（Vitest + Playwright 配置 + IDE 集成）
2. **Phase 2**: 编写工具函数和 Composables 测试（基础功能，优先级最高）
   - 先为现有代码添加测试（即使需要一些 workaround）
   - 在测试保护下逐步重构，提升可测试性
   - 记录技术债务，后续逐步改进
3. **Phase 3**: 编写游戏逻辑集成测试（核心功能，优先级最高）
4. **Phase 4**: 编写关键 E2E 测试（核心用户流程，优先级最高）
   - 覆盖完整游戏流程（开始→猜测→胜利/失败）
   - 测试关键交互（输入、提交、状态恢复）
5. **Phase 5**: 添加性能测试（关键游戏，如猜电影游戏的资源加载）
6. **Phase 6**: 编写组件测试和其他 E2E（补充完善，优先级较低）
7. **Phase 7**: 优化和文档化
   - 测试代码审查标准与生产代码相同
   - 明确测试维护责任人
   - 定期审查测试质量

**Rollback**: 如果测试框架选择不当，可以：
- 保留测试代码，只更换测试运行器
- Vitest 和 Jest API 兼容，迁移成本低

## Clarified Decisions

经过深入澄清，已确定以下关键决策：

### 第一轮澄清（基础策略）
1. **测试优先级**: 核心业务逻辑优先（工具函数 + 游戏逻辑 + 关键 E2E）
2. **测试执行策略**: 分层测试（PR 快速测试，合并前完整测试）
3. **测试数据策略**: 使用真实数据文件 + 固定随机种子
4. **文档化程度**: 适度文档化 + 自解释代码
5. **覆盖率策略**: 渐进式覆盖 + 关键路径优先（核心功能 80%+，其他 60%+）

### 第二轮澄清（深度策略）
6. **测试定位**: 可执行的文档 + 质量保障双轨制
   - 测试作为可执行文档，帮助新维护者理解系统行为
   - 测试作为质量保障，防止回归
   - 测试代码本身也是代码示例，展示最佳实践

7. **测试质量标准**: 清晰、简洁、可维护 + 真实场景覆盖
   - 测试名称清晰描述场景，无需看代码即知意图
   - 代码简洁，遵循 AAA 模式
   - 覆盖真实用户场景，而非实现细节
   - 失败时错误信息清晰，快速定位问题
   - 易于修改，重构时测试同步更新

8. **调试体验**: 清晰的错误消息 + 上下文信息 + 快速定位
   - 错误消息清晰说明期望与实际
   - 提供足够的上下文（输入值、中间状态）
   - 失败时显示相关代码片段
   - E2E 测试自动截图和视频
   - 提供修复建议或相关文档链接

9. **代码集成策略**: 渐进式重构 + 测试驱动
   - 先为现有代码添加测试（即使需要一些 workaround）
   - 在测试保护下逐步重构，提升可测试性
   - 优先为新功能编写可测试的代码
   - 记录技术债务，后续逐步改进

10. **E2E 测试范围**: 关键用户流程 + 核心交互点
    - 覆盖完整游戏流程（开始→猜测→胜利/失败）
    - 测试关键交互（输入、提交、状态恢复）
    - 验证跨页面导航
    - 不测试 UI 细节（颜色、间距等）
    - 不测试所有边界组合，仅测试常见场景

11. **测试数据维护**: 测试数据与生产数据同步 + 版本控制
    - 测试使用与生产相同的数据文件（`src/data/*.json`）
    - 数据更新时，测试自动使用新数据
    - 为关键测试场景创建固定的测试数据集（fixtures）
    - 在测试文档中说明数据依赖关系

12. **失败处理策略**: 严格模式 + 智能分析
    - PR 阶段测试失败必须修复才能合并
    - 区分测试失败类型（代码问题 vs 测试问题 vs 环境问题）
    - 提供清晰的失败原因分析
    - 对于偶发失败（flaky tests），记录并逐步修复
    - 设置测试稳定性监控

13. **维护责任**: 测试代码 = 生产代码标准 + 明确维护责任
    - 测试代码审查标准与生产代码相同
    - 测试代码修改需要同样严格的审查
    - 明确测试维护责任人
    - 定期审查测试质量（覆盖率、稳定性、可维护性）
    - 测试代码重构纳入技术债务管理

14. **性能测试**: 关键游戏性能监控（如猜电影游戏的资源加载）
    - 为关键操作（游戏初始化、数据加载、状态保存）设置性能基准
    - 在 CI 中监控性能回归（如执行时间超过阈值）
    - 特别关注需要加载资源的游戏（如猜电影游戏的视频加载）
    - 记录性能指标，便于长期追踪

15. **测试报告**: 集成到开发工具（在 IDE 中显示测试结果）
    - 在 IDE 中显示测试结果和覆盖率
    - 支持一键运行测试和查看失败详情
    - 集成到 CI/CD 报告
    - 提供测试趋势和统计信息

## Open Questions

- [ ] 是否需要快照测试（snapshot testing）？
- [ ] 是否需要视觉回归测试（visual regression testing）？

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
