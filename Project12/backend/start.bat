@echo off
chcp 65001 >nul
echo Starting Heritage Platform Backend...
echo.

cd /d "%~dp0"

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Upgrading pip and setuptools...
    python -m pip install --upgrade pip setuptools wheel
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

echo Starting FastAPI server on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
