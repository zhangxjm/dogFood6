@echo off
chcp 65001 >nul
echo ============================================
echo   Metaverse Virtual Exhibition - Dev Mode
echo ============================================

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo.
echo [1/3] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    pause
    exit /b 1
)

echo.
echo [2/3] Installing dependencies...
echo.
echo Installing server dependencies...
cd /d "%PROJECT_DIR%server"
if not exist "node_modules" (
    call npm install
)

echo.
echo Installing client dependencies...
cd /d "%PROJECT_DIR%client"
if not exist "node_modules" (
    call npm install
)

echo.
echo [3/3] Starting development servers...
echo.

echo Starting server on port 3001...
cd /d "%PROJECT_DIR%server"
start "Metaverse-Server-Dev" cmd /c "npm run start:dev"

echo Starting client on port 3000...
cd /d "%PROJECT_DIR%client"
start "Metaverse-Client-Dev" cmd /c "npm run dev"

echo.
echo ============================================
echo   Development Servers Started!
echo ============================================
echo.
echo   Client: http://localhost:3000
echo   Server: http://localhost:3001
echo.
echo ============================================

pause
