@echo off
chcp 65001 >nul
echo ============================================
echo   Metaverse Virtual Exhibition - Docker
echo ============================================

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo.
echo Checking Docker...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed
    pause
    exit /b 1
)

echo.
echo Building and starting Docker containers...
echo.

docker-compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   Docker Containers Started!
    echo ============================================
    echo.
    echo   Client: http://localhost:3000
    echo   Server: http://localhost:3001
    echo.
    echo   To stop: docker-compose down
    echo   To view logs: docker-compose logs -f
    echo.
    echo ============================================
) else (
    echo.
    echo Error: Failed to start Docker containers
)

pause
