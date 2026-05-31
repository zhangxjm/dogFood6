#!/bin/bash

echo "========================================"
echo "Nursery Management System - Startup"
echo "========================================"

if ! command -v go &> /dev/null; then
    echo "Go is not installed. Please install Go first."
    exit 1
fi

echo "Checking dependencies..."
go mod download

echo "Building application..."
go build -o nursery-management

echo "Starting server..."
echo "Server will be available at http://localhost:8080"
echo "Press Ctrl+C to stop the server."
echo ""

./nursery-management
