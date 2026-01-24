## ADDED Requirements

### Requirement: 平台首页
系统 SHALL 提供一个 Portfolio 风格的首页，展示所有可用游戏。

#### Scenario: 用户访问首页
- **WHEN** 用户访问平台根路径
- **THEN** 显示 Portfolio 风格的首页，包含所有游戏的卡片展示
- **AND** 每个游戏卡片显示游戏名称、描述和入口链接

### Requirement: 游戏导航
系统 SHALL 提供导航功能，允许用户在游戏之间切换。

#### Scenario: 用户导航到游戏
- **WHEN** 用户点击导航链接或游戏卡片
- **THEN** 路由切换到对应的游戏页面
- **AND** 导航栏保持可见，允许返回首页

### Requirement: 响应式布局
系统 SHALL 在桌面端和移动端提供良好的用户体验。

#### Scenario: 移动端访问
- **WHEN** 用户在移动设备上访问平台
- **THEN** 布局自动适配移动端屏幕
- **AND** 所有功能保持可用和易用

### Requirement: 路由管理
系统 SHALL 使用 Vue Router 管理应用路由，支持多游戏页面。

#### Scenario: 路由切换
- **WHEN** 用户在不同路由间切换
- **THEN** 页面平滑过渡，无刷新
- **AND** 浏览器历史记录正确更新

### Requirement: 游戏统计
系统 SHALL 显示当前会话的游戏统计信息。

#### Scenario: 显示统计
- **WHEN** 用户进行游戏
- **THEN** 系统记录当前会话的成功和失败次数
- **AND** 在游戏界面显示简单的统计信息（如：成功 X 次，失败 Y 次）
- **AND** 统计信息仅保存在内存中，刷新页面后重置
