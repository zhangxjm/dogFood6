@echo off
echo ============================================
echo   Installing dependencies - Backend
echo ============================================
cd /d "%~dp0server"
call npm install

echo.
echo ============================================
echo   Installing dependencies - Frontend
echo ============================================
cd /d "%~dp0client"
call npm install

echo.
echo ============================================
echo   Setup completed successfully!
echo ============================================
echo   Run start.bat to launch the application.
echo ============================================
pause
