# 增强游戏体验：设计文档

## 架构设计

### 1. 存储架构

#### 从 sessionStorage 迁移到 localStorage
- **sessionStorage**：仅用于当前游戏状态（临时）
- **localStorage**：用于长期数据（成就、统计、历史记录）

#### 数据结构设计

```typescript
// localStorage 键名
const STORAGE_KEYS = {
  CITY_GAME_STATS: 'cityGameStats',
  HERO_GAME_STATS: 'heroGameStats',
  ACHIEVEMENTS: 'achievements',
  GAME_HISTORY: 'gameHistory'
}

// 成就数据结构
interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: number | null
  progress: number
  maxProgress: number
}

// 游戏统计数据
interface GameStats {
  totalGames: number
  wins: number
  losses: number
  bestScore: number // 最少尝试次数
  averageAttempts: number
  currentStreak: number // 当前连续成功次数
  bestStreak: number // 最佳连续成功次数
  todayStats: {
    date: string
    games: number
    wins: number
  }
}
```

### 2. 成就系统设计

#### 成就分类
1. **里程碑成就**：总游戏数、总胜利数
2. **技能成就**：一次猜中、连续成功、最少尝试次数
3. **探索成就**：猜过所有城市、猜过所有英雄
4. **时间成就**：每日挑战、连续登录

#### 成就触发机制
- 游戏结束时检查成就条件
- 实时更新成就进度
- 解锁时显示庆祝动画

### 3. 可视化组件设计

#### 城市猜测 - 地图可视化
- 使用 SVG 绘制中国地图轮廓
- 标记已猜城市位置（不同颜色表示距离）
- 显示目标城市位置（游戏结束后）
- 用线条连接已猜城市，显示距离变化趋势

#### 英雄猜测 - 网格可视化
- 网格布局展示已猜英雄
- 每个英雄卡片显示：
  - 英雄名称
  - 匹配的属性（绿色高亮）
  - 未匹配的属性（灰色）
- 显示"已匹配 X/5 个属性"的进度

### 4. 动画系统设计

#### 成功动画
- **庆祝组件**：彩带/烟花效果（CSS 动画）
- **放大动画**：结果卡片放大显示
- **颜色变化**：背景色渐变

#### 失败动画
- **温和提示**：淡入淡出的"再试试"提示
- **进度条动画**：进度条平滑更新
- **卡片抖动**：轻微抖动效果（可选）

### 5. 进度提示系统

#### 进度条组件
- 显示当前尝试次数（X/5）
- 显示距离目标的"接近度"
- 城市猜测：基于距离计算接近度
- 英雄猜测：基于匹配属性数量计算接近度

#### 智能提示
- 每次错误后分析：
  - 城市猜测：距离是更近了还是更远了
  - 英雄猜测：匹配属性是增加了还是减少了
- 根据分析结果提供鼓励性提示

## 技术实现

### 1. 存储工具（storageUtils.ts）
- 统一管理 localStorage 操作
- 提供类型安全的读写接口
- 处理数据迁移（从 sessionStorage 到 localStorage）

### 2. 成就工具（achievementUtils.ts）
- 成就定义和检查逻辑
- 成就解锁触发
- 成就进度更新

### 3. 可视化组件
- **CityMap.vue**：SVG 地图组件
- **HeroGrid.vue**：英雄网格组件
- **ProgressBar.vue**：进度条组件
- **Celebration.vue**：庆祝动画组件
- **AchievementBadge.vue**：成就徽章组件

### 4. 动画实现
- 使用 CSS 动画和过渡
- 使用 Vue Transition 组件
- 避免使用重量级动画库

## 风险与权衡

### 风险
1. **性能影响**：地图可视化可能影响性能
   - **缓解**：使用 SVG 而非 Canvas，优化渲染
2. **数据迁移**：从 sessionStorage 迁移可能丢失数据
   - **缓解**：提供迁移脚本，保留 sessionStorage 作为备份
3. **浏览器兼容性**：localStorage 在某些浏览器可能受限
   - **缓解**：添加错误处理，降级到 sessionStorage

### 权衡
1. **动画复杂度 vs 性能**：选择轻量级 CSS 动画
2. **数据持久化 vs 隐私**：使用 localStorage，用户可清除
3. **功能丰富度 vs 开发时间**：分阶段实现，先实现核心功能

## 开放问题

1. 是否需要音效？用户选择了轻量级动画，但音效可以增强体验
2. 成就徽章的设计风格？是否需要自定义图标？
3. 地图数据来源？是否需要使用真实的地图 API 还是简化的 SVG？
