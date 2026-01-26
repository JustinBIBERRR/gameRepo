# Design: Settings 管理员后台架构设计

## Context

### 背景
- 当前 Settings 页面面向普通玩家，包含全局默认设置和游戏覆盖设置
- 实际场景中（如年会活动），管理者提前配置，玩家只需游玩
- 游戏数据（cities.json, heroes.json）是静态的，管理者无法自定义

### 约束
- 使用 Vue 3 + TypeScript
- 数据存储在 localStorage/IndexedDB（无后端）
- 保持移动端友好

### 利益相关者
- 游戏管理者：需要简单高效的配置界面
- 玩家：不需要关心设置，直接游玩

## Goals / Non-Goals

### Goals
- 将 Settings 重新定位为管理员专用后台
- 提供卡片式布局，直观展示可配置的游戏
- 支持快捷控制游戏在首页的显示/隐藏
- 实现基于 Schema 的数据管理系统，支持 CRUD
- **完全响应式设计**，移动端支持完整数据管理
- 实现数据过期机制，默认 30 天可配置
- 保持 UI 简洁美观，操作流畅

### Non-Goals
- 用户权限管理（本期不做登录认证）
- 多管理员协作
- 数据导入导出功能（可后续迭代）

## Decisions

### Decision 1: 页面路由结构

```
/settings                 → 游戏卡片列表页面
/settings/city            → 城市猜测配置页面
/settings/hero            → 英雄猜测配置页面
/settings/movie           → 电影猜测配置页面
```

**Rationale**: 清晰的 URL 结构，便于直接跳转到特定游戏配置。

### Decision 2: Schema 定义格式

使用 JSON Schema 风格定义数据结构：

```typescript
// src/schemas/types.ts
interface FieldSchema {
  key: string              // 字段键名
  label: string            // 显示名称
  type: 'string' | 'number' | 'boolean' | 'array' | 'select'
  required?: boolean       // 是否必填
  options?: string[]       // select 类型的选项
  placeholder?: string     // 占位提示
  validation?: {           // 验证规则
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

interface GameDataSchema {
  id: string               // Schema ID (如 'city', 'hero')
  name: string             // 显示名称
  description: string      // 描述
  fields: FieldSchema[]    // 字段定义
  primaryKey: string       // 主键字段
}
```

**Rationale**: 类 JSON Schema 格式易于理解和扩展，可自动生成表单。

### Decision 3: 数据存储架构

```typescript
// 存储 Key 设计
CUSTOM_CITY_DATA = 'customCityData'      // 城市游戏自定义数据
CUSTOM_HERO_DATA = 'customHeroData'      // 英雄游戏自定义数据
CUSTOM_MOVIE_DATA = 'customMovieData'    // 电影游戏自定义数据
GAME_VISIBILITY = 'gameVisibility'       // 游戏显示/隐藏状态
SETTINGS_META = 'settingsMeta'           // Settings 元数据（过期时间等）

// 数据结构
interface CustomGameData<T> {
  useCustom: boolean       // 是否使用自定义数据
  items: T[]               // 自定义数据项
  lastModified: number     // 最后修改时间
  expiresAt: number        // 过期时间戳
}

interface GameVisibility {
  city: boolean            // 城市游戏是否在首页显示
  hero: boolean            // 英雄游戏是否在首页显示
  movie: boolean           // 电影游戏是否在首页显示
}

interface SettingsMeta {
  dataExpirationDays: number  // 数据过期天数，默认 30
  lastAccess: number          // 最后访问时间
}
```

**Rationale**: 
- 与默认数据分离存储，便于重置
- 使用 `useCustom` 标识便于切换默认/自定义数据
- `expiresAt` 支持数据过期机制
- `GameVisibility` 独立存储，便于快捷切换

### Decision 3.1: 数据过期机制

```typescript
// 数据过期检查逻辑
function checkDataExpiration() {
  const meta = getSettingsMeta()
  const now = Date.now()
  const expirationMs = meta.dataExpirationDays * 24 * 60 * 60 * 1000
  
  for (const gameType of ['city', 'hero', 'movie']) {
    const data = getCustomGameData(gameType)
    if (data && data.lastModified + expirationMs < now) {
      // 数据已过期，清除自定义数据
      clearCustomGameData(gameType)
    }
  }
}
```

**Rationale**:
- 基于 `lastModified` 计算过期，而非 `expiresAt`，避免每次修改都要更新过期时间
- 应用启动时检查一次即可，无需定时器

### Decision 4: 组件架构

```
src/
├── views/
│   ├── Settings.vue                    # 游戏卡片列表
│   └── GameSettings/
│       ├── CitySettings.vue            # 城市游戏配置
│       ├── HeroSettings.vue            # 英雄游戏配置
│       └── MovieSettings.vue           # 电影游戏配置
├── components/
│   ├── SettingsCard.vue                # 设置卡片组件
│   └── SchemaForm/
│       ├── SchemaForm.vue              # Schema 驱动的表单
│       ├── SchemaTable.vue             # Schema 驱动的表格
│       ├── FormField.vue               # 表单字段组件
│       └── DataEditor.vue              # 数据编辑器（表格+表单）
└── schemas/
    ├── types.ts                        # Schema 类型定义
    ├── citySchema.ts                   # 城市数据 Schema
    ├── heroSchema.ts                   # 英雄数据 Schema
    └── movieSchema.ts                  # 电影数据 Schema
```

**Rationale**: 
- 模块化组织，职责清晰
- Schema 与组件解耦，便于扩展新游戏

### Decision 5: 配置项展示形式

| 配置类型 | 展示形式 |
|---------|---------|
| 简单开关/数值 | 直接在页面显示 |
| 复杂配置（如时间范围） | 折叠面板 |
| 数据管理（增删改查） | 弹窗形式 |

**Rationale**: 根据配置复杂度选择合适的 UI 形式，避免页面过长。

## Risks / Trade-offs

### Risk 1: localStorage 容量限制
- **风险**: 大量自定义数据可能超出 localStorage 5MB 限制
- **缓解**: 监控数据大小，必要时升级到 IndexedDB

### Risk 2: Schema 变更兼容性
- **风险**: Schema 更新后旧数据可能不兼容
- **缓解**: 实现 Schema 版本控制和数据迁移逻辑

### Risk 3: 移除全局设置的影响
- **风险**: 已有用户的全局设置会丢失
- **缓解**: 迁移时将全局设置应用到各游戏的独立配置中

## Migration Plan

### 步骤

1. **数据迁移**: 首次加载新版本时，将旧版全局设置迁移到各游戏独立配置
2. **UI 迁移**: 逐步替换 Settings 页面组件
3. **回滚计划**: 保留旧代码一个版本周期，如有问题可快速回滚

### 迁移逻辑

```typescript
function migrateSettings() {
  const oldSettings = getGameSettings()
  if (oldSettings.defaults) {
    // 将全局默认值应用到各游戏的独立配置
    for (const gameType of ['city', 'hero', 'movie']) {
      const gameConfig = {
        ...oldSettings.defaults,
        ...oldSettings.overrides[gameType]
      }
      saveGameConfig(gameType, gameConfig)
    }
    // 清除旧格式数据
    localStorage.removeItem('gameSettings')
  }
}
```

## Key Decisions (Clarified)

| 问题 | 决策 |
|------|------|
| 配置变更生效时机 | **下一局生效**，进行中游戏不受影响 |
| 删除数据影响处理 | **仅影响新游戏**，历史记录保留 |
| 管理设备支持 | **完全响应式**，移动端支持完整数据管理 |
| 数据恢复能力 | **一键重置为默认数据** |
| 数据导入导出 | **支持全量 JSON 导入导出**，便于批量操作和备份 |
| 数据过期机制 | **默认 30 天**，可在 Settings 中配置 |
| 数据条目上限 | **单个游戏最多 500 条**，新增前检查并阻止，显示容量状态 |
| 管理员访问保护 | **不做保护**，Settings 页面公开访问 |
| Settings 入口设计 | **仅保留齿轮图标**，导航栏不显示文字 |
| 自定义数据初始化 | **复制全部默认数据**作为起点 |
| 数据过期通知 | **进入管理页面时 Toast 提示**，通知管理员数据已过期清除 |

## Open Questions

1. ~~**Q**: 是否需要支持数据导入/导出功能？~~
   **A**: 已确认本期暂不支持，后续迭代

2. ~~**Q**: 自定义数据的最大条目数限制？~~
   **A**: 已确认单个游戏最多 500 条

3. **Q**: 是否需要支持数据的批量编辑？
   **A**: 本期仅支持单条增删改查，批量编辑可后续添加
