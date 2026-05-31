@echo off
chcp 65001 >nul
echo Stopping Edge Computing Platform services...
cd /d "%~dp0"
docker compose down
echo Services stopped.
pause
