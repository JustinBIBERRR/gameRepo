# 猜电影游戏视频测试说明

## 测试文件

`MovieGuess.video.integration.test.ts` - 使用真实视频文件 `tests/assets/drunk.mp4` 进行测试

## 测试覆盖场景

### 1. 视频文件上传和存储 ✅
- 保存视频文件到 IndexedDB
- 从 IndexedDB 恢复视频文件
- 保存用户电影信息

### 2. 视频时长获取 ✅
- 从视频文件获取时长
- 验证时长用于时间点选择器

### 3. 视频预加载和加载时长 ✅
- 预加载视频并跟踪加载进度
- 测量视频加载时间
- 从预加载视频获取时长

### 4. 播放方法选择 ✅
- 精确播放模式选择
- 自动播放模式选择

### 5. 页面刷新后视频资源恢复 ✅
- 从 IndexedDB 恢复视频文件
- 重新预加载视频

### 6. 路由切换后视频资源状态 ✅
- 保持预加载状态
- 处理资源清理

### 7. 游戏状态持久化和恢复 ✅
- 保存完整游戏状态（包括视频）
- 恢复游戏状态并继续游玩

### 8. 视频资源异常处理 ✅
- 处理无效视频文件
- 处理缺失的视频文件
- 处理预加载失败

## 运行测试

### 前提条件

1. **确保视频文件存在**：
   ```
   tests/assets/drunk.mp4
   ```

2. **运行单个测试文件**：
   ```bash
   npm run test:unit -- tests/integration/games/MovieGuess.video.integration.test.ts
   ```

3. **运行所有集成测试**：
   ```bash
   npm run test:unit -- tests/integration/
   ```

## 注意事项

### 测试超时

某些测试（特别是视频预加载相关）可能需要较长时间（30-60秒），因为：
- 需要加载真实的视频文件
- 需要等待视频元数据加载
- 需要等待视频预加载完成

### 跳过逻辑

如果视频文件不可用，测试会自动跳过需要真实视频文件的测试用例，并输出警告信息。这确保了：
- 测试框架可以正常运行
- 不依赖真实视频文件的测试仍然可以执行
- 有真实视频文件时，所有测试都会运行

### 测试环境

- **Node.js 环境**：使用 `fs` 模块读取文件
- **浏览器环境**：使用 `fetch` API 读取文件
- **测试工具**：`videoTestUtils.ts` 自动处理环境差异

## 测试工具函数

`tests/utils/videoTestUtils.ts` 提供了：
- `loadTestVideoFile()` - 加载测试视频文件
- `createMockVideoFile()` - 创建模拟视频文件（用于错误处理测试）

## 测试结果示例

```
✓ 视频文件上传和存储 (3 tests)
  ✓ should save and retrieve video file from IndexedDB
  ✓ should persist video file as Blob in IndexedDB
  ✓ should save user movie information

✓ 视频时长获取 (2 tests)
  ✓ should get video duration from file [如果视频文件可用]
  ✓ should handle video duration for different time points [如果视频文件可用]

✓ 视频预加载和加载时长 (3 tests)
  ✓ should preload video and track loading progress [如果视频文件可用]
  ✓ should measure video loading time [如果视频文件可用]
  ✓ should get video duration from preloaded video [如果视频文件可用]

✓ 播放方法选择 (2 tests)
  ✓ should select precise playback method with source file
  ✓ should select auto playback method

✓ 页面刷新后视频资源恢复 (2 tests)
  ✓ should restore video file after page refresh simulation
  ✓ should restore and preload video after refresh [如果视频文件可用]

✓ 路由切换后视频资源状态 (2 tests)
  ✓ should maintain video preload state across route changes [如果视频文件可用]
  ✓ should handle video resource cleanup on route change [如果视频文件可用]

✓ 游戏状态持久化和恢复 (1 test)
  ✓ should save and restore complete game state with video

✓ 视频资源异常处理 (3 tests)
  ✓ should handle invalid video file gracefully
  ✓ should handle missing video file in IndexedDB
  ✓ should handle video preload failure gracefully
```

## 性能考虑

- **视频预加载**：可能需要 10-60 秒，取决于视频文件大小
- **时长获取**：通常需要 1-5 秒
- **IndexedDB 操作**：通常很快（<100ms）

## 后续优化

1. 使用更小的测试视频文件（如果可能）
2. 添加视频文件大小和格式验证
3. 添加视频加载性能基准测试
4. 添加并发预加载测试
