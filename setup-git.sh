#!/bin/bash

# 初始化 Git 仓库并推送到 GitHub
# 使用方法: bash setup-git.sh

echo "🚀 开始设置 Git 仓库..."

# 检查是否已经是 git 仓库
if [ -d ".git" ]; then
    echo "⚠️  已经是 Git 仓库，跳过初始化"
else
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/JustinBIBBERR/gameRepo.git

# 添加所有文件
echo "📝 添加文件..."
git add .

# 提交
echo "💾 提交更改..."
git commit -m "Initial commit: 游戏平台项目

- Vue 3 + TypeScript + Vite + Tailwind CSS
- 城市猜测游戏
- 王者荣耀人物猜测游戏
- 成就系统
- 数据持久化
- GitHub Pages 部署配置"

# 推送到 main 分支
echo "🚀 推送到 GitHub..."
git branch -M main
git push -u origin main

echo "✅ 完成！"
echo ""
echo "📋 下一步："
echo "1. 访问 https://github.com/JustinBIBBERR/gameRepo/settings/pages"
echo "2. 在 Source 部分选择 'GitHub Actions'"
echo "3. 等待 GitHub Actions 完成部署"
echo "4. 访问 https://justinbiberr.github.io/gameRepo/ 查看你的网站"
