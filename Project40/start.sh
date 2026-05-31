#!/bin/bash

echo "============================================"
echo " Freight Dispatch System - Starting"
echo "============================================"
echo

if ! command -v go &> /dev/null; then
    echo "[ERROR] Go is not installed or not in PATH"
    echo "Please install Go from https://go.dev/dl/"
    exit 1
fi

echo "[1/3] Downloading dependencies..."
go mod tidy
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to download dependencies"
    exit 1
fi

echo "[2/3] Building application..."
go build -o freight-dispatch .
if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed"
    exit 1
fi

echo "[3/3] Starting server on http://localhost:8080"
echo
echo "============================================"
echo " Server is running at http://localhost:8080"
echo " Press Ctrl+C to stop"
echo "============================================"
echo

./freight-dispatch
