# Change: 添加完整的测试用例代码

## Why

当前项目缺乏系统化的测试代码，这给后续维护和功能迭代带来了风险。没有测试用例意味着：
- 代码修改后无法快速验证功能是否正常
- 回归测试需要手动进行，效率低下
- 新维护者难以理解代码的预期行为
- 重构时缺乏安全保障

建立一套全面、简洁、易读的测试用例代码，能够：
- 确保代码质量和功能稳定性
- 提供可执行的文档，帮助理解系统行为
- 模拟真实用户操作，验证端到端流程
- 让后续维护者能够快速上手并充满信心

## What Changes

- **ADDED**: 单元测试基础设施（Vitest + Vue Test Utils）
  - 配置 Vitest 测试框架
  - 设置测试工具函数和辅助方法
  - 创建测试工具库和 mock 数据

- **ADDED**: 工具函数单元测试
  - `storageUtils.ts` 的完整测试覆盖
  - `achievementUtils.ts` 的完整测试覆盖
  - `cityUtils.ts`, `heroUtils.ts`, `movieUtils.ts` 的测试
  - `pinyinUtils.ts` 的测试

- **ADDED**: Composables 单元测试
  - `useTimer.ts` 的完整测试（包括状态恢复、页面可见性等）
  - `useModal.ts` 的完整测试
  - `useLoading.ts` 的测试

- **ADDED**: 组件单元测试
  - 核心 UI 组件测试（GameTimer, GameHeader, Autocomplete 等）
  - 游戏卡片和导航组件测试
  - 设置相关组件测试

- **ADDED**: 游戏逻辑集成测试
  - 城市猜测游戏完整流程测试
  - 英雄猜测游戏完整流程测试
  - 电影猜测游戏完整流程测试
  - 游戏状态管理和持久化测试

- **ADDED**: E2E 测试（Playwright）
  - 用户完整游戏流程测试
  - 设置管理流程测试
  - 跨页面导航测试
  - 响应式布局测试

- **ADDED**: 测试文档和最佳实践
  - README 说明如何运行测试
  - 测试编写指南（适度文档化 + 自解释代码）
  - CI/CD 集成配置（分层测试策略：PR 快速测试，合并前完整测试）

**关键决策**（已澄清）:
- **测试优先级**: 核心业务逻辑优先（工具函数 + 游戏逻辑 + 关键 E2E）
- **测试数据策略**: 使用真实数据文件 + 固定随机种子
- **覆盖率策略**: 渐进式覆盖（核心功能 80%+，其他 60%+）

## Impact

- **Affected specs**: 
  - `testing-infrastructure` (新增能力)
  - 所有现有 specs 的测试验证（不修改 spec 本身）

- **Affected code**:
  - 新增 `tests/` 目录结构
  - 新增 `vitest.config.ts` 配置文件
  - 新增 `playwright.config.ts` 配置文件
  - 更新 `package.json` 添加测试依赖和脚本
  - 更新 `.github/workflows/deploy.yml` 添加测试步骤

- **Breaking changes**: 无

- **Dependencies**: 
  - `vitest` - 单元测试框架
  - `@vue/test-utils` - Vue 组件测试工具
  - `@playwright/test` - E2E 测试框架
  - `jsdom` - DOM 环境模拟
  - `@testing-library/user-event` - 用户交互模拟
