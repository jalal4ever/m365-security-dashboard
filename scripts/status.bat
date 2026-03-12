@echo off
REM M365 Security Dashboard - Status Check

echo.
echo ========================================
echo   M365 Security Dashboard Status
echo ========================================
echo.

echo Checking Backend (port 8000)...
netstat -ano | findstr :8000 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo   [OK] Backend is running on port 8000
) else (
    echo   [X] Backend is NOT running
)

echo.
echo Checking Frontend (port 5173)...
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %errorlevel%==0 (
    echo   [OK] Frontend is running on port 5173
) else (
    echo   [X] Frontend is NOT running
)

echo.
echo ========================================
echo.
pause
