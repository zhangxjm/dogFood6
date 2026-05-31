@echo off
echo Verifying Warehouse Management System...
echo.

echo [1/3] Verifying Go backend...
cd backend
echo Running go vet...
go vet ./...
if %ERRORLEVEL% NEQ 0 (
    echo Go vet failed!
    exit /b 1
)
echo Go vet passed.
cd ..

echo.
echo [2/3] Checking frontend files...
if exist frontend\package.json (
    echo Frontend package.json exists.
) else (
    echo Frontend package.json missing!
    exit /b 1
)

echo.
echo [3/3] Checking Docker and scripts...
if exist docker-compose.yml (
    echo docker-compose.yml exists.
) else (
    echo docker-compose.yml missing!
    exit /b 1
)

if exist start.bat (
    echo start.bat exists.
) else (
    echo start.bat missing!
    exit /b 1
)

echo.
echo ========================================
echo Verification completed successfully!
echo ========================================
echo.
echo To start the system, run: start.bat
echo.
pause
