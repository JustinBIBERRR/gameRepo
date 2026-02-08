@echo off
chcp 65001 >nul
title 游戏平台 - 本地资源服务器

cd /d "%~dp0"

set "NODE_EXE="
where node >nul 2>&1
if %errorlevel% equ 0 (
  set "NODE_EXE=node"
)
if not defined NODE_EXE (
  if exist "C:\Program Files\nodejs\node.exe" set "NODE_EXE=C:\Program Files\nodejs\node.exe"
)
if not defined NODE_EXE (
  if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
)

if not defined NODE_EXE (
  echo [错误] 未检测到 Node.js。请先安装 Node.js 并加入 PATH。
  echo 下载: https://nodejs.org/
  echo 安装后请「重启电脑」或重新打开资源管理器后再试。
  echo.
  goto :end
)

echo 正在启动本地资源服务器...
echo 配置文件: 本目录下的 resource-server.config.txt
echo 未配置时默认目录: %USERPROFILE%\Videos
echo.

"%NODE_EXE%" "%~dp0serve-videos.cjs" --open

if %errorlevel% neq 0 (
  echo.
  echo [提示] 若上方有「目录不存在」等报错，请用记事本打开 resource-server.config.txt，
  echo        在第一行写上你的资源文件夹完整路径后保存，再重新双击本文件。
)

:end
echo.
echo 按任意键关闭此窗口...
pause >nul
