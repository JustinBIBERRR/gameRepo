# Change: 添加游戏倒计时功能和全局设置页面

## Why
为游戏平台添加倒计时功能，增加游戏的挑战性和紧张感。用户可以在游戏开始前设置倒计时时长，如果时间到还未猜对答案，游戏将自动判定失败。同时提供全局设置页面，允许用户自定义游戏参数（倒计时时长、尝试次数等），支持全局默认值和游戏类型覆盖。

## What Changes
- 创建独立的全局设置页面，通过导航栏设置图标进入
- 支持全局默认设置和游戏类型覆盖（城市猜测、英雄猜测可分别配置）
- 配置项包括：
  - 倒计时时长（1-60分钟，默认5分钟）
  - 最大尝试次数（3-10次，默认5次）
  - 是否显示初始提示（默认开启）
- 所有游戏（城市猜测、英雄猜测）集成倒计时功能
- 倒计时和尝试次数双重限制，任一触发即失败
- 游戏开始时自动启动倒计时
- 倒计时结束时自动判定游戏失败并显示提示弹框
- 弹框提供"再来一局"和"回到首页"两个选项
- 每次新游戏自动重置定时器
- 修改设置后立即更新定时器（如果游戏正在进行）
- 首页不启动倒计时（仅在游戏页面启动）
- 倒计时状态恢复：刷新页面后从暂停时的剩余时间继续，并显示3秒悬浮提示

## Impact
- Affected specs:
  - `timer-settings` - 倒计时设置功能（新增）
  - `game-timer` - 游戏倒计时功能（新增）
  - `platform-core` - 平台核心（修改：添加设置入口）
  - `city-guess-game` - 城市猜测游戏（修改：集成倒计时）
  - `hero-guess-game` - 英雄猜测游戏（修改：集成倒计时）
- Affected code:
  - `src/components/Navigation.vue` - 添加设置页面入口（设置图标）
  - `src/views/Settings.vue` - 新建全局设置页面
  - `src/components/GameTimer.vue` - 新建游戏倒计时显示组件
  - `src/components/TimerRestoreTip.vue` - 新建倒计时恢复提示组件
  - `src/composables/useTimer.ts` - 新建倒计时逻辑 composable
  - `src/utils/storageUtils.ts` - 添加设置存储（全局默认 + 游戏类型覆盖）
  - `src/router/index.ts` - 添加设置页面路由
  - `src/views/CityGuess.vue` - 集成倒计时功能，读取配置
  - `src/views/HeroGuess.vue` - 集成倒计时功能，读取配置
