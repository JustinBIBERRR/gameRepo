# Change: 添加电影初始提示配置和倒计时开关控制

## Why
当前电影猜测游戏缺少初始提示功能，且所有游戏的倒计时无法关闭，用户无法选择休闲模式。为了提升用户体验和游戏灵活性，需要：
1. 为电影添加可配置的初始提示（如"漫威"、"国产动画"等）
2. 为所有游戏类型添加倒计时开关，允许用户选择是否启用倒计时

## What Changes
- 为电影数据结构添加 `hint` 可选字段，支持简短的初始提示配置
- 在设置页面的电影注册表单中添加"初始提示"输入框（可选，建议10字以内）
- 在电影猜测游戏页面显示初始提示（受全局"显示初始提示"开关控制）
- 为游戏设置添加 `enableTimer` 字段，支持全局默认和游戏类型覆盖
- 优化设置页面UI，使用一行式交互（复选框 + 内联输入框）实现倒计时开关和时长配置
- 在所有游戏页面根据 `enableTimer` 配置控制倒计时显示

## Impact
- 影响的规范：
  - `movie-guess-game` - 添加初始提示显示逻辑
  - `game-timer` - 添加倒计时开关控制
  - `timer-settings` - 更新设置UI和数据结构
- 影响的代码：
  - `src/views/Settings.vue` - 添加电影提示输入框和倒计时开关UI
  - `src/views/MovieGuess.vue` - 显示初始提示
  - `src/views/CityGuess.vue` - 根据开关控制倒计时
  - `src/views/HeroGuess.vue` - 根据开关控制倒计时
  - `src/utils/storageUtils.ts` - 更新类型定义和默认值
  - `src/utils/movieStorage.ts` - 支持 `hint` 字段
  - `src/data/movies.json` - 数据结构支持（向后兼容）
