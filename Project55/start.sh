#!/bin/bash

echo "========================================"
echo "Appliance Rental System"
echo "========================================"
echo ""

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "Node.js found!"
echo ""

echo "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies."
        exit 1
    fi
fi

echo ""
echo "Initializing database..."
if [ ! -f "database/appliance_rental.db" ]; then
    node database/init.js
fi

echo ""
echo "Starting server..."
echo ""
echo "Server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server."
echo "========================================"
echo ""

npm start
