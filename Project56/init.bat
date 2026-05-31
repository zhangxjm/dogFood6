@echo off
echo Initial setup for Non-Heritage E-commerce System
echo.

echo ============================================
echo Installing Backend Dependencies...
echo ============================================
cd backend
pip install -r requirements.txt
echo.
echo Running Database Migrations...
python manage.py makemigrations products members orders campaigns customize recommendations
python manage.py migrate
echo.
echo Initializing Data...
python manage.py init_data
cd ..

echo.
echo ============================================
echo Installing Frontend Dependencies...
echo ============================================
cd frontend
call npm install
call npm run build
cd ..

echo.
echo ============================================
echo Initial setup completed successfully!
echo Run start.bat to start the system.
echo ============================================
pause
