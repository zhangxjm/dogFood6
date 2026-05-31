#!/bin/bash
echo Starting Non-Heritage E-commerce System...
echo.

echo ============================================
echo Starting Backend Server on port 8000...
echo ============================================
cd backend
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
sleep 3

cd ..

echo ============================================
echo Starting Frontend Server on port 3000...
echo ============================================
cd frontend
npm run dev &
FRONTEND_PID=$!
sleep 5

cd ..

echo
echo ============================================
echo System started successfully!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:8000/admin (admin/admin123)
echo API:      http://localhost:8000/api/
echo ============================================
echo
echo "Press Ctrl+C to stop all servers"
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
