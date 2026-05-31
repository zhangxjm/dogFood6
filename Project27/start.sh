#!/bin/bash

echo "Starting Silver Care Booking System..."
echo ""

echo "[1/4] Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "Java not found. Please install Java 11 or higher."
    exit 1
fi
echo "Java found."

echo ""
echo "[2/4] Checking Maven installation..."
if ! command -v mvn &> /dev/null; then
    echo "Maven not found. Please install Maven 3.6 or higher."
    exit 1
fi
echo "Maven found."

echo ""
echo "[3/4] Building backend..."
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "Backend build failed!"
    exit 1
fi
echo "Backend build completed."

echo ""
echo "[4/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Skipping frontend build."
    echo "Please install Node.js 16 or higher to build frontend."
    echo ""
else
    echo "Node.js found."
    echo "Building frontend..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "npm install failed!"
        cd ..
        exit 1
    fi
    npm run build
    if [ $? -ne 0 ]; then
        echo "Frontend build failed!"
        cd ..
        exit 1
    fi
    cd ..
    echo "Frontend build completed."
fi

echo ""
echo "========================================"
echo "Starting Silver Care Booking System..."
echo "Backend: http://localhost:8080"
echo "Frontend: Please run 'cd frontend && npm run dev'"
echo "========================================"
echo ""

java -jar target/silver-care-booking-1.0.0.jar
