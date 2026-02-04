# 🎮 在线游戏平台

<div align="center">

![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**面向年会、团建等场景的在线猜谜游戏平台，支持多种猜谜玩法与统一管理配置。**

[🎯 立即游玩](https://justinbiberrr.github.io/gameRepo/) | [🚀 开始开发](#开发)

</div>

---

## 面向谁

- **体验者**：在浏览器中选游戏、玩猜谜、看统计与成就。
- **游戏管理者**：提前配置各游戏的数据与参数，控制哪些游戏对玩家可见，并可配置年会活动（抽人、奖惩、数据有效期等）。

---

## 体验者视角

- **选游戏**：首页或导航中的游戏选择进入多款猜谜游戏（如城市猜测、英雄猜测、听片段猜电影、看图猜物品等）。
- **玩与反馈**：有限次数内根据提示猜测答案，支持倒计时等玩法。
- **统计与成就**：总胜/负/总场次、最佳连胜、今日统计；成就解锁后在首页展示。
- **清除数据**：可在首页一键清除本机会话与统计（不影响管理者配置）。

数据与进度均保存在本机浏览器，无需登录。

---

## 游戏管理者视角

- **入口**：导航栏「管理」进入游戏配置管理页。
- **游戏开关**：控制每个游戏是否在首页对玩家可见，便于按场次只开放部分游戏。
- **各游戏配置**：为每个游戏单独配置题目数据、游戏参数与倒计时等，支持自定义数据与过期时间。
- **年会活动配置**：统一配置数据有效期、随机奖惩规则与随机抽人名单等，适配线下活动。
- **数据过期**：自定义数据到期后自动恢复为默认数据，并在进入管理页时给予提示。

配置保存在本机；更换设备或浏览器需重新配置。

---

## 开发

### 在线游玩

**[点击这里立即游玩](https://justinbiberrr.github.io/gameRepo/)** — 无需安装，浏览器打开即可。

### 本地运行

```bash
git clone https://github.com/JustinBIBBERR/gameRepo.git
cd gameRepo
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run test:unit` | 单元测试 |
| `npm run test:e2e` | E2E 测试 |
| `npm run test:coverage` | 覆盖率报告 |

详见 [tests/README.md](tests/README.md)。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 + TypeScript | 前端框架 |
| Vite | 构建与开发服务器 |
| Vue Router | 路由 |
| Tailwind CSS | 样式 |
| localStorage / IndexedDB | 本地存储 |

---

## 项目结构（概要）

```
src/
├── views/           # 页面：首页、各游戏页、设置与各游戏配置页
├── components/      # 通用组件：导航、游戏卡片、计时器、弹窗等
├── config/          # 游戏统一配置（类型、路由、展示信息）
├── data/            # 默认题目数据（JSON）
├── utils/           # 工具：存储、成就、各游戏逻辑
├── composables/     # 组合式函数
└── router/          # 路由定义
```

---

## 部署

- 推送 `main` 分支后由 GitHub Actions 自动构建并部署到 GitHub Pages。
- 访问地址：https://justinbiberrr.github.io/gameRepo/

---

## 许可证与作者

- 许可证：[MIT](LICENSE)
- 作者：**JustinBIBBERR** — [GitHub](https://github.com/JustinBIBERRR)

如对你有帮助，欢迎给个 ⭐。
