@echo off
chcp 65001 >nul
title 游戏平台 - 本地资源服务器

cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo [错误] 未检测到 Node.js。请先安装 Node.js 并加入 PATH。
  echo 下载: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo 正在启动本地资源服务器...
echo 配置文件: scripts\resource-server.config.txt （可修改资源目录）
echo 未配置时默认目录: %USERPROFILE%\Videos
echo.

node "%~dp0serve-videos.cjs" --open

echo.
pause
