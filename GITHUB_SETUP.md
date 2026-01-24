# 🔧 GitHub 仓库设置指南

## 步骤 1: 创建 GitHub 仓库

如果仓库还没有创建，请按以下步骤操作：

1. **访问 GitHub**: https://github.com/new
2. **填写仓库信息**:
   - Repository name: `gameRepo`
   - Description: `一个现代化的在线游戏平台，集合了多种有趣的小游戏`
   - Visibility: 选择 **Public**（GitHub Pages 免费版需要公开仓库）
   - **不要**勾选 "Initialize this repository with a README"
   - **不要**添加 .gitignore 或 license（我们已经有了）
3. 点击 **Create repository**

## 步骤 2: 推送代码

创建仓库后，执行以下命令：

```bash
# 确保在项目目录
cd d:\CODE\game

# 检查远程仓库配置
git remote -v

# 如果远程仓库 URL 不正确，更新它
git remote set-url origin https://github.com/JustinBIBBERR/gameRepo.git

# 推送代码
git push -u origin main
```

如果遇到认证问题，可能需要：
1. 使用 Personal Access Token（推荐）
2. 或使用 SSH 方式

## 步骤 3: 配置 GitHub Pages

1. 访问：https://github.com/JustinBIBBERR/gameRepo/settings/pages
2. 在 "Source" 部分：
   - Source: 选择 **GitHub Actions**
3. 点击 **Save**

## 步骤 4: 等待部署完成

1. 访问 Actions 页面：https://github.com/JustinBIBBERR/gameRepo/actions
2. 等待 "Deploy to GitHub Pages" 工作流完成
3. 部署完成后，访问：https://justinbiberr.github.io/gameRepo/

---

## 🔐 认证问题解决

### 使用 Personal Access Token（推荐）

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 设置权限：
   - ✅ repo（完整仓库访问权限）
   - ✅ workflow（GitHub Actions 权限）
4. 生成并复制 token
5. 推送时使用 token 作为密码：
   ```bash
   git push -u origin main
   # Username: JustinBIBBERR
   # Password: <粘贴你的token>
   ```

### 使用 SSH（可选）

```bash
# 更改远程 URL 为 SSH
git remote set-url origin git@github.com:JustinBIBBERR/gameRepo.git

# 推送
git push -u origin main
```
