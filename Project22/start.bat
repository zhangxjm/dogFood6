@echo off
echo ========================================
echo Industrial Inspection System Startup
echo ========================================
echo.

echo [1/5] Checking Java environment...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    exit /b 1
)

echo.
echo [2/5] Checking Maven environment...
mvn -version
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    exit /b 1
)

echo.
echo [3/5] Checking Node.js environment...
node -v
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    exit /b 1
)

echo.
echo [4/5] Starting backend server...
cd backend
echo Building backend...
mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed
    exit /b 1
)
start "Backend Server" cmd /k "java -jar target\industrial-inspection-backend-1.0.0.jar"
cd ..

echo.
echo [5/5] Installing frontend dependencies and starting dev server...
if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo System starting...
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:3000
echo ========================================
echo.
echo Please wait for both servers to start up
echo Default login: admin / admin123
pause
