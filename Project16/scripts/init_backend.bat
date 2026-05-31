@echo off
echo ========================================
echo Initializing Backend...
echo ========================================

cd /d "%~dp0.."
cd backend

echo Creating virtual environment...
if not exist venv (
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Making migrations...
python manage.py makemigrations

echo Applying migrations...
python manage.py migrate

echo Initializing data...
python init_data.py

echo Backend initialization complete!
echo You can now run: start_backend.bat
pause
