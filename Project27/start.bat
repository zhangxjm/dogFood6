@echo off
echo Starting Silver Care Booking System...
echo.

echo [1/4] Checking Java installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Java not found. Please install Java 11 or higher.
    pause
    exit /b 1
)
echo Java found.

echo.
echo [2/4] Checking Maven installation...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven not found. Please install Maven 3.6 or higher.
    pause
    exit /b 1
)
echo Maven found.

echo.
echo [3/4] Building backend...
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Backend build failed!
    pause
    exit /b 1
)
echo Backend build completed.

echo.
echo [4/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Skipping frontend build.
    echo Please install Node.js 16 or higher to build frontend.
    goto :start_backend
)

echo Node.js found.
echo Building frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo npm install failed!
    cd ..
    pause
    exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo Frontend build completed.

:start_backend
echo.
echo ========================================
echo Starting Silver Care Booking System...
echo Backend: http://localhost:8080
echo Frontend: Please run 'cd frontend && npm run dev'
echo ========================================
echo.

java -jar target\silver-care-booking-1.0.0.jar

pause
