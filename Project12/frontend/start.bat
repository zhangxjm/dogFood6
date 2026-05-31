@echo off
chcp 65001 >nul
echo Starting Heritage Platform Frontend...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo Starting React dev server on http://localhost:3000
echo.

npm run dev

pause
