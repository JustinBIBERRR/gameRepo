## ADDED Requirements

### Requirement: 应用级语言与消息绑定

系统 SHALL 在应用层提供当前语言（locale）与翻译消息的绑定，使所有用户可见的界面文案通过统一的 i18n 机制解析并展示。

#### Scenario: 应用启动时使用已保存或默认语言

- **WHEN** 用户打开应用
- **THEN** 系统使用上次保存的语言偏好（若存在且有效）作为当前 locale
- **AND** 若未保存或无效，则使用默认语言（如 zh-CN）
- **AND** 界面文案按当前 locale 显示

#### Scenario: 界面文案来自 i18n 消息

- **WHEN** 任意页面或组件需要展示用户可见的文案
- **THEN** 文案通过 i18n 的翻译函数（如 `$t('key')` 或 `useI18n().t('key')`）根据当前 locale 解析
- **AND** 不依赖硬编码的中文或英文字符串

### Requirement: 语言包与至少两种语言

系统 SHALL 提供按语言组织的消息键值（语言包），并至少支持中文（默认）与英文两种语言。

#### Scenario: 语言包存在且可加载

- **WHEN** 应用初始化 i18n
- **THEN** 存在对应语言的消息文件（如 zh-CN、en）并可被正确加载
- **AND** 消息键与界面使用的 key 一致，避免缺失 key 导致空白或 key 裸露

#### Scenario: 默认与回退语言

- **WHEN** 当前 locale 下某 key 无翻译或 locale 未支持
- **THEN** 系统回退到默认语言（如 zh-CN）的对应消息（若存在）
- **AND** 避免界面出现未翻译的 key 或报错

### Requirement: 语言切换入口与即时生效

系统 SHALL 提供语言切换入口（如导航栏或设置页），用户切换后界面即时切换为所选语言，且偏好持久化到本地。

#### Scenario: 用户切换语言

- **WHEN** 用户在语言切换控件中选择另一种语言（如从中文切换到英文）
- **THEN** 当前 locale 更新为所选语言
- **AND** 界面文案立即按新语言重新渲染，无需刷新页面

#### Scenario: 语言偏好持久化

- **WHEN** 用户完成一次语言切换
- **THEN** 所选语言写入本地存储（如 localStorage）
- **AND** 下次打开应用时优先使用该语言作为当前 locale

### Requirement: 游戏与配置文案统一走 i18n

系统 SHALL 将游戏列表的标题、描述以及设置页、游戏页、通用组件中的展示文案统一通过 i18n 消息提供，不保留硬编码的界面文案。

#### Scenario: 游戏列表标题与描述

- **WHEN** 首页或导航展示游戏卡片（标题、描述）
- **THEN** 标题与描述来自 i18n 消息（如 games.city.title、games.city.description）
- **AND** 随当前语言切换而切换

#### Scenario: 设置与游戏页文案

- **WHEN** 用户进入设置页或任意游戏页
- **THEN** 页面内按钮、标签、提示、统计等用户可见文案均通过 i18n 解析
- **AND** 命令式调用（如通知、弹窗）中的 message/title 使用 i18n 得到的字符串
