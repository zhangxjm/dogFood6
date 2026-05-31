#!/bin/bash

echo "========================================"
echo "  Classroom Booking System"
echo "========================================"
echo ""

if ! command -v go &> /dev/null; then
    echo "[ERROR] Go is not installed. Please install Go first."
    exit 1
fi

echo "[INFO] Checking dependencies..."
go mod tidy

echo ""
echo "[INFO] Building application..."
go build -o classroom-booking-system .

if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed."
    exit 1
fi

echo ""
echo "[INFO] Starting application..."
echo "[INFO] Server running at: http://localhost:8080"
echo "[INFO] Press Ctrl+C to stop."
echo ""

./classroom-booking-system
