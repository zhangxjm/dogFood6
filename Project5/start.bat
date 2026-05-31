@echo off
echo ========================================
echo Welfare System Startup Script
echo ========================================

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

if not exist "db\welfare.db" (
    echo Initializing database...
    node init.js
)

echo Starting server...
node server.js

pause
