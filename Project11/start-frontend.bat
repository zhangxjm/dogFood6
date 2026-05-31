@echo off
echo ========================================
echo Starting Frontend Development Server
echo ========================================

cd frontend
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)

call npm run dev
