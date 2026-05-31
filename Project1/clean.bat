@echo off
echo ============================================
echo   Clean up generated files
echo ============================================
cd /d "%~dp0"

echo Removing node_modules...
if exist "server\node_modules" rmdir /s /q server\node_modules
if exist "client\node_modules" rmdir /s /q client\node_modules

echo Removing database...
if exist "server\unlock_service.db" del /q server\unlock_service.db

echo Removing dist...
if exist "client\dist" rmdir /s /q client\dist

echo.
echo ============================================
echo   Clean up completed!
echo ============================================
pause
