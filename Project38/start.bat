@echo off
echo ================================
echo Dialect Culture Sharing Platform
echo ================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Error: Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

if exist "instance\dialect.db" (
    echo Database already exists, skipping initialization.
) else (
    echo Initializing database with sample data...
)

echo.
echo Starting server on http://0.0.0.0:5000
echo Press Ctrl+C to stop the server
echo.

python app.py

pause
