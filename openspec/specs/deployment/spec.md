# deployment Specification

## Purpose
TBD - created by archiving change add-game-platform. Update Purpose after archive.
## Requirements
### Requirement: GitHub Pages 部署
系统 SHALL 能够部署到 GitHub Pages 并正常访问。

#### Scenario: 部署到 GitHub Pages
- **WHEN** 代码推送到 GitHub 仓库
- **THEN** 可以通过 GitHub Pages URL 访问平台
- **AND** 所有路由正常工作
- **AND** 所有游戏功能正常

### Requirement: 构建配置
系统 SHALL 配置 Vite 构建输出，生成适合静态部署的文件。

#### Scenario: 构建项目
- **WHEN** 运行构建命令
- **THEN** 生成静态文件到 dist 目录
- **AND** 文件结构适合 GitHub Pages 部署

### Requirement: 路由重定向
系统 SHALL 处理 SPA 路由在 GitHub Pages 上的重定向问题。

#### Scenario: 直接访问游戏路由
- **WHEN** 用户直接访问游戏路由 URL（如 /city-guess）
- **THEN** 页面正确加载，不显示 404
- **AND** 路由功能正常工作

### Requirement: 部署后热更新与数据保留
部署后用户应能加载新版本而无需清缓存或无痕；同时保留用户上传（视频、图片、听歌）与游戏设置，仅更新/清理游玩数据与记录。

#### Scenario: 部署后首次加载新版本
- **WHEN** 用户打开已部署的站点且服务端已更新为新一轮构建
- **THEN** 浏览器应能拉取到最新的 index.html 与带新 hash 的 JS/CSS（建议 CDN/服务器对 index.html 设置 `Cache-Control: no-cache` 或短 max-age）
- **AND** 应用启动时若检测到版本变化，仅清除游玩统计、成就、历史等，保留 gameSettings、自定义数据、IndexedDB 中的用户上传

#### Scenario: 数据保留范围
- **WHEN** 应用因版本更新执行数据清理
- **THEN** 保留：gameSettings、settingsMeta、gameVisibility、自定义游戏数据、年会配置、IndexedDB（电影/听歌文件）
- **AND** 清除：各游戏统计、成就、游戏历史、倒计时状态、迁移标记等

### Requirement: 部署文档
系统 SHALL 提供部署说明文档，指导如何部署到 GitHub Pages。

#### Scenario: 查看部署说明
- **WHEN** 用户查看 README.md
- **THEN** 包含详细的部署步骤说明
- **AND** 包含必要的配置信息（如 API key 配置）

