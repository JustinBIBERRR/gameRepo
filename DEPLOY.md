# 🚀 部署指南

## 首次部署到 GitHub Pages

### 1. 初始化 Git 仓库

```bash
# 初始化 git 仓库
git init

# 添加远程仓库
git remote add origin https://github.com/JustinBIBBERR/gameRepo.git
```

### 2. 提交代码

```bash
# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 游戏平台项目"

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 访问 https://github.com/JustinBIBBERR/gameRepo/settings/pages
2. 在 "Source" 部分选择：
   - Source: **GitHub Actions**
3. 保存设置

### 4. 触发部署

推送到 `main` 分支后，GitHub Actions 会自动：
- 构建项目
- 部署到 GitHub Pages

**访问地址：** https://justinbiberr.github.io/gameRepo/

---

## 后续更新

只需要正常提交和推送代码即可：

```bash
git add .
git commit -m "更新说明"
git push
```

GitHub Actions 会自动检测到推送并重新部署。

---

## 注意事项

1. **Base URL**: 项目已配置 `base: '/gameRepo/'`，确保 GitHub Pages 路径正确
2. **404 重定向**: `404.html` 已配置，确保 SPA 路由正常工作
3. **权限设置**: 确保 GitHub Actions 有 Pages 写入权限（在仓库设置中启用）

---

## 故障排查

### 部署失败

1. 检查 GitHub Actions 日志：https://github.com/JustinBIBBERR/gameRepo/actions
2. 确保 `package.json` 中的依赖都正确安装
3. 检查构建是否成功：`npm run build`

### 页面 404

1. 确保 GitHub Pages 源设置为 "GitHub Actions"
2. 检查 `vite.config.ts` 中的 `base` 路径是否正确
3. 确保 `404.html` 文件存在且路径正确

### 路由不工作

1. 确保 `404.html` 中的重定向路径包含 `/gameRepo/`
2. 检查浏览器控制台是否有错误
