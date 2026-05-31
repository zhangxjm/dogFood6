#!/bin/bash
echo "========================================"
echo "Industrial Inspection System Startup"
echo "========================================"
echo ""

echo "[1/5] Checking Java environment..."
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    exit 1
fi
java -version

echo ""
echo "[2/5] Checking Maven environment..."
if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven is not installed or not in PATH"
    exit 1
fi
mvn -version

echo ""
echo "[3/5] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi
node -v

echo ""
echo "[4/5] Starting backend server..."
cd backend
echo "Building backend..."
mvn clean package -DskipTests -q
if [ $? -ne 0 ]; then
    echo "ERROR: Backend build failed"
    exit 1
fi
java -jar target/industrial-inspection-backend-1.0.0.jar &
BACKEND_PID=$!
cd ..

echo ""
echo "[5/5] Installing frontend dependencies and starting dev server..."
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "System starting..."
echo "Backend will be available at: http://localhost:8080"
echo "Frontend will be available at: http://localhost:3000"
echo "========================================"
echo ""
echo "Please wait for both servers to start up"
echo "Default login: admin / admin123"
echo ""
echo "Press Ctrl+C to stop all services"

wait $BACKEND_PID $FRONTEND_PID
