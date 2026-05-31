#!/bin/bash

echo "========================================"
echo "  Spa Booking System - Startup Script"
echo "========================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "[INFO] Node.js version:"
node --version
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/5] Installing server dependencies..."
cd "$SCRIPT_DIR/server"
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install server dependencies"
        exit 1
    fi
else
    echo "[INFO] Server dependencies already installed"
fi
echo ""

echo "[2/5] Building server..."
cd "$SCRIPT_DIR/server"
if [ ! -d "dist" ]; then
    npx tsc
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to build server"
        exit 1
    fi
else
    echo "[INFO] Server already built"
fi
echo ""

echo "[3/5] Installing client dependencies..."
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install client dependencies"
        exit 1
    fi
else
    echo "[INFO] Client dependencies already installed"
fi
echo ""

echo "[4/5] Building client for H5..."
cd "$SCRIPT_DIR"
if [ ! -d "dist" ]; then
    npx taro build --type h5
    if [ $? -ne 0 ]; then
        echo "[WARN] Client build failed, starting server only"
    else
        echo "[INFO] Copying H5 build to server public directory..."
        mkdir -p server/public
        cp -r dist/* server/public/
    fi
else
    echo "[INFO] Client already built"
fi
echo ""

echo "[5/5] Starting server on port 3000..."
cd "$SCRIPT_DIR/server"
node dist/main.js
