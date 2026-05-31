@echo off
echo ========================================
echo Starting Backend Server...
echo ========================================

cd /d "%~dp0.."
cd backend

call venv\Scripts\activate.bat

echo Starting Django server on port 8000...
python manage.py runserver 0.0.0.0:8000
