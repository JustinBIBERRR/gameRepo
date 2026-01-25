# Design: 游戏平台架构设计

## Context
需要创建一个在线游戏平台，包含多个小游戏。平台需要：
- 现代化的 Portfolio 风格 UI
- 多游戏路由管理
- 可扩展的游戏架构
- 支持 GitHub Pages 静态部署

## Goals / Non-Goals

### Goals
- 简洁优雅的 Portfolio 风格界面
- 清晰的游戏导航和路由系统
- 可扩展的游戏架构，便于添加新游戏
- 响应式设计，支持移动端和桌面端
- 静态部署到 GitHub Pages

### Non-Goals
- 用户认证和登录系统
- 后端服务器（纯前端应用）
- 数据持久化（游戏状态仅保存在内存）
- 实时多人游戏功能

## Decisions

### Decision: 使用 Vue3 Composition API + TypeScript
- **Why**: 提供类型安全和更好的开发体验，Composition API 更适合复杂逻辑组织
- **Alternatives considered**: 
  - Options API: 对于复杂游戏逻辑，Composition API 更清晰
  - JavaScript: 缺少类型检查，不利于维护

### Decision: 使用 Tailwind CSS 进行样式设计
- **Why**: 快速开发，一致的 Portfolio 风格，响应式设计简单
- **Alternatives considered**:
  - CSS Modules: 需要更多配置和样板代码
  - SCSS: Tailwind 的 utility-first 更适合快速原型

### Decision: 游戏数据使用 JSON 文件 + 本地计算
- **Why**: 
  - 城市数据：使用 JSON 内置主要城市列表（100-150个，包含省会、直辖市、计划单列市、知名地级市），经纬度数据内置，使用 Haversine 公式本地计算距离和方位
  - 王者荣耀人物数据：使用 JSON 内置（100-120个主要英雄，包含职业、年代、国籍、人类、性别5个属性）
- **Alternatives considered**:
  - 全部使用 API: 增加依赖和延迟，对于静态数据不必要
  - 完整城市列表: 数据量大，维护成本高，主要城市已足够游戏性

### Decision: 使用 Vue Router 进行路由管理
- **Why**: Vue 官方路由解决方案，支持 SPA 和静态部署
- **Alternatives considered**:
  - 手动路由管理: 增加复杂度，缺少官方支持

### Decision: GitHub Pages 部署配置
- **Why**: 免费、简单、适合静态站点
- **Alternatives considered**:
  - Vercel/Netlify: 功能更强大但需要额外配置
  - 自建服务器: 增加运维成本

## Architecture

### 项目结构
```
src/
├── views/
│   ├── Home.vue          # 平台首页
│   ├── CityGuess.vue     # 城市猜测游戏
│   └── HeroGuess.vue     # 王者荣耀人物猜测游戏
├── components/
│   ├── GameCard.vue      # 游戏卡片组件
│   └── Navigation.vue    # 导航组件
├── data/
│   ├── cities.json       # 城市数据
│   └── heroes.json       # 王者荣耀人物数据
├── utils/
│   ├── cityUtils.ts      # 城市相关工具函数
│   └── heroUtils.ts      # 人物相关工具函数
├── router/
│   └── index.ts          # 路由配置
└── App.vue
```

### 游戏架构模式
每个游戏遵循统一模式：
- 独立的 Vue 组件（views/GameName.vue）
- 游戏状态管理（使用 Composition API 的 ref/reactive）
- 游戏逻辑封装在工具函数中
- 数据存储在 JSON 文件中

### 数据计算
- 城市距离计算：使用 Haversine 公式基于内置经纬度数据本地计算
- 城市方位计算：基于经纬度计算方位角，本地计算
- 无需外部 API：所有计算在客户端完成，提升响应速度和可靠性

## Risks / Trade-offs

### Decision: 游戏状态持久化
- **Why**: 使用 sessionStorage 保存游戏状态，刷新页面后恢复进度，关闭标签页后重新开始
- **Implementation**: 
  - 保存当前游戏的目标、已猜测次数、历史记录
  - 页面刷新后自动恢复游戏状态
  - 关闭标签页后 sessionStorage 自动清除，下次打开重新开始

### Risk: GitHub Pages 路由问题
- **Mitigation**: 
  - 配置 `_redirects` 或使用 `hash` 模式路由
  - 使用 `history` 模式需要配置 404.html 重定向

### Risk: 城市数据准确性
- **Mitigation**: 
  - 使用权威数据源
  - 提供数据更新机制说明

## Migration Plan
不适用（新项目）

## Clarified Decisions

### 城市输入方式
- 使用下拉联想输入框（autocomplete）
- 如果输入不在数据库中，下拉框显示提示："该城市不在游戏范围内，请输入主要城市（如省会、直辖市等）"
- 禁止提交无效输入，不消耗猜测次数

### 城市数据范围
- 主要城市（100-150个）：省会、直辖市、计划单列市、知名地级市
- 经纬度数据内置在 JSON 中
- 使用 Haversine 公式本地计算距离和方位

### 王者荣耀人物属性
- 人物数量：100-120个主要英雄
- 属性定义：
  - 职业：打野、法师、射手、辅助、战士（5个）
  - 年代：商朝、战国、秦朝、汉朝、三国、南北朝、隋朝、唐朝、现代、未知等（具体朝代）
  - 国籍：中国、日本、未知（3个）
  - 人类：人类、虚拟角色（2个）
  - 性别：男性、女性、未知（3个）

### 游戏难度和统计
- 固定 5 次猜测机会
- 简单统计：显示当前会话的成功/失败统计
- 不设置难度等级

### 初始提示功能
- **城市猜测游戏**：游戏开始时显示目标城市的一个特点作为初始提示
  - 提示显示在游戏说明下方的提示卡片中
  - 初始提示计入提示序列，后续猜测继续显示新特点（总共5个特点）
  - 提示卡片始终可见，不可隐藏
- **英雄猜测游戏**：游戏开始时随机显示目标英雄的一个属性作为初始提示
  - 随机选择职业、年代、国籍、人类、性别中的一个属性
  - 提示显示在游戏说明下方的提示卡片中
  - 初始提示的属性在后续猜测的属性匹配中自动标记为匹配
  - 提示卡片始终可见，不可隐藏

### 游戏状态持久化
- 使用 sessionStorage 保存游戏状态
- 刷新页面后恢复进度
- 关闭标签页后重新开始
