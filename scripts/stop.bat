@echo off
REM M365 Security Dashboard - Stop Script
REM This script stops all running servers

echo.
echo ========================================
echo   M365 Security Dashboard Stopper
echo ========================================
echo.

echo Stopping all M365 processes...
echo.

echo Stopping Python (backend) processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 8000
    taskkill //F //PID %%a 2>nul
)

echo Stopping Node (frontend) processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing process %%a on port 5173
    taskkill //F //PID %%a 2>nul
)

echo.
echo ========================================
echo   All processes stopped!
echo ========================================
echo.
pause
