# Project Context

## Purpose
一个现代化的在线游戏平台，集合了多种有趣的小游戏（城市猜测、英雄猜测、电影猜测），主要面向公司年会、团建等场景使用。

## Tech Stack
- **框架**: Vue 3.4+ (Composition API + `<script setup>`)
- **语言**: TypeScript 5.4+
- **构建工具**: Vite 5.x
- **路由**: Vue Router 4.x
- **样式**: Tailwind CSS 3.x
- **UI 组件库**: @opentiny/vue@3 (TinyVue)
- **图标**: @opentiny/vue-icon
- **存储**: localStorage / IndexedDB

## Project Conventions

### 组件库使用规范

本项目使用 [TinyVue](https://opentiny.design/tiny-vue) 作为 UI 组件库。

#### 全局注册机制

所有 TinyVue 组件在 `src/gameComponents.ts` 中按需导入并全局注册：
- **组件前缀**: `game-`
- **命名转换**: `TinyButton` → `game-button`（自动转换为小写 kebab-case）
- **Tree-shaking**: 仅导入使用的组件，未使用的不会打包

```typescript
// src/gameComponents.ts 核心逻辑
const PREFIX = 'game'

tinyComponents.forEach((component) => {
  // TinyButton -> game-button
  const name = component.name.replace('Tiny', PREFIX + '-').toLowerCase()
  app.component(name, component)
})
```

#### 组件命名规则

| TinyVue 原名 | 全局注册名 | 说明 |
|-------------|-----------|------|
| TinyButton | game-button | 按钮 |
| TinyInput | game-input | 输入框 |
| TinySwitch | game-switch | 开关 |
| TinySelect | game-select | 下拉选择 |
| TinyOption | game-option | 下拉选项 |
| TinyForm | game-form | 表单 |
| TinyFormItem | game-formitem | 表单项 |
| TinyTable | game-table | 表格 |
| TinyGrid | game-grid | 高级表格 |
| TinyGridColumn | game-gridcolumn | 表格列 |
| TinyModal | game-modal | 模态框 |
| TinyDrawer | game-drawer | 抽屉 |
| TinyDialogBox | game-dialogbox | 对话框 |
| TinyCard | game-card | 卡片 |
| TinyTabs | game-tabs | 标签页 |
| TinyTabItem | game-tabitem | 标签项 |
| TinyCollapse | game-collapse | 折叠面板 |
| TinyCollapseItem | game-collapseitem | 折叠项 |
| TinyTooltip | game-tooltip | 文字提示 |
| TinyPopover | game-popover | 气泡弹出框 |
| TinyAlert | game-alert | 警告 |
| TinyPager | game-pager | 分页 |
| TinyNumeric | game-numeric | 数字输入 |
| TinyCheckbox | game-checkbox | 复选框 |
| TinyRadio | game-radio | 单选框 |
| TinyTag | game-tag | 标签 |
| TinyBadge | game-badge | 徽章 |
| TinySearch | game-search | 搜索框 |
| TinyRow | game-row | 行布局 |
| TinyCol | game-col | 列布局 |

#### 图标命名规则

| TinyVue 原名 | 全局注册名 | 用途 |
|-------------|-----------|------|
| IconEyeopen | game-icon-eyeopen | 显示/可见 |
| IconEyeclose | game-icon-eyeclose | 隐藏/不可见 |
| IconPlus | game-icon-plus | 新增 |
| IconDel | game-icon-del | 删除 |
| IconEdit | game-icon-edit | 编辑 |
| IconSearch | game-icon-search | 搜索 |
| IconRefresh | game-icon-refresh | 刷新/重置 |
| IconSetting | game-icon-setting | 设置 |
| IconClose | game-icon-close | 关闭 |
| IconChevronLeft | game-icon-chevronleft | 左箭头 |
| IconChevronRight | game-icon-chevronright | 右箭头 |
| IconChevronUp | game-icon-chevronup | 上箭头 |
| IconChevronDown | game-icon-chevrondown | 下箭头 |
| IconYes | game-icon-yes | 成功/确认 |
| IconWarning | game-icon-warning | 警告 |
| IconError | game-icon-error | 错误 |
| IconHelp | game-icon-help | 帮助 |
| IconInfoCircle | game-icon-infocircle | 信息 |

#### 使用示例

```vue
<template>
  <!-- 无需 import，直接使用 game-xxx 组件 -->
  <game-button type="primary" @click="handleClick">
    <game-icon-plus /> 新增
  </game-button>
  
  <game-form :model="form" label-width="100px">
    <game-formitem label="名称">
      <game-input v-model="form.name" placeholder="请输入名称" />
    </game-formitem>
    <game-formitem label="启用">
      <game-switch v-model="form.enabled" />
    </game-formitem>
  </game-form>
  
  <game-grid :data="tableData">
    <game-gridcolumn field="name" title="名称" />
    <game-gridcolumn field="status" title="状态" />
  </game-grid>
</template>

<script setup lang="ts">
// 无需导入组件，已全局注册
import { ref } from 'vue'

const form = ref({ name: '', enabled: true })
const tableData = ref([])

function handleClick() {
  console.log('clicked')
}
</script>
```

#### 命令式调用

```typescript
import { GameNotify, GameModal, GameLoading } from '@/gameComponents'

// 通知提示
GameNotify({ type: 'success', message: '操作成功' })
GameNotify({ type: 'error', message: '操作失败' })

// 模态框
GameModal.alert({ message: '提示内容', title: '提示' })

// 加载状态
const loading = GameLoading.service({ text: '加载中...' })
// ... 异步操作
loading.close()
```

#### 新增组件

如需添加新的 TinyVue 组件，在 `src/gameComponents.ts` 中：

1. 从 `@opentiny/vue` 导入组件
2. 将组件添加到 `tinyComponents` 数组

```typescript
// 1. 导入
import { Button, Input, NewComponent } from '@opentiny/vue'

// 2. 添加到数组
const tinyComponents: Component[] = [
  Button,
  Input,
  NewComponent,  // 新增
  // ...
]
```

#### 参考文档

- [TinyVue 官方文档](https://opentiny.design/tiny-vue)
- [TinyVue 组件列表](https://opentiny.design/tiny-vue/zh-CN/smb-theme/components/button)
- [TinyVue GitHub](https://github.com/opentiny/tiny-vue)

### Code Style
- 使用 Composition API + `<script setup>` 语法
- 组件文件使用 PascalCase 命名（如 `GameCard.vue`）
- 工具函数使用 camelCase 命名（如 `storageUtils.ts`）
- 类型定义使用 PascalCase（如 `interface GameSettings`）

### Architecture Patterns
- **视图组件**: `src/views/` - 页面级组件
- **通用组件**: `src/components/` - 可复用的 UI 组件
- **组合式函数**: `src/composables/` - 可复用的逻辑
- **工具函数**: `src/utils/` - 纯函数工具
- **数据文件**: `src/data/` - 静态 JSON 数据
- **Schema 定义**: `src/schemas/` - 数据结构定义

### Testing Strategy
- 构建前进行 TypeScript 类型检查
- 手动测试各页面功能

### Git Workflow
- 使用英文编写 commit message
- 提交前必须执行 `npm run build` 确保构建和类型检查通过

## Domain Context
- **游戏管理者**: 使用 Settings 页面提前配置游戏参数和数据
- **玩家**: 在首页选择游戏进行游玩
- **使用场景**: 公司年会、团建活动等

## Important Constraints
- 纯前端应用，无后端服务
- 数据存储在浏览器本地（localStorage/IndexedDB）
- 支持移动端响应式布局
- 单个游戏自定义数据最多 500 条

## External Dependencies
- TinyVue 组件库文档: https://opentiny.design/tiny-vue
- TinyVue GitHub: https://github.com/opentiny/tiny-vue
