# Tasks: add-i18n

## 1. 引入 i18n 与初始化

- [x] 1.1 安装 vue-i18n（Vue 3 兼容版本），并在 `src/locales/`（或 `src/i18n/`）下创建 i18n 初始化文件（如 `index.ts`），配置 `createI18n`、默认 locale（zh-CN）、fallbackLocale
- [x] 1.2 在 `src/main.ts` 中注册 i18n 插件（`app.use(i18n)`），并在应用挂载前从 localStorage 读取上次语言（如 key `app-locale`），若有效则设为当前 locale
- [x] 1.3 创建 `zh-CN.json` 与 `en.json` 语言包骨架（可按命名空间分 key：common、home、games、settings 等），先填入少量占位文案以验证加载

## 2. 语言切换入口与持久化

- [x] 2.1 在导航栏或全局布局（如 `Navigation.vue` 或 `App.vue`）增加语言切换控件（下拉或中/英按钮）
- [x] 2.2 切换时更新 i18n 的 locale 并写入 localStorage，确保界面即时更新且下次启动使用该语言

## 3. 首页与导航文案替换

- [x] 3.1 将 `src/views/Home.vue` 中所有用户可见文案替换为 i18n key（如欢迎语、统计标签、按钮文字），并同步维护 zh-CN / en 语言包
- [x] 3.2 将 `src/components/Navigation.vue` 中导航项、设置入口等文案替换为 i18n key
- [x] 3.3 将 `src/config/games.ts` 中游戏的 title、description 改为 i18n key，在展示游戏列表的组件中通过 `t()` 解析并显示

## 4. 设置页与游戏设置子页

- [x] 4.1 将 `src/views/Settings.vue` 及 `src/views/GameSettings/*.vue` 中标题、标签、按钮、提示等文案替换为 i18n key，并更新语言包
- [x] 4.2 确保数据管理、表单校验提示、容量与过期等文案均来自 i18n

## 5. 游戏页与通用组件

- [x] 5.1 将各游戏视图（CityGuess、HeroGuess、MovieGuess、VisualGuess）中按钮、提示、统计、结果等文案替换为 i18n key，并更新语言包
- [x] 5.2 将通用组件（如 GameCard、GameHeader、Modal、PartyFloatingWidget、PartyDrawModal、DataManager、EditableDataTable 等）中的用户可见文案替换为 i18n key
- [x] 5.3 命令式调用（如 GameNotify、GameModal.alert）的 message/title 改为在调用处使用 `t()` 得到字符串后传入，或封装为接受 i18n key 的辅助方法

## 6. 验证与收尾

- [x] 6.1 全站走查：切换中/英后首页、设置、各游戏页、弹窗与通知文案均正确显示，无硬编码中文/英文残留
- [x] 6.2 运行 `npm run build` 通过，无类型与构建错误
- [ ] 6.3 可选：添加简单脚本或 lint 规则辅助检测模板/脚本中的硬编码中文字符串，避免回归
