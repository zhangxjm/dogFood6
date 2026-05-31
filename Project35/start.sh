#!/bin/bash
echo "==========================================="
echo "Community Repair System - Starting..."
echo "==========================================="

echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Initializing database..."
node database/init.js

echo "Starting server..."
echo "Server will be available at http://localhost:3000"
npm start
