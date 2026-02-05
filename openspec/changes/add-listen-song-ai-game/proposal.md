# Change: 添加听歌识曲 AI 朗读版游戏

## Why

现有平台的听音类玩法仅覆盖电影片段，缺少更轻量、互动性强的音乐向游戏。通过让玩家聆听 AI 朗读的黄金歌词再猜歌名，可以快速调动现场气氛，同时保持素材准备成本较低。

## What Changes

- 新增 `ListenSongAI.vue` 游戏视图，提供 AI 朗读黄金歌词、玩家输入答案、揭晓原曲音频等核心流程。
- 基于 Web Speech API（`SpeechSynthesisUtterance`）封装朗读逻辑，支持配置语种、语速、音调以及重播控制。
- 扩展游戏数据 Schema，新增 `lyrics`, `answer`, `audioClip`, `lang`, `rate`, `pitch`, `hints` 等字段，并在设置后台支持 CRUD 与音频资源管理。
- 为新游戏补充导航入口、首页卡片与配置面板说明，保持与现有游戏一致的体验。
- 预置 3-5 条示例曲目数据，方便管理员上手并可直接在现场使用。

## Impact

- Affected specs:
  - 新增 `listen-song-ai-game` 能力（描述玩法与朗读交互）。
  - 修改 `settings-admin`（补充新的数据 Schema 字段及音频资源管理要求）。
- Affected code:
  - `src/views/ListenSongAI.vue`（新建游戏页面）。
  - `src/components/`（新增语音朗读控制、提示展示、揭晓音频播放器等组件）。
  - `src/config/games.ts`、`src/views/Home.vue`、`src/views/Settings.vue`（注册新游戏入口与配置卡片）。
  - `src/components/DataManager.vue`、`src/components/SchemaForm/DataEditor.vue`（支持音频片段字段的上传/回显）。
  - `src/locales/`（若 i18n 变更已合入，则补充相关文案键值）。

## 技术考虑

- 使用浏览器内建的 Speech Synthesis，提供语音包可用性检测及回退提示；不支持的环境需提示改用播报文本。
- 音频揭晓片段以 `File` 对象或 Blob 存储于 IndexedDB，长度建议控制在 10 秒内以保证加载性能。
- 朗读与音频播放均应与倒计时/统计系统解耦，复用现有游戏状态管理模式。
