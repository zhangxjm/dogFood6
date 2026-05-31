@echo off
echo ========================================
echo Initializing Frontend...
echo ========================================

cd /d "%~dp0.."
cd frontend

echo Installing dependencies...
call npm install

echo Frontend initialization complete!
echo You can now run: start_frontend.bat
pause
