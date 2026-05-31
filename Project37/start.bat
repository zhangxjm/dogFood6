@echo off
echo ========================================
echo Document Archive Management System
echo ========================================
echo.

echo Creating data directories...
if not exist "backend\data" mkdir backend\data
if not exist "backend\data\documents" mkdir backend\data\documents

echo.
echo Checking Java environment...
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH. Please install JDK 11 or higher.
    exit /b 1
)

echo Java environment OK.

echo.
echo Checking Maven environment...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Maven is not installed or not in PATH. Please install Maven 3.6 or higher.
    exit /b 1
)

echo Maven environment OK.

echo.
echo Building backend project...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo ERROR: Failed to build backend project.
    cd ..
    exit /b 1
)
cd ..

echo Backend build completed successfully.

echo.
echo Checking Node.js environment...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH. Please install Node.js 16 or higher.
    exit /b 1
)

echo Node.js environment OK.

echo.
echo Building frontend project...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --registry=https://registry.npmmirror.com
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies.
        cd ..
        exit /b 1
    )
)

call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build frontend project.
    cd ..
    exit /b 1
)
cd ..

echo Frontend build completed successfully.

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Starting backend server...
start "Document Archive Backend" cmd /k "cd backend && java -jar target/document-archive-1.0.0.jar"

echo.
echo Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo.
echo Starting frontend server...
start "Document Archive Frontend" cmd /k "cd frontend && npx vite preview --port 3000"

echo.
echo ========================================
echo System is starting up...
echo ========================================
echo.
echo Backend API: http://localhost:8080/api
echo Frontend URL: http://localhost:3000
echo.
echo Default accounts:
echo   - Admin: admin / admin123
echo   - User:  user / user123
echo   - Guest: guest / guest123
echo.
echo Please wait for both servers to fully start before accessing.
echo ========================================
