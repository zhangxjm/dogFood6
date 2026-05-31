@echo off
echo ========================================
echo  Aerospace Payload Test Data System
echo  Starting...
echo ========================================

echo.
echo [1/3] Installing server dependencies...
cd server
if not exist "node_modules" (
    npm install
)

echo.
echo [2/3] Installing client dependencies...
cd ..\client
if not exist "node_modules" (
    npm install
)
if not exist "dist" (
    echo Building client...
    npm run build
)

echo.
echo [3/3] Starting servers...
cd ..

echo.
echo Starting backend server (port 3000)...
start "Aerospace Test Backend" cmd /k "cd server && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting frontend server (port 8080)...
start "Aerospace Test Frontend" cmd /k "cd client && npx serve -s dist -p 8080"

echo.
echo ========================================
echo  System is starting!
echo  Backend API: http://localhost:3000
echo  Frontend UI:  http://localhost:8080
echo ========================================
echo.
pause
