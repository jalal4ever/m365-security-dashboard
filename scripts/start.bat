@echo off
REM M365 Security Dashboard - Start Script
REM This script starts both backend and frontend servers

echo.
echo ========================================
echo   M365 Security Dashboard Launcher
echo ========================================
echo.

echo [1/3] Cleaning up ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill //F //PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill //F //PID %%a 2>nul
echo Done.
echo.

echo [2/3] Starting Backend server on port 8000...
start "M365 Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul
echo Done.
echo.

echo [3/3] Starting Frontend server on port 5173...
start "M365 Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul
echo Done.
echo.

echo ========================================
echo   Servers started successfully!
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo   Press any key to exit this window...
pause >nul
