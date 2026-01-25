# Change: 添加在线游戏平台

## Why
创建一个现代化的在线游戏平台，提供多种小游戏供用户娱乐。平台采用 Portfolio 风格设计，使用 Vue3 + Vite + TypeScript + Tailwind CSS 技术栈，支持多游戏路由管理，并可以部署到 GitHub Pages 供用户访问。

## What Changes
- 创建 Vue3 + Vite + TypeScript + Tailwind CSS 项目基础架构
- 实现 Portfolio 风格的平台首页和导航系统
- 实现多游戏路由管理（Vue Router）
- 实现城市猜测游戏（City Guess Game）
  - 随机生成国内城市
  - 5次猜测机会
  - 显示距离和方位提示
  - 每次猜测后显示城市特点
- 实现王者荣耀人物猜测游戏（Hero Guess Game）
  - 随机生成王者荣耀人物
  - 5次猜测机会
  - 显示职业、年代、国籍、人类属性提示
  - 使用颜色编码显示匹配属性
- 集成城市地理位置 API（用于计算距离和方位）
- 配置 GitHub Pages 部署

## Impact
- Affected specs: 
  - `platform-core` - 平台核心功能（路由、布局、导航）
  - `city-guess-game` - 城市猜测游戏
  - `hero-guess-game` - 王者荣耀人物猜测游戏
  - `deployment` - 部署配置
- Affected code: 
  - 新建项目，无现有代码影响
  - 需要创建完整的项目结构和所有核心文件
