@echo off
echo ==============================================
echo 北邮升学就业平台 - 项目启动脚本
echo ==============================================
echo.

echo 检查Node.js是否安装...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js已安装
) else (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/zh-cn/download
    pause
    exit /b 1
)

echo.
echo 检查依赖是否安装...
if not exist "node_modules" (
    echo ⚠️  未检测到依赖，开始安装...
    call npm install
    if %errorlevel% equ 0 (
        echo ✅ 依赖安装成功
    ) else (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ 依赖已安装
)

echo.
echo ==============================================
echo 启动开发服务器...
echo 访问地址: http://localhost:3000
echo ==============================================
echo.
call npm run dev

pause