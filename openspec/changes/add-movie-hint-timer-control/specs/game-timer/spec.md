## ADDED Requirements

### Requirement: 倒计时开关控制
游戏倒计时功能 SHALL 支持通过配置开关启用或禁用，允许用户选择是否使用倒计时模式。

#### Scenario: 倒计时开关开启时显示倒计时
- **GIVEN** 游戏配置中 `enableTimer` 为 `true`
- **WHEN** 游戏开始
- **THEN** 显示倒计时组件
- **AND** 倒计时正常运行
- **AND** 倒计时结束时触发游戏失败

#### Scenario: 倒计时开关关闭时不显示倒计时
- **GIVEN** 游戏配置中 `enableTimer` 为 `false`
- **WHEN** 游戏开始
- **THEN** 不显示倒计时组件
- **AND** 游戏不受时间限制
- **AND** 用户可以无限时间内完成游戏

#### Scenario: 游戏类型覆盖全局设置
- **GIVEN** 全局默认设置 `enableTimer` 为 `true`
- **AND** 电影游戏覆盖设置 `enableTimer` 为 `false`
- **WHEN** 进入电影猜测游戏
- **THEN** 倒计时不显示（使用覆盖设置）
- **WHEN** 进入城市猜测游戏
- **THEN** 倒计时显示（使用全局默认）

#### Scenario: 倒计时关闭时不保存倒计时状态
- **GIVEN** 游戏配置中 `enableTimer` 为 `false`
- **WHEN** 游戏进行中
- **THEN** 不保存倒计时相关状态到 localStorage
- **AND** 页面刷新后游戏状态正常恢复（不包含倒计时）
