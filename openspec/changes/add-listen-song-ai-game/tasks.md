## 1. Implementation
- [x] 1.1 在 `src/config/games.ts`、`src/views/Home.vue`、导航/路由中注册“听歌识曲 AI 朗读版”入口及描述卡片。
- [x] 1.2 新建 `ListenSongAI.vue`，实现朗读控制、提示展示、猜测提交、揭晓音频播放与重玩流程。
- [x] 1.3 封装 `useSpeechReader` 组合式函数，支持语种/语速/音调参数、浏览器兼容检测与重播控制。
- [x] 1.4 在设置后台扩展 Schema 与表单，支持录入 `lyrics`、`answer`、`audioClip`、`lang`、`rate`、`pitch`、`hints`，并允许上传音频文件。
- [x] 1.5 在 `DataManager` / `SchemaForm` 相关组件中添加音频字段 UI（上传、预览、大小限制），复用 IndexedDB 存储。
- [x] 1.6 提供示例数据与必要的 i18n 文案（若适用），确保默认即可体验。

## 2. Validation
- [ ] 2.1 桌面端 Chrome/Edge 手动测试朗读、提示、猜测与揭晓流程。
- [ ] 2.2 在不支持 Speech Synthesis 的浏览器（DevTools 模拟或降级开关）验证回退行为。
- [ ] 2.3 上传超大音频文件时验证拦截与提示。
- [x] 2.4 运行 `npm run build` 确认类型检查与构建通过。
