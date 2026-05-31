@echo off
echo ========================================
echo Starting Frontend Server...
echo ========================================

cd /d "%~dp0.."
cd frontend

echo Starting React development server...
npm start
