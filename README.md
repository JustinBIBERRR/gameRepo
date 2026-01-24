# 🎮 在线游戏平台

<div align="center">

![Vue](https://img.shields.io/badge/Vue-3.4-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**一个现代化的在线游戏平台，集合了多种有趣的小游戏，挑战你的知识和推理能力！**

[🎯 立即游玩](https://justinbiberrr.github.io/gameRepo/) | [📖 文档](#功能特性) | [🚀 开始开发](#开发)

</div>

---

## ✨ 功能特性

### 🎯 城市猜测游戏
- 🗺️ **智能距离计算**：使用 Haversine 公式精确计算城市间距离
- 📊 **可视化趋势**：距离趋势图表展示猜测进度
- 💡 **智能提示**：每次猜测后提供距离、方位和城市特点提示
- 🎨 **精美动画**：成功/失败时的庆祝动画和微交互

### ⚔️ 王者荣耀人物猜测游戏
- 🎭 **多属性匹配**：通过职业、年代、国籍、人类、性别等属性推理
- 🎨 **可视化网格**：直观展示已猜英雄和属性匹配情况
- 📈 **进度追踪**：实时显示匹配进度和接近度
- 🏆 **成就系统**：解锁各种成就徽章

### 🎊 平台特性
- 🎨 **现代化 UI**：Portfolio 风格设计，响应式布局
- 📱 **移动端优化**：完美适配手机、平板和桌面设备
- 💾 **数据持久化**：使用 localStorage 保存游戏统计和成就
- 🏅 **成就系统**：多层次成就，包括里程碑、技能、时间等
- 📊 **数据统计**：详细的游戏统计和历史记录
- 🎭 **动画效果**：丰富的动画和微交互提升体验

---

## 🚀 快速开始

### 在线游玩

**👉 [点击这里立即游玩](https://justinbiberrr.github.io/gameRepo/)**

无需安装，直接在浏览器中体验！

### 本地开发

#### 1. 克隆仓库

```bash
git clone https://github.com/JustinBIBBERR/gameRepo.git
cd gameRepo
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 开始开发！

#### 4. 构建生产版本

```bash
npm run build
```

---

## 🛠️ 技术栈

<div align="center">

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3** | 3.4+ | 渐进式 JavaScript 框架 |
| **TypeScript** | 5.4+ | 类型安全的 JavaScript |
| **Vite** | 5.1+ | 下一代前端构建工具 |
| **Tailwind CSS** | 3.4+ | 实用优先的 CSS 框架 |
| **Vue Router** | 4.3+ | Vue.js 官方路由管理器 |

</div>

---

## 📁 项目结构

```
gameRepo/
├── src/
│   ├── views/              # 页面组件
│   │   ├── Home.vue        # 首页
│   │   ├── CityGuess.vue   # 城市猜测游戏
│   │   └── HeroGuess.vue   # 王者荣耀人物猜测游戏
│   ├── components/         # 可复用组件
│   │   ├── Navigation.vue  # 导航栏
│   │   ├── GameCard.vue    # 游戏卡片
│   │   ├── Autocomplete.vue # 自动完成输入
│   │   ├── ProgressBar.vue # 进度条
│   │   ├── Celebration.vue # 庆祝动画
│   │   ├── DistanceChart.vue # 距离趋势图表
│   │   ├── HeroGrid.vue    # 英雄网格
│   │   └── AchievementBadge.vue # 成就徽章
│   ├── data/               # 数据文件
│   │   ├── cities.json     # 城市数据（150+个城市）
│   │   └── heroes.json     # 英雄数据（118个英雄）
│   ├── utils/              # 工具函数
│   │   ├── cityUtils.ts    # 城市相关工具
│   │   ├── heroUtils.ts    # 英雄相关工具
│   │   ├── storageUtils.ts # 存储管理
│   │   └── achievementUtils.ts # 成就系统
│   ├── composables/        # 组合式函数
│   │   └── useModal.ts     # 模态框管理
│   └── router/             # 路由配置
│       └── index.ts
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 部署配置
└── README.md
```

---

## 🎮 游戏说明

### 🗺️ 城市猜测游戏

**游戏规则：**
1. 系统随机选择一个国内主要城市
2. 你有 **5次** 猜测机会
3. 每次猜测后会显示：
   - 📏 **距离**：与目标城市的距离（公里）
   - 🧭 **方位**：目标城市在你猜测城市的哪个方向
   - 💡 **城市特点**：目标城市的一个特点提示
4. 根据提示逐步缩小范围，找到目标城市！

**技巧提示：**
- 利用初始提示快速定位大致区域
- 观察距离变化趋势，判断是否接近目标
- 结合方位和距离信息，逐步缩小搜索范围

### ⚔️ 王者荣耀人物猜测游戏

**游戏规则：**
1. 系统随机选择一个王者荣耀英雄
2. 你有 **5次** 猜测机会
3. 每次猜测后会显示属性匹配情况：
   - ⚔️ **职业**：打野、法师、射手、辅助、战士
   - 📜 **年代**：商朝、战国、秦朝、汉朝、三国等
   - 🌍 **国籍**：中国、日本、未知等
   - 👤 **人类**：人类、虚拟角色
   - ⚧️ **性别**：男、女
4. 匹配的属性会以绿色高亮显示，帮助你推理！

**技巧提示：**
- 利用初始提示的属性快速筛选
- 观察属性匹配数量，判断接近程度
- 结合多个属性组合，缩小候选范围

---

## 🏆 成就系统

平台内置了丰富的成就系统，包括：

- 🎮 **里程碑成就**：完成游戏、获得胜利等
- 🎯 **技能成就**：一次猜中、连续成功等
- 📅 **时间成就**：每日挑战等

解锁成就后会在首页展示，展示你的游戏成就！

---

## 📊 数据说明

### 城市数据
- **数量**：150+ 个主要城市
- **范围**：省会、直辖市、计划单列市、知名地级市
- **字段**：名称、别名、经纬度、城市特点
- **位置**：`src/data/cities.json`

### 英雄数据
- **数量**：118 个王者荣耀英雄
- **属性**：职业、年代、国籍、人类、性别
- **位置**：`src/data/heroes.json`

---

## 🚀 部署

### GitHub Pages 自动部署

项目已配置 GitHub Actions，推送到 `main` 分支后会自动构建并部署到 GitHub Pages。

**访问地址：** https://justinbiberrr.github.io/gameRepo/

### 手动部署

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录的内容推送到 `gh-pages` 分支

3. 在 GitHub 仓库设置中启用 GitHub Pages

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 开发计划

- [x] ✅ 项目基础架构
- [x] ✅ 城市猜测游戏
- [x] ✅ 王者荣耀人物猜测游戏
- [x] ✅ 成就系统
- [x] ✅ 数据持久化
- [x] ✅ 可视化组件
- [x] ✅ 动画效果
- [ ] 🔄 添加更多游戏
- [ ] 🔄 优化移动端体验
- [ ] 🔄 添加音效
- [ ] 🔄 多语言支持

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 👨‍💻 作者

**JustinBIBBERR**

- GitHub: [@JustinBIBBERRR](https://github.com/JustinBIBBERRR)

---

## ⭐ 如果这个项目对你有帮助，请给个 Star！

<div align="center">

**🎮 享受游戏，挑战自我！**

[⬆ 回到顶部](#-在线游戏平台)

</div>
