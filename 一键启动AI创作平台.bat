@echo off
chcp 65001 >nul
setlocal

set "BAT_DIR=%~dp0"
cd /d "%BAT_DIR%"

set "NODE_DIR=C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2"
set "NODE_EXE=%NODE_DIR%\node.exe"
set "NPM_CMD=%NODE_DIR%\npm.cmd"
set "PATH=%NODE_DIR%;%PATH%"

echo.
echo ==========================================
echo    少儿AI作品展示平台
echo   学生上传作品  家长公开浏览
echo ==========================================
echo.

if not exist node_modules (
  echo [1/3] 正在安装依赖...
  call "%NPM_CMD%" install
  echo.
)

echo [2/3] 正在初始化数据库...
"%NODE_EXE%" init-db.js
echo.

echo [3/3] 正在启动服务器...
echo.
echo 访问地址: http://localhost:3001
echo.
echo ====== 学生端 ======
echo 登录: http://localhost:3001
echo 学生账号: stu001~stu004 / 123456
echo.
echo ====== 家长端 ======
echo 画廊: http://localhost:3001/gallery.html
echo（无需登录，直接访问）
echo.

start "" "http://localhost:3001/gallery.html"
"%NODE_EXE%" server.js

echo.
echo 服务器已停止。
pause