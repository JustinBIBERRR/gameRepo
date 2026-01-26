# testing-infrastructure Specification

## ADDED Requirements

### Requirement: 单元测试框架配置
系统 SHALL 提供 Vitest 单元测试框架配置，支持 Vue 3 组件测试和 TypeScript。
系统 SHALL 提供 Vitest 单元测试框架配置，支持 Vue 3 组件测试和 TypeScript。

#### Scenario: 运行单元测试
- **WHEN** 开发者执行 `npm run test:unit`
- **THEN** Vitest 运行所有单元测试文件（`tests/unit/**/*.test.ts`）
- **AND** 显示测试结果和覆盖率报告
- **AND** 支持 watch 模式（`npm run test:unit -- --watch`）

#### Scenario: 测试环境配置
- **WHEN** 运行单元测试
- **THEN** 测试环境正确配置 Vue Test Utils
- **AND** 支持 TypeScript 类型检查
- **AND** 提供 DOM 环境（jsdom）
- **AND** 自动导入 Vue 组合式 API（ref, computed, onMounted 等）

### Requirement: E2E 测试框架配置
系统 SHALL 提供 Playwright E2E 测试框架配置，支持多浏览器测试。
系统 SHALL 提供 Playwright E2E 测试框架配置，支持多浏览器测试。

#### Scenario: 运行 E2E 测试
- **WHEN** 开发者执行 `npm run test:e2e`
- **THEN** Playwright 运行所有 E2E 测试文件（`tests/e2e/**/*.spec.ts`）
- **AND** 在 Chromium 浏览器中执行测试
- **AND** 显示测试结果和截图（失败时）
- **AND** 支持 UI 模式（`npm run test:e2e -- --ui`）

#### Scenario: 多浏览器测试
- **WHEN** 开发者执行 `npm run test:e2e -- --project=chromium --project=firefox`
- **THEN** 测试在 Chromium 和 Firefox 浏览器中分别执行
- **AND** 验证跨浏览器兼容性

### Requirement: 测试工具函数
系统 SHALL 提供测试工具函数库，简化测试编写。
系统 SHALL 提供测试工具函数库，简化测试编写。

#### Scenario: Storage Mock
- **WHEN** 测试需要模拟 localStorage 或 sessionStorage
- **THEN** 测试工具提供 `mockStorage()` 函数
- **AND** 支持设置和获取存储值
- **AND** 测试后自动清理

#### Scenario: Vue 组件测试辅助
- **WHEN** 测试 Vue 组件
- **THEN** 测试工具提供 `createTestWrapper()` 函数
- **AND** 自动配置路由和全局组件
- **AND** 提供常用的测试辅助方法

#### Scenario: 测试数据生成
- **WHEN** 测试需要测试数据
- **THEN** 测试工具提供 `getMockCity()`, `getMockHero()`, `getMockMovie()` 函数
- **AND** 使用项目中的真实数据文件作为基础
- **AND** 支持创建自定义测试数据

### Requirement: 工具函数单元测试
系统 SHALL 为所有工具函数提供完整的单元测试覆盖。
系统 SHALL 为所有工具函数提供完整的单元测试覆盖。

#### Scenario: storageUtils 测试覆盖
- **WHEN** 运行 `storageUtils.test.ts`
- **THEN** 测试覆盖所有导出函数（getGameStats, updateGameStats, getGameSettings, saveGameSettings, getGameConfig, saveTimerState, loadTimerState, getCustomGameData, saveCustomGameData, checkAndClearExpiredData, clearAllData 等）
- **AND** 测试边界情况和错误处理
- **AND** 测试 localStorage 和 sessionStorage 交互

#### Scenario: achievementUtils 测试覆盖
- **WHEN** 运行 `achievementUtils.test.ts`
- **THEN** 测试覆盖成就解锁逻辑
- **AND** 测试所有成就类型的条件判断
- **AND** 测试成就进度计算

#### Scenario: 游戏工具函数测试覆盖
- **WHEN** 运行 `cityUtils.test.ts`, `heroUtils.test.ts`, `movieUtils.test.ts`
- **THEN** 测试覆盖所有游戏相关的工具函数
- **AND** 测试距离计算、方位计算、属性比较等核心逻辑
- **AND** 测试边界情况和异常输入

### Requirement: Composables 单元测试
系统 SHALL 为所有 Composables 提供完整的单元测试覆盖。
系统 SHALL 为所有 Composables 提供完整的单元测试覆盖。

#### Scenario: useTimer 测试覆盖
- **WHEN** 运行 `useTimer.test.ts`
- **THEN** 测试计时器启动、暂停、重置功能
- **AND** 测试倒计时递减逻辑
- **AND** 测试超时回调触发
- **AND** 测试状态保存和恢复（sessionStorage）
- **AND** 测试页面可见性变化处理
- **AND** 测试格式化时间显示和警告状态

#### Scenario: useModal 测试覆盖
- **WHEN** 运行 `useModal.test.ts`
- **THEN** 测试 confirm, alert, success, error 对话框
- **AND** 测试 Promise 返回值
- **AND** 测试对话框状态管理

#### Scenario: useLoading 测试覆盖
- **WHEN** 运行 `useLoading.test.ts`
- **THEN** 测试加载状态显示和隐藏
- **AND** 测试全局加载状态管理

### Requirement: 组件单元测试
系统 SHALL 为核心 UI 组件提供单元测试覆盖。
系统 SHALL 为核心 UI 组件提供单元测试覆盖。

#### Scenario: GameTimer 组件测试
- **WHEN** 运行 `GameTimer.test.ts`
- **THEN** 测试时间显示格式（MM:SS）
- **AND** 测试警告状态样式（少于1分钟时红色显示）
- **AND** 测试 props 传递

#### Scenario: Autocomplete 组件测试
- **WHEN** 运行 `Autocomplete.test.ts`
- **THEN** 测试输入和匹配功能
- **AND** 测试下拉列表显示和选择
- **AND** 测试错误提示显示

#### Scenario: 其他核心组件测试
- **WHEN** 运行组件测试文件
- **THEN** 测试组件渲染和基本交互
- **AND** 测试 props 和 events
- **AND** 测试条件渲染

### Requirement: 游戏逻辑集成测试
系统 SHALL 为每个游戏提供完整的集成测试，验证游戏流程。
系统 SHALL 为每个游戏提供完整的集成测试，验证游戏流程。

#### Scenario: 城市猜测游戏集成测试
- **WHEN** 运行 `CityGuess.integration.test.ts`
- **THEN** 测试游戏初始化（随机选择城市）
- **AND** 测试有效猜测流程（距离、方位、特点显示）
- **AND** 测试无效猜测处理
- **AND** 测试游戏胜利流程
- **AND** 测试游戏失败流程（次数用尽或超时）
- **AND** 测试游戏状态保存和恢复
- **AND** 测试成就解锁

#### Scenario: 英雄猜测游戏集成测试
- **WHEN** 运行 `HeroGuess.integration.test.ts`
- **THEN** 测试游戏初始化（随机选择英雄）
- **AND** 测试属性匹配显示
- **AND** 测试初始提示显示
- **AND** 测试游戏胜利和失败流程

#### Scenario: 电影猜测游戏集成测试
- **WHEN** 运行 `MovieGuess.integration.test.ts`
- **THEN** 测试游戏初始化（随机选择电影）
- **AND** 测试时间点选择
- **AND** 测试音频播放控制
- **AND** 测试播放次数限制
- **AND** 测试游戏流程

### Requirement: E2E 测试
系统 SHALL 提供端到端测试，模拟真实用户操作。

#### Scenario: 首页 E2E 测试
- **WHEN** 运行 `home.spec.ts`
- **THEN** 测试页面加载和游戏卡片显示
- **AND** 测试统计数据显示
- **AND** 测试成就展示
- **AND** 测试清除数据功能
- **AND** 测试游戏导航

#### Scenario: 城市猜测游戏 E2E 测试
- **WHEN** 运行 `city-guess.spec.ts`
- **THEN** 测试完整游戏流程（从开始到胜利）
- **AND** 测试失败流程
- **AND** 测试页面刷新后状态恢复
- **AND** 测试倒计时功能
- **AND** 测试响应式布局（移动端）

#### Scenario: 设置页面 E2E 测试
- **WHEN** 运行 `settings.spec.ts`
- **THEN** 测试游戏设置修改
- **AND** 测试自定义数据管理
- **AND** 测试数据导入导出
- **AND** 测试游戏可见性配置

### Requirement: 测试文档
系统 SHALL 提供完整的测试文档，说明如何运行和编写测试。
系统 SHALL 提供完整的测试文档，说明如何运行和编写测试。

#### Scenario: 测试 README
- **WHEN** 开发者查看 `tests/README.md`
- **THEN** 文档说明如何运行测试（单元测试、E2E 测试）
- **AND** 说明测试目录结构
- **AND** 说明如何编写新测试
- **AND** 说明测试最佳实践和约定

#### Scenario: 主 README 更新
- **WHEN** 开发者查看项目根目录 `README.md`
- **THEN** 文档包含测试相关说明
- **AND** 说明如何运行测试
- **AND** 说明测试覆盖率要求

### Requirement: CI/CD 集成
系统 SHALL 在 CI/CD 流程中集成测试，确保代码质量。
系统 SHALL 在 CI/CD 流程中集成测试，确保代码质量。

#### Scenario: 测试工作流
- **WHEN** 代码推送到 GitHub
- **THEN** CI 自动运行单元测试和 E2E 测试
- **AND** 测试失败时阻止合并
- **AND** 生成测试覆盖率报告

#### Scenario: 部署前测试
- **WHEN** 部署到生产环境前
- **THEN** 运行所有测试确保功能正常
- **AND** 验证测试通过后才允许部署

### Requirement: 测试代码质量
系统 SHALL 确保测试代码简洁、易读、易维护。
系统 SHALL 确保测试代码简洁、易读、易维护。

#### Scenario: 测试命名规范
- **WHEN** 查看测试代码
- **THEN** 测试名称清晰描述测试场景（使用 `should` 或 `when...then` 格式）
- **AND** 测试文件命名遵循 `*.test.ts` 或 `*.spec.ts` 约定

#### Scenario: 测试结构规范
- **WHEN** 查看测试代码
- **THEN** 测试使用 AAA 模式（Arrange-Act-Assert）
- **AND** 每个测试独立运行，不依赖其他测试
- **AND** 测试后清理状态，避免测试间污染

#### Scenario: 测试覆盖率
- **WHEN** 运行测试覆盖率报告
- **THEN** 核心功能（工具函数、Composables、游戏逻辑）覆盖率 ≥ 80%
- **AND** 整体代码覆盖率 ≥ 70%
