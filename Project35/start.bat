@echo off
echo ===========================================
echo Community Repair System - Starting...
echo ===========================================

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Initializing database...
call node database/init.js

echo Starting server...
echo Server will be available at http://localhost:3000
call npm start
