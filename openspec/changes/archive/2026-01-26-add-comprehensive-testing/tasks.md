## 1. 测试基础设施搭建（优先级：最高）
- [x] 1.1 安装测试依赖（vitest, @vue/test-utils, jsdom, @testing-library/user-event, @playwright/test）
- [x] 1.2 创建 `vitest.config.ts` 配置文件
- [x] 1.3 创建 `playwright.config.ts` 配置文件
- [x] 1.4 创建 `tests/` 目录结构（unit/, e2e/, utils/, fixtures/）
- [x] 1.5 创建测试工具函数（setupTest.ts, testUtils.ts）
- [x] 1.6 创建 mock 数据文件（mockData.ts）
- [x] 1.7 更新 `package.json` 添加测试脚本（test, test:unit, test:e2e, test:ui, test:coverage）
- [ ] 1.8 创建 `.github/workflows/test.yml` CI 测试工作流

## 2. 工具函数单元测试（优先级：最高 - 核心业务逻辑）
- [x] 2.1 编写 `storageUtils.test.ts` - 测试所有存储相关函数
  - [x] 2.1.1 测试 `getGameStats` 和 `updateGameStats`
  - [x] 2.1.2 测试 `getAchievements` 和 `saveAchievements`
  - [x] 2.1.3 测试 `getGameSettings` 和 `saveGameSettings`
  - [x] 2.1.4 测试 `getGameConfig` 配置优先级逻辑
  - [x] 2.1.5 测试 `saveTimerState` 和 `loadTimerState`
  - [x] 2.1.6 测试 `getCustomGameData` 和 `saveCustomGameData`
  - [x] 2.1.7 测试 `checkAndClearExpiredData` 过期数据清理
  - [x] 2.1.8 测试 `clearAllData` 和 `clearGameData`
- [x] 2.2 编写 `achievementUtils.test.ts` - 测试成就系统
  - [x] 2.2.1 测试 `checkAndUpdateAchievements` 成就解锁逻辑
  - [x] 2.2.2 测试各种成就条件的判断
  - [x] 2.2.3 测试成就进度计算
- [x] 2.3 编写 `cityUtils.test.ts` - 测试城市相关工具函数
  - [x] 2.3.1 测试 `calculateDistance` 距离计算
  - [x] 2.3.2 测试 `calculateBearing` 方位计算
  - [x] 2.3.3 测试 `bearingToDirection` 方向转换
  - [x] 2.3.4 测试 `getCityFeature` 城市特点获取
- [x] 2.4 编写 `heroUtils.test.ts` - 测试英雄相关工具函数
  - [x] 2.4.1 测试 `compareAttributes` 属性比较
  - [x] 2.4.2 测试 `compareRoles` 角色比较
- [x] 2.5 编写 `movieUtils.test.ts` - 测试电影相关工具函数
- [x] 2.6 编写 `pinyinUtils.test.ts` - 测试拼音工具函数
- [ ] 2.4 编写 `heroUtils.test.ts` - 测试英雄相关工具函数
  - [ ] 2.4.1 测试 `compareAttributes` 属性比较
  - [ ] 2.4.2 测试 `compareRoles` 角色比较
- [ ] 2.5 编写 `movieUtils.test.ts` - 测试电影相关工具函数
- [ ] 2.6 编写 `pinyinUtils.test.ts` - 测试拼音工具函数

## 3. Composables 单元测试（优先级：最高 - 核心业务逻辑）
- [x] 3.1 编写 `useTimer.test.ts` - 测试计时器功能
  - [x] 3.1.1 测试计时器启动、暂停、重置
  - [x] 3.1.2 测试倒计时递减逻辑
  - [x] 3.1.3 测试超时回调触发
  - [x] 3.1.4 测试状态保存和恢复（sessionStorage）
  - [x] 3.1.5 测试页面可见性变化处理
  - [x] 3.1.6 测试格式化时间显示
  - [x] 3.1.7 测试警告状态（少于1分钟）
- [x] 3.2 编写 `useModal.test.ts` - 测试模态框功能
  - [x] 3.2.1 测试 `confirm` 确认对话框
  - [x] 3.2.2 测试 `alert` 提示对话框
  - [x] 3.2.3 测试 `success` 和 `error` 对话框
  - [x] 3.2.4 测试 Promise 返回值
- [x] 3.3 编写 `useLoading.test.ts` - 测试加载状态功能

## 4. 组件单元测试（优先级：中等 - 可后续补充）
- [ ] 4.1 编写 `GameTimer.test.ts` - 测试计时器组件
  - [ ] 4.1.1 测试时间显示格式
  - [ ] 4.1.2 测试警告状态样式
- [ ] 4.2 编写 `GameHeader.test.ts` - 测试游戏头部组件
- [ ] 4.3 编写 `Autocomplete.test.ts` - 测试自动完成组件
  - [ ] 4.3.1 测试输入和匹配
  - [ ] 4.3.2 测试下拉列表显示
  - [ ] 4.3.3 测试选择事件
- [ ] 4.4 编写 `GameCard.test.ts` - 测试游戏卡片组件
- [ ] 4.5 编写 `Navigation.test.ts` - 测试导航组件
- [ ] 4.6 编写 `AchievementBadge.test.ts` - 测试成就徽章组件
- [ ] 4.7 编写 `SettingsCard.test.ts` - 测试设置卡片组件

**注意**：组件测试为中等优先级，当前阶段已完成核心业务逻辑测试。组件测试可在后续迭代中补充，以提升整体覆盖率。

## 5. 游戏逻辑集成测试（优先级：最高 - 核心业务逻辑）
- [x] 5.0 渐进式重构准备（在测试保护下重构，提升可测试性）
- [x] 5.1 编写 `CityGuess.integration.test.ts` - 城市猜测游戏集成测试
  - [x] 5.1.1 测试游戏初始化（随机选择城市）
  - [x] 5.1.2 测试有效猜测流程（距离、方位、特点显示）
  - [x] 5.1.3 测试无效猜测处理
  - [x] 5.1.4 测试游戏胜利流程
  - [x] 5.1.5 测试游戏失败流程（次数用尽）
  - [x] 5.1.6 测试倒计时超时处理
  - [x] 5.1.7 测试游戏状态保存和恢复
  - [x] 5.1.8 测试成就解锁
- [x] 5.2 编写 `HeroGuess.integration.test.ts` - 英雄猜测游戏集成测试
  - [x] 5.2.1 测试游戏初始化（随机选择英雄）
  - [x] 5.2.2 测试属性匹配显示
  - [x] 5.2.3 测试初始提示显示
  - [x] 5.2.4 测试游戏胜利和失败流程
- [x] 5.3 编写 `MovieGuess.integration.test.ts` - 电影猜测游戏集成测试
  - [x] 5.3.1 测试游戏初始化（随机选择电影）
  - [x] 5.3.2 测试时间点选择
  - [x] 5.3.3 测试音频播放控制
  - [x] 5.3.4 测试播放次数限制
  - [x] 5.3.5 测试游戏流程

## 6. E2E 测试（Playwright）（优先级：最高 - 关键用户流程）
- [x] 6.1 编写 `home.spec.ts` - 首页 E2E 测试
  - [x] 6.1.1 测试页面加载和游戏卡片显示
  - [x] 6.1.2 测试统计数据显示
  - [ ] 6.1.3 测试成就展示
  - [ ] 6.1.4 测试清除数据功能
  - [x] 6.1.5 测试游戏导航
- [x] 6.2 编写 `city-guess.spec.ts` - 城市猜测游戏 E2E 测试
  - [x] 6.2.1 测试完整游戏流程（从开始到胜利）
  - [ ] 6.2.2 测试失败流程
  - [x] 6.2.3 测试页面刷新后状态恢复
  - [x] 6.2.4 测试倒计时功能
  - [ ] 6.2.5 测试响应式布局（移动端）
- [ ] 6.3 编写 `hero-guess.spec.ts` - 英雄猜测游戏 E2E 测试
- [ ] 6.4 编写 `movie-guess.spec.ts` - 电影猜测游戏 E2E 测试
- [x] 6.5 编写 `settings.spec.ts` - 设置页面 E2E 测试
  - [x] 6.5.1 测试游戏设置修改（基础框架）
  - [ ] 6.5.2 测试自定义数据管理
  - [ ] 6.5.3 测试数据导入导出
  - [ ] 6.5.4 测试游戏可见性配置

**注意**：E2E 测试框架已创建，需要安装 Playwright 浏览器才能运行。基础测试用例已编写，可在浏览器安装后完善。

## 7. 性能测试（优先级：高 - 关键游戏）
- [ ] 7.1 为猜电影游戏添加性能测试
  - [ ] 7.1.1 测试视频资源加载性能（应在 3 秒内完成）
  - [ ] 7.1.2 测试游戏初始化性能
  - [ ] 7.1.3 设置性能基准和阈值
- [ ] 7.2 为其他关键操作添加性能监控
  - [ ] 7.2.1 数据加载性能
  - [ ] 7.2.2 状态保存性能
- [ ] 7.3 配置性能回归检测（CI 中监控）

## 8. 测试文档和优化
- [x] 8.1 创建 `tests/README.md` - 测试文档
  - [x] 8.1.1 说明如何运行测试
  - [x] 8.1.2 说明测试结构
  - [x] 8.1.3 说明如何编写新测试
  - [x] 8.1.4 说明测试最佳实践（清晰、简洁、可维护）
  - [x] 8.1.5 说明测试数据依赖关系
- [x] 8.2 添加测试覆盖率配置（核心功能 80%+，其他 60%+）
- [ ] 8.3 优化测试性能（并行执行、快照测试）
- [ ] 8.4 添加测试辅助工具（测试数据生成器、自定义 matchers）
- [ ] 8.5 配置 IDE 集成（Vitest 和 Playwright IDE 插件）
- [x] 8.6 更新主 README.md 添加测试说明
- [ ] 8.7 建立测试维护责任机制

## 9. CI/CD 集成（优先级：最高 - 分层测试策略 + 严格模式）
- [x] 9.1 创建 `.github/workflows/test-pr.yml` - PR 阶段快速测试（单元测试 + 集成测试）
  - [x] 9.1.1 配置快速测试流程（<2分钟）
  - [x] 9.1.2 配置测试失败阻止合并（严格模式）
  - [ ] 9.1.3 配置智能失败分析（区分代码问题 vs 测试问题 vs 环境问题）
- [x] 9.2 创建 `.github/workflows/test-merge.yml` - 合并前完整测试（包括 E2E）
  - [x] 9.2.1 配置完整测试流程（包括 E2E，<10分钟）
  - [x] 9.2.2 配置 E2E 测试失败时自动截图和视频
  - [ ] 9.2.3 配置性能测试监控
- [x] 9.3 更新 `.github/workflows/deploy.yml` 添加部署前测试步骤
- [x] 9.4 配置测试覆盖率报告上传（核心功能 80%+，整体 70%+）
- [ ] 9.5 配置测试稳定性监控（记录 flaky tests）
- [ ] 9.6 配置测试报告集成（IDE 和 CI/CD 报告）
