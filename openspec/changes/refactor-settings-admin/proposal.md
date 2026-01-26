# Change: 重构 Settings 为游戏管理员后台

## Why

当前 Settings 页面混合了全局配置和游戏特定配置，逻辑复杂且面向普通玩家设计。实际使用场景（如公司年会）中，设置由管理者提前配置完成，玩家直接游玩即可。需要将 Settings 重新定位为**管理员专用后台**，简化配置逻辑，增加游戏数据的自定义管理能力。

## What Changes

### 产品定位重构
- **BREAKING**: 移除全局默认设置区域，简化为每个游戏独立配置
- 新增：Settings 页面改为卡片式布局，类似首页风格
- 新增：每个游戏卡片点击进入独立配置页面
- 新增：卡片 hover 显示快捷操作图标（眼睛图标控制首页显示/隐藏）

### 游戏数据管理系统
- 新增：数据 Schema 定义系统，定义每种游戏数据的结构
- 新增：基于 Schema 的表单自动生成，支持数据的增删改查
- 新增：预设默认数据（cities.json、heroes.json、movies）作为基础数据
- 新增：管理者可以在默认数据基础上自定义游戏数据
- 新增：一键重置为默认数据功能

### UI/UX 改进
- 配置页面支持折叠面板和弹窗形式展示配置项
- 数据管理使用表格+表单形式，支持搜索和分页
- **完全响应式设计**：移动端支持完整的数据管理操作

### 数据管理策略
- 配置变更**下一局生效**，进行中游戏不受影响
- 删除数据**仅影响新游戏**，历史记录保留
- 数据支持**过期机制**（默认 30 天，可配置）

## Impact

- Affected specs: `platform-core` (移除全局设置相关描述), 新增 `settings-admin` spec
- Affected code:
  - `src/views/Settings.vue` - 重构为卡片式布局
  - 新增 `src/views/GameSettings/` - 各游戏配置页面
  - 新增 `src/schemas/` - 数据 Schema 定义
  - 新增 `src/components/SchemaForm/` - Schema 驱动的表单组件
  - `src/utils/storageUtils.ts` - 扩展支持自定义游戏数据存储、过期机制
  - `src/router/index.ts` - 新增配置页面路由
