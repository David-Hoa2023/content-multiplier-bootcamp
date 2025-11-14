@echo off
REM Content Multiplier - Production Deployment Script (Windows)
REM This script builds and deploys the application using PM2

echo ===================================
echo Content Multiplier Deployment
echo ===================================

REM Create log directories
echo Creating log directories...
if not exist "backend\logs" mkdir backend\logs
if not exist "frontend\logs" mkdir frontend\logs

REM Build backend
echo.
echo Building backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo Backend build failed!
    exit /b %errorlevel%
)
cd ..

REM Build frontend
echo.
echo Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    exit /b %errorlevel%
)
cd ..

REM Stop existing PM2 processes (if any)
echo.
echo Stopping existing PM2 processes...
pm2 delete all 2>nul

REM Start applications with PM2
echo.
echo Starting applications with PM2...
pm2 start ecosystem.config.js --env production

REM Save PM2 process list
echo.
echo Saving PM2 process list...
pm2 save

REM Display status
echo.
echo ===================================
echo Deployment complete!
echo ===================================
pm2 list
echo.
echo Useful commands:
echo   pm2 logs              - View all logs
echo   pm2 monit             - Monitor processes
echo   pm2 restart all       - Restart all processes
echo   pm2 stop all          - Stop all processes
echo.
