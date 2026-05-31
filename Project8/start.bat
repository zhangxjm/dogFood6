@echo off
echo Starting Fishing Gear Consignment System...
echo.

echo Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed or not in PATH.
    echo Please install Docker Desktop first.
    pause
    exit /b 1
)

echo.
echo Starting MySQL container...
docker-compose up -d mysql

echo.
echo Waiting for MySQL to be ready...
:loop
docker-compose exec -T mysql mysqladmin ping -h localhost -u admin -padmin123456 >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto loop
)

echo MySQL is ready!
echo.

echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
if not exist "node_modules" (
    call npm install
)

echo.
echo Initializing database...
call npm run init

echo.
echo Starting application...
echo Server will run at http://localhost:3000
echo.
call npm start
