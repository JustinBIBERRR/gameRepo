# 🎮 新游戏开发计划

本文档记录了待开发的新游戏方案，基于年会场景和程序员用户群体的需求设计。

## 📋 需求背景

- **目标用户**：程序员，内向，擅长脑力、动手类游戏
- **场景**：年会活动
- **核心要求**：
  - 生活类主题，大家都能理解参与
  - 保持猜测类玩法，但增加差异化元素（避免疲劳）
  - 逐步提示 + 有限次数猜测机制
  - 趣味性优先
  - 创建精品游戏（1个）

---

## 🎯 最终方案：看图猜测物品（整合版）⭐

**游戏名称**：看图猜测物品 / Visual Guess

**核心概念**：整合三个方案为一个统一的看图猜测游戏，支持多种物品类型（生活用品、品牌logo、国旗、专辑封面等），通过逐步揭示图片信息来猜测物品。

### ✨ 整合方案核心特点

1. **统一游戏机制**：
   - 将原本的三个独立游戏（看图猜物品、听声辨物、品牌猜测）整合为一个
   - 统一使用图片提示机制，简化实现复杂度
   - 保持一致的交互体验

2. **扩展物品类型**：
   - **生活用品**（item）：键盘、鼠标、水杯等日常物品
   - **品牌logo**（brand）：苹果、Nike、星巴克等知名品牌
   - **国旗**（flag）：中国、美国、日本等国家国旗
   - **专辑封面**（album）：经典音乐专辑封面
   - **可扩展**：未来可添加更多类型（如：电影海报、游戏图标等）

3. **优化提示机制**：
   - **局部细节** → **轮廓剪影** → **30%区域（模糊）** → **50%区域（模糊）** → **70%区域（模糊）**
   - 逐步揭示更多信息，难度递增
   - 使用模糊处理增加挑战性

4. **分类提示功能**：
   - 游戏开始时自动显示物品分类（如："这是一个品牌logo"）
   - 帮助玩家缩小猜测范围
   - 可配置是否显示分类提示

5. **智能图片生成**：
   - 系统可自动生成部分区域图片（30%、50%、70%）
   - 减少数据准备工作量
   - 支持手动上传自定义图片

#### 📖 详细玩法介绍

**游戏流程**：
1. 游戏开始：系统随机选择一个物品作为目标（可能是生活用品、品牌logo、国旗、专辑封面等）
2. **初始分类提示**：显示物品的分类提示（如："生活用品"、"品牌logo"、"国旗"、"专辑封面"）
3. 逐步猜测：
   - 玩家每次可以查看一个提示（点击"查看提示"按钮）
   - 每次查看提示后，显示对应阶段的图片
   - 玩家可以输入猜测的物品名称
   - 系统验证输入是否在物品列表中
   - 如果猜中，游戏胜利；如果未猜中，继续下一轮
4. 游戏结束：
   - 成功：显示完整物品图片和成功动画
   - 失败：显示完整物品图片和正确答案

**提示机制**（默认5次机会，可配置）：
1. **第1次提示**：显示物品的局部细节图片
   - 图片尺寸：原始图片的 10-15% 区域
   - 显示方式：高亮显示局部区域，其他区域模糊或遮挡
   - 示例：
     - 生活用品：键盘的一个按键、鼠标的滚轮、水杯的把手
     - 品牌logo：苹果logo的叶子部分、Nike勾的一小段
     - 国旗：国旗的一个角、一个星星、一个条纹
     - 专辑封面：专辑封面的一角、一个字母、一个图案
2. **第2次提示**：显示物品的轮廓/剪影
   - 将物品转换为黑色剪影，保留整体形状
   - 不显示任何细节和颜色信息
   - 适用于所有物品类型
3. **第3次提示**：显示物品的30%区域（模糊处理）
   - 随机选择物品的30%区域（上半部分、下半部分、左半部分或右半部分）
   - 使用模糊效果处理边界，增加难度
   - 模糊强度：中等（可配置）
4. **第4次提示**：显示物品的50%区域（模糊处理）
   - 显示物品的一半区域
   - 使用模糊效果处理边界
   - 模糊强度：较低（可配置）
5. **第5次提示**：显示物品的70%区域（模糊处理）
   - 显示物品的大部分区域
   - 使用轻微模糊效果处理边界
   - 模糊强度：轻微（可配置）
6. **第6次提示**（可选）：显示完整物品（最后一次机会）
   - 如果仍未猜中，游戏结束并显示答案

**输入方式**：
- 提供下拉联想输入框（autocomplete）
- 支持拼音输入和模糊匹配
- 输入框显示候选物品列表
- 支持键盘快捷键（Enter提交，Esc取消）

#### 🎨 游戏体验增强点

1. **图片加载动画**：
   - 提示图片显示时使用淡入动画
   - 局部细节提示时使用放大镜效果
   - 完整图片显示时使用缩放动画

2. **视觉反馈**：
   - 猜测正确：显示绿色对勾和庆祝动画
   - 猜测错误：显示红色叉号，图片轻微抖动
   - 接近答案：显示黄色提示（如果物品名称相似）

3. **进度可视化**：
   - 显示当前是第几次提示（如：提示 2/5）
   - 进度条显示已使用的提示次数
   - 已查看的提示可以重新查看（不消耗新机会）

4. **成就系统**：
   - 一次猜中：使用1次提示就猜中
   - 完美推理：使用2-3次提示猜中
   - 坚持不懈：使用所有提示后猜中
   - 物品收集：猜中不同类别的物品

5. **难度提示**：
   - 根据物品的常见程度显示难度等级
   - 常见物品（如：手机、键盘、苹果logo）难度较低
   - 特殊物品（如：专业工具、小众品牌、冷门专辑）难度较高

6. **分类标签显示**：
   - 在游戏界面显示物品分类标签（如："品牌logo"、"国旗"）
   - 帮助玩家缩小猜测范围
   - 根据分类显示不同的图标和颜色

#### ⚠️ 玩法操作的限制

1. **提示次数限制**：
   - 默认最多5次提示机会（可在设置中配置，范围：3-10次）
   - 每次查看提示消耗一次机会
   - 已查看的提示可以重复查看，不消耗新机会
   - 达到最大次数后，自动显示完整图片并结束游戏

2. **输入限制**：
   - 只能输入物品列表中的有效物品名称
   - 输入框支持自动补全，但必须选择列表中的项
   - 无效输入不会消耗猜测机会，但会显示错误提示
   - 每次提示后只能提交一次猜测（防止盲目试错）

3. **时间限制**（可选）：
   - 可配置倒计时功能（默认关闭）
   - 倒计时时长：1-60分钟（默认5分钟）
   - 时间到后自动结束游戏并显示答案

4. **图片显示限制**：
   - 每次只能查看一个提示阶段的图片
   - 不能同时查看多个提示
   - 图片加载失败时显示占位图和错误提示

5. **游戏状态限制**：
   - 游戏进行中不能重新开始（需要确认对话框）
   - 刷新页面后可以恢复游戏进度（使用sessionStorage）
   - 同一时间只能进行一个游戏实例

#### ⚙️ 游戏管理者可以配置的数据项

**游戏参数配置**（在 `/settings/item` 页面）：
1. **倒计时设置**：
   - `enableTimer`: 是否启用倒计时（布尔值，默认：false）
   - `timerDuration`: 倒计时时长，单位：分钟（数字，范围：1-60，默认：5）

2. **尝试次数设置**：
   - `maxAttempts`: 最大提示次数（数字，范围：3-10，默认：5）

3. **初始提示设置**：
   - `showInitialHint`: 是否显示初始提示卡片（布尔值，默认：true）
   - `initialHintText`: 初始提示文本（字符串，可自定义）

4. **图片显示设置**：
   - `imageBlurIntensity`: 模糊强度（数字，范围：0-20，默认：5）
   - `showImageAnimation`: 是否显示图片加载动画（布尔值，默认：true）

5. **难度设置**：
   - `difficultyLevel`: 难度等级（选择：简单/中等/困难/全部，默认：全部）
   - `simple`: 只显示常见物品
   - `medium`: 显示常见和中等物品
   - `hard`: 显示所有物品

6. **物品类型设置**：
   - `enabledTypes`: 启用的物品类型（数组，默认：全部）
   - 可选值：`['item', 'brand', 'flag', 'album']`
   - `item`: 生活用品
   - `brand`: 品牌logo
   - `flag`: 国旗
   - `album`: 专辑封面

**数据管理配置**（物品数据 Schema）：
```typescript
interface ItemData {
  name: string              // 物品名称（必填，主键）
  aliases?: string[]        // 别名数组（可选，如：["手机", "智能手机", "移动电话"]）
  type: 'item' | 'brand' | 'flag' | 'album' | 'other'  // 物品类型（必填）
  category: string          // 物品类别（必填，如："电子产品", "办公用品", "生活用品"）
  difficulty: 'simple' | 'medium' | 'hard'  // 难度等级（必填）
  images: {
    full: string            // 完整图片URL（必填）
    detail?: string          // 局部细节图片URL（可选，系统可自动生成）
    silhouette?: string      // 轮廓/剪影图片URL（可选，系统可自动生成）
    partial30?: string       // 30%区域图片URL（可选，系统可自动生成）
    partial50?: string       // 50%区域图片URL（可选，系统可自动生成）
    partial70?: string       // 70%区域图片URL（可选，系统可自动生成）
  }
  hints?: string[]          // 文字提示数组（可选，如：["电子产品", "可以打电话", "有屏幕"]）
  description?: string       // 物品描述（可选）
  // 扩展字段（根据类型可选）
  country?: string          // 国家（国旗类型必填）
  artist?: string           // 艺术家（专辑封面类型可选）
  year?: number             // 年份（专辑封面类型可选）
}
```

**数据字段说明**：
- `name`: 物品的标准名称，用于匹配用户输入
- `aliases`: 物品的别名，支持多种称呼方式
- `type`: 物品类型，用于分类提示和筛选（item=生活用品, brand=品牌logo, flag=国旗, album=专辑封面）
- `category`: 物品类别，用于统计和筛选（如："电子产品", "办公用品", "科技品牌", "亚洲国家"等）
- `difficulty`: 难度等级，控制游戏难度
- `images`: 图片资源对象，包含不同提示阶段的图片（系统可自动生成部分图片）
- `hints`: 文字提示，可在最后阶段显示
- `description`: 物品描述，用于游戏结束时的说明
- `country`: 国家名称（国旗类型必填）
- `artist`: 艺术家名称（专辑封面类型可选）
- `year`: 年份（专辑封面类型可选）

#### 📦 基础数据 Demo

**数据格式说明**：
- 所有物品使用统一的数据结构
- `type` 字段区分物品类型：`item`（生活用品）、`brand`（品牌logo）、`flag`（国旗）、`album`（专辑封面）
- 图片资源支持自动生成部分区域图片（30%、50%、70%）

**生活用品示例**（type: 'item'）：
```json
[
  {
    "name": "键盘",
    "aliases": ["键盘", "电脑键盘", "机械键盘"],
    "type": "item",
    "category": "电子产品",
    "difficulty": "simple",
    "images": {
      "full": "/images/items/keyboard-full.jpg",
      "detail": "/images/items/keyboard-detail.jpg",
      "silhouette": "/images/items/keyboard-silhouette.jpg"
    },
    "hints": ["电子产品", "输入设备", "有按键"],
    "description": "用于输入文字和命令的计算机外设"
  },
  {
    "name": "鼠标",
    "aliases": ["鼠标", "电脑鼠标", "无线鼠标"],
    "type": "item",
    "category": "电子产品",
    "difficulty": "simple",
    "images": {
      "full": "/images/items/mouse-full.jpg",
      "detail": "/images/items/mouse-detail.jpg",
      "silhouette": "/images/items/mouse-silhouette.jpg"
    },
    "hints": ["电子产品", "输入设备", "有滚轮"],
    "description": "用于控制光标位置的计算机外设"
  },
  {
    "name": "水杯",
    "aliases": ["水杯", "杯子", "茶杯"],
    "type": "item",
    "category": "生活用品",
    "difficulty": "simple",
    "images": {
      "full": "/images/items/cup-full.jpg",
      "detail": "/images/items/cup-detail.jpg",
      "silhouette": "/images/items/cup-silhouette.jpg"
    },
    "hints": ["生活用品", "容器", "可以装水"],
    "description": "用于盛装液体的日常用品"
  }
]
```

**中等难度物品**（形状相似，需要仔细观察）：
```json
[
  {
    "name": "订书机",
    "aliases": ["订书机", "打书机"],
    "type": "item",
    "category": "办公用品",
    "difficulty": "medium",
    "images": {
      "full": "/images/items/stapler-full.jpg",
      "detail": "/images/items/stapler-detail.jpg",
      "silhouette": "/images/items/stapler-silhouette.jpg",
    },
    "hints": ["办公用品", "装订工具", "有金属部件"],
    "description": "用于装订纸张的办公工具"
  },
  {
    "name": "回形针",
    "aliases": ["回形针", "曲别针", "万字夹"],
    "type": "item",
    "category": "办公用品",
    "difficulty": "medium",
    "images": {
      "full": "/images/items/paperclip-full.jpg",
      "detail": "/images/items/paperclip-detail.jpg",
      "silhouette": "/images/items/paperclip-silhouette.jpg",
    },
    "hints": ["办公用品", "金属制品", "很小"],
    "description": "用于固定纸张的小型金属工具"
  },
  {
    "name": "便利贴",
    "aliases": ["便利贴", "便签纸", "贴纸"],
    "type": "item",
    "category": "办公用品",
    "difficulty": "medium",
    "images": {
      "full": "/images/items/sticky-note-full.jpg",
      "detail": "/images/items/sticky-note-detail.jpg",
      "silhouette": "/images/items/sticky-note-silhouette.jpg",
    },
    "hints": ["办公用品", "纸张", "有粘性"],
    "description": "带有粘性的便签纸，用于记录和提醒"
  },
  {
    "name": "卷尺",
    "aliases": ["卷尺", "软尺", "测量尺"],
    "type": "item",
    "category": "工具",
    "difficulty": "medium",
    "images": {
      "full": "/images/items/tape-measure-full.jpg",
      "detail": "/images/items/tape-measure-detail.jpg",
      "silhouette": "/images/items/tape-measure-silhouette.jpg",
    },
    "hints": ["工具", "测量工具", "可以卷起来"],
    "description": "用于测量长度的工具"
  },
  {
    "name": "开瓶器",
    "aliases": ["开瓶器", "起子", "瓶起子"],
    "type": "item",
    "category": "生活用品",
    "difficulty": "medium",
    "images": {
      "full": "/images/items/bottle-opener-full.jpg",
      "detail": "/images/items/bottle-opener-detail.jpg",
      "silhouette": "/images/items/bottle-opener-silhouette.jpg",
    },
    "hints": ["生活用品", "工具", "金属制品"],
    "description": "用于开启瓶盖的工具"
  }
]
```

**品牌Logo示例**（type: 'brand'）：
```json
[
  {
    "name": "苹果",
    "aliases": ["Apple", "苹果公司", "iPhone制造商"],
    "type": "brand",
    "category": "科技品牌",
    "difficulty": "simple",
    "images": {
      "full": "/images/brands/apple-logo-full.jpg",
      "detail": "/images/brands/apple-logo-detail.jpg",
      "silhouette": "/images/brands/apple-logo-silhouette.jpg"
    },
    "hints": ["科技公司", "手机品牌", "有苹果标志"],
    "description": "全球知名的科技公司，以iPhone、iPad等产品闻名"
  },
  {
    "name": "Nike",
    "aliases": ["耐克", "Nike", "勾勾"],
    "type": "brand",
    "category": "运动品牌",
    "difficulty": "simple",
    "images": {
      "full": "/images/brands/nike-logo-full.jpg",
      "detail": "/images/brands/nike-logo-detail.jpg",
      "silhouette": "/images/brands/nike-logo-silhouette.jpg"
    },
    "hints": ["运动品牌", "有勾形标志", "运动鞋"],
    "description": "全球知名的运动品牌"
  },
  {
    "name": "星巴克",
    "aliases": ["Starbucks", "星爸爸"],
    "type": "brand",
    "category": "餐饮品牌",
    "difficulty": "medium",
    "images": {
      "full": "/images/brands/starbucks-logo-full.jpg",
      "detail": "/images/brands/starbucks-logo-detail.jpg",
      "silhouette": "/images/brands/starbucks-logo-silhouette.jpg"
    },
    "hints": ["咖啡品牌", "有美人鱼标志", "绿色标志"],
    "description": "全球知名的连锁咖啡品牌"
  }
]
```

**国旗示例**（type: 'flag'）：
```json
[
  {
    "name": "中国",
    "aliases": ["中国", "中华人民共和国", "China"],
    "type": "flag",
    "category": "亚洲国家",
    "difficulty": "simple",
    "country": "中国",
    "images": {
      "full": "/images/flags/china-full.jpg",
      "detail": "/images/flags/china-detail.jpg",
      "silhouette": "/images/flags/china-silhouette.jpg"
    },
    "hints": ["亚洲国家", "红色", "有星星"],
    "description": "中华人民共和国的国旗"
  },
  {
    "name": "美国",
    "aliases": ["美国", "美利坚合众国", "USA", "United States"],
    "type": "flag",
    "category": "美洲国家",
    "difficulty": "simple",
    "country": "美国",
    "images": {
      "full": "/images/flags/usa-full.jpg",
      "detail": "/images/flags/usa-detail.jpg",
      "silhouette": "/images/flags/usa-silhouette.jpg"
    },
    "hints": ["美洲国家", "有星星和条纹", "红白蓝"],
    "description": "美利坚合众国的国旗"
  },
  {
    "name": "日本",
    "aliases": ["日本", "Japan"],
    "type": "flag",
    "category": "亚洲国家",
    "difficulty": "medium",
    "country": "日本",
    "images": {
      "full": "/images/flags/japan-full.jpg",
      "detail": "/images/flags/japan-detail.jpg",
      "silhouette": "/images/flags/japan-silhouette.jpg"
    },
    "hints": ["亚洲国家", "白色背景", "红色圆形"],
    "description": "日本的国旗"
  }
]
```

**专辑封面示例**（type: 'album'）：
```json
[
  {
    "name": "周杰伦 - 范特西",
    "aliases": ["范特西", "Fantasy", "周杰伦范特西"],
    "type": "album",
    "category": "华语流行",
    "difficulty": "medium",
    "artist": "周杰伦",
    "year": 2001,
    "images": {
      "full": "/images/albums/jay-fantasy-full.jpg",
      "detail": "/images/albums/jay-fantasy-detail.jpg",
      "silhouette": "/images/albums/jay-fantasy-silhouette.jpg"
    },
    "hints": ["华语流行", "周杰伦", "2001年"],
    "description": "周杰伦的第二张专辑"
  },
  {
    "name": "The Beatles - Abbey Road",
    "aliases": ["Abbey Road", "披头士修道院路", "甲壳虫乐队"],
    "type": "album",
    "category": "摇滚",
    "difficulty": "hard",
    "artist": "The Beatles",
    "year": 1969,
    "images": {
      "full": "/images/albums/beatles-abbey-road-full.jpg",
      "detail": "/images/albums/beatles-abbey-road-detail.jpg",
      "silhouette": "/images/albums/beatles-abbey-road-silhouette.jpg"
    },
    "hints": ["摇滚", "The Beatles", "1969年", "有斑马线"],
    "description": "披头士乐队的经典专辑"
  }
]
```

**困难难度物品**（形状不常见或容易混淆）：
```json
[
  {
    "name": "U盘",
    "aliases": ["U盘", "优盘", "USB闪存盘", "闪存盘"],
    "type": "item",
    "category": "电子产品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/usb-drive-full.jpg",
      "detail": "/images/items/usb-drive-detail.jpg",
      "silhouette": "/images/items/usb-drive-silhouette.jpg"
    },
    "hints": ["电子产品", "存储设备", "很小", "有USB接口"],
    "description": "用于存储数据的小型电子设备"
  },
  {
    "name": "燕尾夹",
    "aliases": ["燕尾夹", "长尾夹", "文件夹"],
    "category": "办公用品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/binder-clip-full.jpg",
      "detail": "/images/items/binder-clip-detail.jpg",
      "silhouette": "/images/items/binder-clip-silhouette.jpg",
    },
    "hints": ["办公用品", "夹子", "金属制品", "有弹簧"],
    "description": "用于固定纸张的金属夹子"
  },
  {
    "name": "打火机",
    "aliases": ["打火机", "火机", "点火器"],
    "category": "生活用品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/lighter-full.jpg",
      "detail": "/images/items/lighter-detail.jpg",
      "silhouette": "/images/items/lighter-silhouette.jpg",
    },
    "hints": ["生活用品", "点火工具", "很小", "有按钮"],
    "description": "用于点火的便携式工具"
  },
  {
    "name": "指甲剪",
    "aliases": ["指甲剪", "指甲刀", "指甲钳"],
    "category": "生活用品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/nail-clipper-full.jpg",
      "detail": "/images/items/nail-clipper-detail.jpg",
      "silhouette": "/images/items/nail-clipper-silhouette.jpg",
    },
    "hints": ["生活用品", "个人护理", "很小", "有弧形刀片"],
    "description": "用于修剪指甲的小型工具"
  },
  {
    "name": "橡皮筋",
    "aliases": ["橡皮筋", "皮筋", "弹性圈"],
    "category": "生活用品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/rubber-band-full.jpg",
      "detail": "/images/items/rubber-band-detail.jpg",
      "silhouette": "/images/items/rubber-band-silhouette.jpg",
    },
    "hints": ["生活用品", "弹性材料", "圆形", "很小"],
    "description": "用于捆绑物品的弹性圈"
  },
  {
    "name": "图钉",
    "aliases": ["图钉", "大头针", "按钉"],
    "category": "办公用品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/pushpin-full.jpg",
      "detail": "/images/items/pushpin-detail.jpg",
      "silhouette": "/images/items/pushpin-silhouette.jpg",
    },
    "hints": ["办公用品", "固定工具", "很小", "有尖头"],
    "description": "用于固定纸张的小型工具"
  },
  {
    "name": "电池",
    "aliases": ["电池", "干电池", "AA电池"],
    "category": "电子产品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/battery-full.jpg",
      "detail": "/images/items/battery-detail.jpg",
      "silhouette": "/images/items/battery-silhouette.jpg",
    },
    "hints": ["电子产品", "能源", "圆柱形", "有正负极"],
    "description": "用于提供电能的设备"
  },
  {
    "name": "橡皮擦",
    "aliases": ["橡皮擦", "橡皮", "擦子"],
    "category": "办公用品",
    "difficulty": "hard",
    "images": {
      "full": "/images/items/eraser-full.jpg",
      "detail": "/images/items/eraser-detail.jpg",
      "silhouette": "/images/items/eraser-silhouette.jpg",
    },
    "hints": ["办公用品", "文具", "可以擦除", "有颜色"],
    "description": "用于擦除铅笔字迹的工具"
  }
]
```

#### 🎯 增加难度的机制建议

**问题分析**：
- 键盘、鼠标、水杯等物品因为形状特征太明显，即使只看局部细节或轮廓也很容易猜出
- 需要增加更多难猜的物品，或通过机制调整增加难度

**解决方案**：

1. **增加难猜物品比例**：
   - 建议物品库中：简单20%、中等40%、困难40%
   - 优先选择形状相似、功能相近的物品
   - 选择不常见或局部特征不明显的物品

2. **调整提示机制**（针对简单物品）：
   - **局部细节**：显示更不明显的部位（如：键盘的底部、鼠标的侧边、水杯的底部）
   - **轮廓剪影**：使用更模糊的轮廓或从特殊角度拍摄（如：俯视、仰视）
   - **部分区域**：故意遮挡关键识别部位（如：键盘的按键区域、鼠标的滚轮）
   - **增加干扰**：显示相似物品的局部，增加混淆度

3. **增加相似物品干扰**：
   - 在候选列表中包含形状相似的物品
   - 例如：鼠标 vs 鼠标垫、键盘 vs 键盘托、水杯 vs 马克杯 vs 保温杯

4. **使用特殊角度**：
   - 从非标准角度拍摄物品（如：俯视、仰视、侧视）
   - 增加识别难度

5. **增加物品类别**：
   - 添加更多专业工具、小众物品
   - 例如：螺丝刀、扳手、钳子、镊子、量角器、圆规等

6. **动态难度调整**：
   - 根据玩家表现动态调整提示难度
   - 如果玩家连续猜中，自动切换到更难的提示方式

**数据准备说明**：
- 图片资源建议尺寸：800x600 或 1024x768
- 图片格式：JPG 或 PNG
- 局部细节图片：建议裁剪物品的关键识别部位
- 轮廓图片：可以使用图像处理工具生成黑色剪影
- 部分区域图片：可以使用 CSS 或图像处理工具实现

#### 🔧 难度优化详细方案

**问题**：键盘、鼠标、水杯等物品因为形状特征太明显，即使只看局部也很容易猜出。

**解决方案**：

**方案1：物品库优化**（推荐）
- **增加难猜物品**：
  - 选择形状相似、功能相近的物品（如：各种夹子、各种笔、各种工具）
  - 选择不常见或局部特征不明显的物品（如：U盘、图钉、橡皮筋）
  - 选择小型物品（如：回形针、燕尾夹、打火机），局部细节更难识别
- **物品库比例建议**：
  - 简单难度：20%（保留一些经典物品，但通过机制增加难度）
  - 中等难度：40%（形状相似、需要仔细观察）
  - 困难难度：40%（不常见、小型、局部特征不明显）

**方案2：提示机制优化**
- **局部细节优化**：
  - 简单物品：显示不明显的部位（键盘底部、鼠标侧边、水杯底部）
  - 中等物品：显示中等明显的部位
  - 困难物品：显示关键部位（但物品本身难识别）
- **轮廓剪影优化**：
  - 简单物品：使用更模糊的轮廓、从特殊角度（俯视/仰视）
  - 中等物品：标准轮廓
  - 困难物品：标准轮廓（但物品本身难识别）
- **部分区域优化**：
  - 简单物品：故意遮挡关键识别部位（键盘按键、鼠标滚轮、水杯把手）
  - 中等物品：遮挡部分关键部位
  - 困难物品：正常显示（但物品本身难识别）

**方案3：增加相似物品干扰**
- 在候选列表中包含形状相似的物品，增加混淆度：
  - 鼠标 vs 鼠标垫 vs 鼠标托
  - 键盘 vs 键盘托 vs 键盘膜
  - 水杯 vs 马克杯 vs 保温杯 vs 玻璃杯
  - 各种夹子：回形针 vs 燕尾夹 vs 长尾夹
  - 各种笔：圆珠笔 vs 签字笔 vs 铅笔

**方案4：特殊角度拍摄**
- 从非标准角度拍摄物品：
  - 俯视角度：从上往下看，改变物品的识别特征
  - 仰视角度：从下往上看，突出底部特征
  - 侧视角度：从侧面看，改变轮廓形状
  - 特写角度：近距离拍摄，突出细节但失去整体感

**方案5：动态难度调整**（高级功能）
- 根据玩家表现动态调整：
  - 如果玩家连续3次在2次提示内猜中：自动切换到更难的提示方式
  - 如果玩家连续失败：适当降低难度
  - 记录玩家对不同难度物品的表现，个性化调整

**方案6：增加物品类别**
- 添加更多专业工具和小众物品：
  - **工具类**：螺丝刀、扳手、钳子、镊子、量角器、圆规、尺子
  - **小型物品**：图钉、回形针、橡皮筋、电池、U盘、SD卡
  - **办公用品**：订书机、打孔器、计算器、印章、印泥
  - **生活用品**：开瓶器、打火机、指甲剪、梳子、镜子
  - **电子产品配件**：充电器、数据线、转接头、读卡器

**实施建议**：
1. **优先实施**：方案1（物品库优化）+ 方案2（提示机制优化）
2. **后续优化**：方案3（相似物品干扰）+ 方案4（特殊角度）
3. **高级功能**：方案5（动态难度调整）

**优势**：
- ✅ 视觉化强，符合"动手"偏好
- ✅ 趣味性高，图片提示直观
- ✅ 技术实现可复用现有架构
- ✅ 程序员群体熟悉日常物品

**实现复杂度**：中等
- 需要图片资源准备
- 需要图片处理和展示组件
- 可复用现有的游戏框架

**优先级**：高

---

### 方案 B：听声辨物

**游戏名称**：听声辨物 / Sound Guess

#### 📖 详细玩法介绍

**游戏流程**：
1. 游戏开始：系统随机选择一个日常物品作为目标
2. 初始提示：显示一个醒目的提示卡片，告知玩家游戏规则
3. 逐步猜测：
   - 玩家每次可以播放一个声音提示（点击"播放声音"按钮）
   - 每次播放对应时长的声音片段
   - 玩家可以多次播放同一提示（有播放次数限制）
   - 玩家可以输入猜测的物品名称
   - 系统验证输入是否在物品列表中
   - 如果猜中，游戏胜利；如果未猜中，继续下一轮
4. 游戏结束：
   - 成功：播放完整声音并显示成功动画
   - 失败：播放完整声音并显示正确答案

**提示机制**（默认5次机会，可配置）：
1. **第1次提示**：播放0.5秒声音片段
   - 从声音开头截取0.5秒
   - 可能只包含声音的开始部分，信息量最少
   - 播放次数限制：每个提示最多播放3次（可配置）
2. **第2次提示**：播放1秒声音片段
   - 从声音开头截取1秒
   - 包含更多声音特征
   - 播放次数限制：每个提示最多播放3次
3. **第3次提示**：播放2秒声音片段
   - 从声音开头截取2秒
   - 包含声音的主要特征
   - 播放次数限制：每个提示最多播放3次
4. **第4次提示**：播放完整声音
   - 播放完整的声音文件（3-5秒）
   - 包含所有声音信息
   - 播放次数限制：每个提示最多播放5次
5. **第5次提示**：显示文字提示（最后一次机会）
   - 显示物品类别（如：厨房用品、电子设备、办公用品）
   - 显示物品特点（如：会发出"叮"的声音、有按键声）
   - 如果仍未猜中，游戏结束并显示答案

**输入方式**：
- 提供下拉联想输入框（autocomplete）
- 支持拼音输入和模糊匹配
- 输入框显示候选物品列表
- 支持键盘快捷键（Enter提交，Esc取消）

**音频播放控制**：
- 播放按钮：点击播放/暂停
- 进度条：显示播放进度
- 音量控制：可调节音量（0-100%）
- 重播按钮：重新播放当前提示
- 播放次数显示：显示当前提示已播放次数/最大次数

#### 🎨 游戏体验增强点

1. **音频可视化**：
   - 显示音频波形图（可选）
   - 播放时显示动态波形动画
   - 不同频率的声音显示不同颜色

2. **视觉反馈**：
   - 猜测正确：显示绿色对勾和庆祝动画，播放成功音效
   - 猜测错误：显示红色叉号，播放错误音效
   - 接近答案：显示黄色提示（如果物品名称相似）

3. **进度可视化**：
   - 显示当前是第几次提示（如：提示 2/5）
   - 进度条显示已使用的提示次数
   - 已播放的提示可以重新播放（有次数限制）

4. **成就系统**：
   - 一次猜中：使用1次提示就猜中
   - 完美推理：使用2-3次提示猜中
   - 坚持不懈：使用所有提示后猜中
   - 声音大师：猜中不同类别的声音

5. **难度提示**：
   - 根据声音的常见程度显示难度等级
   - 常见声音（如：键盘敲击、门铃）难度较低
   - 特殊声音（如：专业设备）难度较高

6. **声音分类标签**：
   - 在游戏界面显示声音分类（如：电子设备、生活用品）
   - 帮助玩家缩小猜测范围

#### ⚠️ 玩法操作的限制

1. **提示次数限制**：
   - 默认最多5次提示机会（可在设置中配置，范围：3-10次）
   - 每次播放新提示消耗一次机会
   - 已播放的提示可以重复播放，但有次数限制（不消耗新机会）
   - 达到最大次数后，自动显示文字提示并结束游戏

2. **播放次数限制**：
   - 每个提示阶段的播放次数有限制（可在设置中配置）
   - 第1-3次提示：每个提示最多播放3次（默认）
   - 第4次提示（完整声音）：最多播放5次（默认）
   - 达到播放次数上限后，按钮禁用，需要进入下一提示阶段

3. **输入限制**：
   - 只能输入物品列表中的有效物品名称
   - 输入框支持自动补全，但必须选择列表中的项
   - 无效输入不会消耗猜测机会，但会显示错误提示
   - 每次提示后只能提交一次猜测（防止盲目试错）

4. **时间限制**（可选）：
   - 可配置倒计时功能（默认关闭）
   - 倒计时时长：1-60分钟（默认5分钟）
   - 时间到后自动结束游戏并显示答案

5. **音频播放限制**：
   - 同一时间只能播放一个音频
   - 播放新音频时自动停止当前播放
   - 音频加载失败时显示错误提示
   - 浏览器不支持音频播放时显示提示

6. **游戏状态限制**：
   - 游戏进行中不能重新开始（需要确认对话框）
   - 刷新页面后可以恢复游戏进度（使用sessionStorage）
   - 同一时间只能进行一个游戏实例

#### ⚙️ 游戏管理者可以配置的数据项

**游戏参数配置**（在 `/settings/sound` 页面）：
1. **倒计时设置**：
   - `enableTimer`: 是否启用倒计时（布尔值，默认：false）
   - `timerDuration`: 倒计时时长，单位：分钟（数字，范围：1-60，默认：5）

2. **尝试次数设置**：
   - `maxAttempts`: 最大提示次数（数字，范围：3-10，默认：5）

3. **初始提示设置**：
   - `showInitialHint`: 是否显示初始提示卡片（布尔值，默认：true）
   - `initialHintText`: 初始提示文本（字符串，可自定义）

4. **播放次数设置**：
   - `maxPlaybackPerSegment`: 每个提示片段最多播放次数（数字，范围：1-10，默认：3）
   - `maxPlaybackFullSound`: 完整声音最多播放次数（数字，范围：1-10，默认：5）

5. **音频设置**：
   - `defaultVolume`: 默认音量（数字，范围：0-100，默认：70）
   - `enableWaveform`: 是否显示音频波形图（布尔值，默认：false）
   - `autoPlayNext`: 是否自动播放下一提示（布尔值，默认：false）

6. **难度设置**：
   - `difficultyLevel`: 难度等级（选择：简单/中等/困难/全部，默认：全部）
   - `simple`: 只显示常见声音
   - `medium`: 显示常见和中等声音
   - `hard`: 显示所有声音

**数据管理配置**（声音数据 Schema）：
```typescript
interface SoundData {
  name: string              // 物品名称（必填，主键）
  aliases?: string[]        // 别名数组（可选，如：["键盘", "电脑键盘"]）
  category: string          // 物品类别（必填，如："电子产品", "办公用品", "生活用品"）
  difficulty: 'simple' | 'medium' | 'hard'  // 难度等级（必填）
  sound: {
    full: string            // 完整声音文件URL（必填，3-5秒）
    segment05?: string     // 0.5秒片段URL（可选，系统可自动生成）
    segment1?: string      // 1秒片段URL（可选，系统可自动生成）
    segment2?: string       // 2秒片段URL（可选，系统可自动生成）
  }
  hints?: string[]          // 文字提示数组（可选，如：["电子产品", "有按键声", "敲击声"]）
  description?: string       // 物品描述（可选）
}
```

**数据字段说明**：
- `name`: 物品的标准名称，用于匹配用户输入
- `aliases`: 物品的别名，支持多种称呼方式
- `category`: 物品分类，用于统计和筛选
- `difficulty`: 难度等级，控制游戏难度
- `sound`: 音频资源对象，包含完整声音和片段
- `hints`: 文字提示，可在最后阶段显示
- `description`: 物品描述，用于游戏结束时的说明

#### 📦 基础数据 Demo

```json
[
  {
    "name": "键盘",
    "aliases": ["键盘", "电脑键盘", "机械键盘"],
    "category": "电子产品",
    "difficulty": "simple",
    "sound": {
      "full": "/sounds/items/keyboard-full.mp3",
      "segment05": "/sounds/items/keyboard-05.mp3",
      "segment1": "/sounds/items/keyboard-1.mp3",
      "segment2": "/sounds/items/keyboard-2.mp3"
    },
    "hints": ["电子产品", "输入设备", "有按键声", "敲击声"],
    "description": "键盘敲击时发出的声音"
  },
  {
    "name": "门铃",
    "aliases": ["门铃", "门铃声音", "叮咚"],
    "category": "生活用品",
    "difficulty": "simple",
    "sound": {
      "full": "/sounds/items/doorbell-full.mp3",
      "segment05": "/sounds/items/doorbell-05.mp3",
      "segment1": "/sounds/items/doorbell-1.mp3",
      "segment2": "/sounds/items/doorbell-2.mp3"
    },
    "hints": ["生活用品", "门禁设备", "叮咚声", "提示音"],
    "description": "门铃按下时发出的提示音"
  },
  {
    "name": "水壶沸腾",
    "aliases": ["水壶", "开水", "沸腾"],
    "category": "生活用品",
    "difficulty": "medium",
    "sound": {
      "full": "/sounds/items/kettle-full.mp3",
      "segment05": "/sounds/items/kettle-05.mp3",
      "segment1": "/sounds/items/kettle-1.mp3",
      "segment2": "/sounds/items/kettle-2.mp3"
    },
    "hints": ["生活用品", "厨房用品", "沸腾声", "水声"],
    "description": "水壶中水沸腾时发出的声音"
  },
  {
    "name": "鼠标点击",
    "aliases": ["鼠标", "点击", "鼠标点击声"],
    "category": "电子产品",
    "difficulty": "simple",
    "sound": {
      "full": "/sounds/items/mouse-click-full.mp3",
      "segment05": "/sounds/items/mouse-click-05.mp3",
      "segment1": "/sounds/items/mouse-click-1.mp3",
      "segment2": "/sounds/items/mouse-click-2.mp3"
    },
    "hints": ["电子产品", "输入设备", "点击声", "咔哒声"],
    "description": "鼠标按键按下时发出的声音"
  },
  {
    "name": "打印机",
    "aliases": ["打印机", "打印", "打印声音"],
    "category": "办公用品",
    "difficulty": "medium",
    "sound": {
      "full": "/sounds/items/printer-full.mp3",
      "segment05": "/sounds/items/printer-05.mp3",
      "segment1": "/sounds/items/printer-1.mp3",
      "segment2": "/sounds/items/printer-2.mp3"
    },
    "hints": ["办公用品", "电子设备", "打印声", "机械声"],
    "description": "打印机工作时发出的声音"
  }
]
```

**数据准备说明**：
- 音频格式：MP3 或 WAV（推荐 MP3，文件更小）
- 音频质量：建议 128kbps 或以上
- 完整声音时长：3-5秒
- 声音片段：系统可自动从完整声音中截取，或手动准备
- 音频文件命名：建议使用物品名称作为文件名

**优势**：
- ✅ 多感官体验，与电影游戏形成互补
- ✅ 技术实现类似电影游戏，可复用
- ✅ 听觉挑战，增加趣味性

**实现复杂度**：中等
- 需要音频资源准备
- 需要音频播放组件（类似电影游戏）
- 可复用现有的音频播放逻辑

**优先级**：中

---

### 方案 C：局部细节猜品牌/产品

**游戏名称**：品牌猜测 / Brand Guess

#### 📖 详细玩法介绍

**游戏流程**：
1. 游戏开始：系统随机选择一个知名品牌或产品作为目标
2. 初始提示：显示一个醒目的提示卡片，告知玩家游戏规则
3. 逐步猜测：
   - 玩家每次可以查看一个提示（点击"查看提示"按钮）
   - 每次查看提示后，显示对应阶段的图片
   - 玩家可以输入猜测的品牌或产品名称
   - 系统验证输入是否在品牌列表中（支持品牌名和产品名）
   - 如果猜中，游戏胜利；如果未猜中，继续下一轮
4. 游戏结束：
   - 成功：显示完整logo/产品图片和成功动画
   - 失败：显示完整logo/产品图片和正确答案

**提示机制**（默认5次机会，可配置）：
1. **第1次提示**：显示logo的极小局部
   - 例如：苹果logo的一个小部分、Nike勾的一小段、星巴克美人鱼的一个细节
   - 图片尺寸：原始图片的 5-10% 区域
   - 显示方式：高亮显示局部区域，其他区域完全遮挡
   - 可能只显示一个字母的一部分或一个图形元素
2. **第2次提示**：显示logo的较大局部
   - 显示logo的 20-30% 区域
   - 例如：半个字母、部分图形、logo的一角
   - 使用模糊效果处理边界，增加难度
3. **第3次提示**：显示产品包装的某个角落
   - 切换到产品包装图片（如果品牌有代表性产品）
   - 显示包装的一个角落（如：左上角、右下角）
   - 可能包含部分logo、部分文字、部分图案
4. **第4次提示**：显示产品包装的50%
   - 显示包装的一半区域
   - 可能包含完整的logo或部分产品信息
   - 关键识别信息可能仍然被遮挡
5. **第5次提示**：显示完整logo或产品（最后一次机会）
   - 如果仍未猜中，游戏结束并显示答案

**输入方式**：
- 提供下拉联想输入框（autocomplete）
- 支持拼音输入和模糊匹配
- 输入框显示候选品牌/产品列表
- 支持键盘快捷键（Enter提交，Esc取消）
- 支持输入品牌名或产品名（如："苹果"或"iPhone"）

**特殊规则**：
- 如果品牌有多个产品，猜中任一产品名也算正确
- 如果品牌有多个名称（如：可口可乐/Coca-Cola），任一名称都算正确
- 支持中英文输入

#### 🎨 游戏体验增强点

1. **图片加载动画**：
   - 提示图片显示时使用淡入动画
   - 局部细节提示时使用放大镜效果
   - 完整图片显示时使用缩放动画
   - Logo显示时使用旋转进入动画

2. **视觉反馈**：
   - 猜测正确：显示绿色对勾和庆祝动画，播放品牌相关音效（可选）
   - 猜测错误：显示红色叉号，图片轻微抖动
   - 接近答案：显示黄色提示（如果品牌名称相似）

3. **进度可视化**：
   - 显示当前是第几次提示（如：提示 2/5）
   - 进度条显示已使用的提示次数
   - 已查看的提示可以重新查看（不消耗新机会）
   - 显示品牌类别标签（如：科技、饮料、运动）

4. **成就系统**：
   - 一次猜中：使用1次提示就猜中
   - 完美推理：使用2-3次提示猜中
   - 坚持不懈：使用所有提示后猜中
   - 品牌收集：猜中不同类别的品牌
   - 全球品牌：猜中不同国家的品牌

5. **难度提示**：
   - 根据品牌的知名度显示难度等级
   - 常见品牌（如：苹果、可口可乐）难度较低
   - 特殊品牌（如：小众品牌）难度较高

6. **品牌信息展示**：
   - 游戏结束时显示品牌简介（可选）
   - 显示品牌所属类别和国家
   - 显示品牌成立年份（可选）

#### ⚠️ 玩法操作的限制

1. **提示次数限制**：
   - 默认最多5次提示机会（可在设置中配置，范围：3-10次）
   - 每次查看提示消耗一次机会
   - 已查看的提示可以重复查看，不消耗新机会
   - 达到最大次数后，自动显示完整图片并结束游戏

2. **输入限制**：
   - 只能输入品牌列表中的有效品牌或产品名称
   - 输入框支持自动补全，但必须选择列表中的项
   - 无效输入不会消耗猜测机会，但会显示错误提示
   - 每次提示后只能提交一次猜测（防止盲目试错）
   - 支持品牌名和产品名，但必须精确匹配（不区分大小写）

3. **时间限制**（可选）：
   - 可配置倒计时功能（默认关闭）
   - 倒计时时长：1-60分钟（默认5分钟）
   - 时间到后自动结束游戏并显示答案

4. **图片显示限制**：
   - 每次只能查看一个提示阶段的图片
   - 不能同时查看多个提示
   - 图片加载失败时显示占位图和错误提示
   - Logo和包装图片可以切换查看（不消耗新机会）

5. **游戏状态限制**：
   - 游戏进行中不能重新开始（需要确认对话框）
   - 刷新页面后可以恢复游戏进度（使用sessionStorage）
   - 同一时间只能进行一个游戏实例

6. **品牌数据限制**：
   - 只显示已配置的品牌数据
   - 品牌必须有至少一张logo图片
   - 品牌可以有多个产品，但至少需要一个产品名

#### ⚙️ 游戏管理者可以配置的数据项

**游戏参数配置**（在 `/settings/brand` 页面）：
1. **倒计时设置**：
   - `enableTimer`: 是否启用倒计时（布尔值，默认：false）
   - `timerDuration`: 倒计时时长，单位：分钟（数字，范围：1-60，默认：5）

2. **尝试次数设置**：
   - `maxAttempts`: 最大提示次数（数字，范围：3-10，默认：5）

3. **初始提示设置**：
   - `showInitialHint`: 是否显示初始提示卡片（布尔值，默认：true）
   - `initialHintText`: 初始提示文本（字符串，可自定义）

4. **图片显示设置**：
   - `imageBlurIntensity`: 模糊强度（数字，范围：0-20，默认：5）
   - `showImageAnimation`: 是否显示图片加载动画（布尔值，默认：true）
   - `showBrandInfo`: 游戏结束时是否显示品牌信息（布尔值，默认：true）

5. **难度设置**：
   - `difficultyLevel`: 难度等级（选择：简单/中等/困难/全部，默认：全部）
   - `simple`: 只显示知名品牌
   - `medium`: 显示知名和中等品牌
   - `hard`: 显示所有品牌

6. **显示设置**：
   - `showCategoryTag`: 是否显示品牌类别标签（布尔值，默认：true）
   - `showCountryTag`: 是否显示品牌国家标签（布尔值，默认：false）

**数据管理配置**（品牌数据 Schema）：
```typescript
interface BrandData {
  name: string              // 品牌名称（必填，主键）
  aliases?: string[]        // 别名数组（可选，如：["苹果", "Apple", "iPhone制造商"]）
  products?: string[]        // 产品名称数组（可选，如：["iPhone", "iPad", "MacBook"]）
  category: string          // 品牌类别（必填，如："科技", "饮料", "运动", "时尚"）
  country?: string          // 品牌国家（可选，如："美国", "中国", "日本"）
  difficulty: 'simple' | 'medium' | 'hard'  // 难度等级（必填）
  images: {
    logo: string            // Logo完整图片URL（必填）
    logoDetail?: string      // Logo局部细节图片URL（可选）
    logoPartial?: string     // Logo部分区域图片URL（可选）
    product?: string         // 产品包装图片URL（可选）
    productCorner?: string   // 产品包装角落图片URL（可选）
    productPartial?: string  // 产品包装部分区域图片URL（可选）
  }
  hints?: string[]          // 文字提示数组（可选，如：["科技公司", "手机品牌", "有苹果标志"]）
  description?: string       // 品牌描述（可选）
  foundedYear?: number       // 成立年份（可选）
}
```

**数据字段说明**：
- `name`: 品牌的标准名称，用于匹配用户输入
- `aliases`: 品牌的别名，支持多种称呼方式（包括英文名）
- `products`: 品牌的产品列表，猜中任一产品名也算正确
- `category`: 品牌分类，用于统计和筛选
- `country`: 品牌所属国家，用于显示和统计
- `difficulty`: 难度等级，控制游戏难度
- `images`: 图片资源对象，包含logo和产品包装的不同提示阶段图片
- `hints`: 文字提示，可在最后阶段显示
- `description`: 品牌描述，用于游戏结束时的说明
- `foundedYear`: 成立年份，用于品牌信息展示

#### 📦 基础数据 Demo

```json
[
  {
    "name": "苹果",
    "aliases": ["Apple", "苹果公司", "iPhone制造商"],
    "products": ["iPhone", "iPad", "MacBook", "iMac", "Apple Watch"],
    "category": "科技",
    "country": "美国",
    "difficulty": "simple",
    "images": {
      "logo": "/images/brands/apple-logo-full.jpg",
      "logoDetail": "/images/brands/apple-logo-detail.jpg",
      "logoPartial": "/images/brands/apple-logo-partial.jpg",
      "product": "/images/brands/apple-iphone-full.jpg",
      "productCorner": "/images/brands/apple-iphone-corner.jpg",
      "productPartial": "/images/brands/apple-iphone-partial.jpg"
    },
    "hints": ["科技公司", "手机品牌", "有苹果标志", "美国公司"],
    "description": "全球知名的科技公司，以iPhone、iPad等产品闻名",
    "foundedYear": 1976
  },
  {
    "name": "可口可乐",
    "aliases": ["Coca-Cola", "可乐", "Coke"],
    "products": ["可口可乐", "雪碧", "芬达"],
    "category": "饮料",
    "country": "美国",
    "difficulty": "simple",
    "images": {
      "logo": "/images/brands/coca-cola-logo-full.jpg",
      "logoDetail": "/images/brands/coca-cola-logo-detail.jpg",
      "logoPartial": "/images/brands/coca-cola-logo-partial.jpg",
      "product": "/images/brands/coca-cola-bottle-full.jpg",
      "productCorner": "/images/brands/coca-cola-bottle-corner.jpg",
      "productPartial": "/images/brands/coca-cola-bottle-partial.jpg"
    },
    "hints": ["饮料品牌", "红色包装", "有波浪形标志", "美国品牌"],
    "description": "全球知名的碳酸饮料品牌",
    "foundedYear": 1886
  },
  {
    "name": "Nike",
    "aliases": ["耐克", "Nike", "勾勾"],
    "products": ["运动鞋", "运动服", "运动装备"],
    "category": "运动",
    "country": "美国",
    "difficulty": "simple",
    "images": {
      "logo": "/images/brands/nike-logo-full.jpg",
      "logoDetail": "/images/brands/nike-logo-detail.jpg",
      "logoPartial": "/images/brands/nike-logo-partial.jpg",
      "product": "/images/brands/nike-shoe-full.jpg",
      "productCorner": "/images/brands/nike-shoe-corner.jpg",
      "productPartial": "/images/brands/nike-shoe-partial.jpg"
    },
    "hints": ["运动品牌", "有勾形标志", "运动鞋", "美国品牌"],
    "description": "全球知名的运动品牌，以"Just Do It"口号闻名",
    "foundedYear": 1964
  },
  {
    "name": "星巴克",
    "aliases": ["Starbucks", "星爸爸"],
    "products": ["咖啡", "星冰乐", "拿铁"],
    "category": "餐饮",
    "country": "美国",
    "difficulty": "medium",
    "images": {
      "logo": "/images/brands/starbucks-logo-full.jpg",
      "logoDetail": "/images/brands/starbucks-logo-detail.jpg",
      "logoPartial": "/images/brands/starbucks-logo-partial.jpg",
      "product": "/images/brands/starbucks-cup-full.jpg",
      "productCorner": "/images/brands/starbucks-cup-corner.jpg",
      "productPartial": "/images/brands/starbucks-cup-partial.jpg"
    },
    "hints": ["咖啡品牌", "有美人鱼标志", "绿色标志", "连锁咖啡店"],
    "description": "全球知名的连锁咖啡品牌",
    "foundedYear": 1971
  },
  {
    "name": "华为",
    "aliases": ["Huawei", "华为技术"],
    "products": ["华为手机", "Mate系列", "P系列"],
    "category": "科技",
    "country": "中国",
    "difficulty": "medium",
    "images": {
      "logo": "/images/brands/huawei-logo-full.jpg",
      "logoDetail": "/images/brands/huawei-logo-detail.jpg",
      "logoPartial": "/images/brands/huawei-logo-partial.jpg",
      "product": "/images/brands/huawei-phone-full.jpg",
      "productCorner": "/images/brands/huawei-phone-corner.jpg",
      "productPartial": "/images/brands/huawei-phone-partial.jpg"
    },
    "hints": ["科技公司", "手机品牌", "中国品牌", "有花瓣标志"],
    "description": "中国知名的科技公司，以手机和通信设备闻名",
    "foundedYear": 1987
  }
]
```

**数据准备说明**：
- 图片资源建议尺寸：800x600 或 1024x768
- 图片格式：JPG 或 PNG（Logo建议PNG，支持透明背景）
- Logo局部图片：建议裁剪logo的关键识别部位（如：苹果的叶子、Nike的勾）
- 产品包装图片：建议使用代表性产品的包装
- 包装局部图片：建议裁剪包装的关键识别部位（如：品牌名、logo、特色图案）

**优势**：
- ✅ 贴近生活，程序员群体熟悉
- ✅ 有挑战性，局部细节需要观察力
- ✅ 数据准备相对简单（品牌资源易获取）

**实现复杂度**：中等
- 需要图片资源准备
- 需要图片处理和展示组件
- 可复用现有的游戏框架

**优先级**：中

---

## 📊 方案对比

| 方案 | 趣味性 | 实现难度 | 数据准备 | 差异化程度 | 推荐度 |
|------|--------|----------|----------|------------|--------|
| A. 看图猜物品 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| B. 听声辨物 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| C. 品牌猜测 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🚀 实施建议

### 推荐实施顺序

1. **优先实施：方案 A（看图猜物品）**
   - 视觉化强，趣味性最高
   - 符合程序员"动手"偏好
   - 实现难度适中

2. **后续考虑：方案 B（听声辨物）**
   - 与电影游戏形成互补
   - 多感官体验
   - 技术实现可复用

3. **备选方案：方案 C（品牌猜测）**
   - 数据准备最简单
   - 贴近生活，容易理解

### 开发注意事项

- 所有方案都需要准备多媒体资源（图片/音频）
- 建议先实现一个方案，根据用户反馈再决定是否开发其他方案
- 保持与现有游戏的一致性（UI风格、交互模式）
- 考虑移动端适配（图片加载、音频播放）

---

## 📝 更新记录

- **2026-01-26**：创建计划文档，记录三个游戏方案
  - 方案A：看图猜物品
  - 方案B：听声辨物
  - 方案C：品牌猜测
- **2026-01-26**：完善详细内容
  - 为每个方案添加详细的玩法介绍
  - 添加游戏体验增强点说明
  - 添加玩法操作的限制说明
  - 添加游戏管理者可配置的数据项（Schema定义）
  - 添加基础数据Demo示例
- **2026-01-26**：整合为统一方案
  - 将三个方案整合为一个"看图猜测物品"游戏
  - 更新提示机制：局部细节 → 轮廓剪影 → 30%区域（模糊）→ 50%区域（模糊）→ 70%区域（模糊）
  - 扩展物品类型：生活用品、品牌logo、国旗、专辑封面
  - 添加分类提示功能
  - 更新数据Schema，支持多种物品类型
  - 添加各类物品的示例数据

---

## 💡 后续优化方向

- 考虑添加图片/音频的加载优化
- 考虑添加难度等级（简单/中等/困难）
- 考虑添加多人对战模式
- 考虑添加排行榜功能
