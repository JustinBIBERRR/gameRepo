# Change: 听歌识曲 AI 朗读版输入改为「上传 AI 生成歌 MP3 + 歌词 + 歌手」

## Why
需求变动：主持人希望提前上传由 AI 生成的歌（MP3），并配置歌词文本与歌手信息；游戏中播放该 MP3 供玩家猜歌，揭晓时仅展示歌词与歌手信息，无需上传原曲、也不再依赖浏览器 TTS 朗读。

## What Changes
- **输入模型**：从「主持人配置文本 + AI 多语种朗读」改为「主持人上传 MP3（AI 生成歌）+ 歌词文本 + 歌手信息」；播放用音频为必填。
- **揭晓行为**：揭晓时仅展示文本歌词与歌手信息，不再播放原曲/揭晓音频。
- **移除**：朗读语种（lang）、语速（rate）、音调（pitch）配置；移除「揭晓时播放原曲片段」能力。
- **新增**：歌手信息（artist）字段，用于揭晓时展示。
- **BREAKING**：现有听歌识曲数据 Schema 与游戏逻辑不兼容；当前未到实用阶段，无需实现旧数据迁移，主持人可主动清理缓存后重配。

## Impact
- Affected specs: `listen-song-ai-game`, `settings-admin`
- Affected code: `src/schemas/listenSongSchema.ts`, `src/utils/listenSongStorage.ts`, `src/components/ListenSongDataManager.vue`, `src/views/ListenSongAI.vue`, `src/data/listenSongDefaults.ts`, `src/utils/listenSongUtils.ts`（选题/校验）；听歌识曲游戏页不再使用 `useSpeechReader` 播放歌词，改为使用 `<audio>` 播放上传的 MP3。
