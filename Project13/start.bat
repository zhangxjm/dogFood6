@echo off
chcp 65001 >nul
echo ============================================
echo   Metaverse Virtual Exhibition System
echo ============================================

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo.
echo [1/4] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    pause
    exit /b 1
)

echo.
echo [2/4] Installing dependencies...
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
echo [3/4] Building...
echo.
echo Building server...
cd /d "%PROJECT_DIR%server"
if not exist "dist" (
    call npm run build
)

echo.
echo Building client...
cd /d "%PROJECT_DIR%client"
if not exist ".next" (
    call npm run build
)

echo.
echo [4/4] Starting services...
echo.

echo Starting server on port 3001...
cd /d "%PROJECT_DIR%server"
start "Metaverse-Server" cmd /c "npm run start:prod"

timeout /t 3 /nobreak >nul

echo Starting client on port 3000...
cd /d "%PROJECT_DIR%client"
start "Metaverse-Client" cmd /c "npm run start"

timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo   Services Started Successfully!
echo ============================================
echo.
echo   Client: http://localhost:3000
echo   Server: http://localhost:3001
echo.
echo   Demo accounts:
echo     - demo_user_01
echo     - demo_user_02
echo     - demo_user_03
echo.
echo ============================================

start "" "http://localhost:3000"

pause
