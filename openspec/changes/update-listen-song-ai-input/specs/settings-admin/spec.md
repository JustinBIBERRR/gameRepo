## MODIFIED Requirements
### Requirement: 数据 Schema 定义
系统 SHALL 为每种游戏数据定义 Schema，描述数据结构和验证规则。

#### Scenario: 城市数据 Schema
- **WHEN** 系统定义城市数据 Schema
- **THEN** 包含字段：name（必填）、aliases（数组）、latitude（必填）、longitude（必填）、features（数组）
- **AND** 主键为 name 字段
- **AND** 每个字段有对应的类型和验证规则

#### Scenario: 英雄数据 Schema
- **WHEN** 系统定义英雄数据 Schema
- **THEN** 包含字段：name（必填）、role、era、nationality、human、gender
- **AND** 主键为 name 字段
- **AND** role、era、nationality、human、gender 为选择类型字段

#### Scenario: 电影数据 Schema
- **WHEN** 系统定义电影数据 Schema
- **THEN** 包含字段：id、name（必填）、nameVariants（数组）、hint、duration
- **AND** 主键为 id 字段
- **AND** 每个字段有对应的类型和验证规则

#### Scenario: 听歌识曲数据 Schema
- **WHEN** 系统定义听歌识曲数据 Schema
- **THEN** 包含字段：id、lyrics（必填）、answer（必填）、artist（必填）、播放用音频（必填，MP3）、hints（可选）
- **AND** 主键为 id 字段，默认为自增或 UUID
- **AND** `lyrics`、`answer` 为字符串类型并限制长度不超过 200 字符；`artist` 为字符串类型并限制长度不超过 100 字符
- **AND** 播放用音频使用文件选择器并存储为 IndexedDB Blob 引用，单个文件大小不超过 5MB，格式为 MP3
- **AND** `hints` 为字符串数组，最多允许 5 条提示
- **AND** 不包含 `lang`、`rate`、`pitch` 及「揭晓用音频」字段
