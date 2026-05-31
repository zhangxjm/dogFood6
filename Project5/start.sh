#!/bin/bash
echo "========================================"
echo "Welfare System Startup Script"
echo "========================================"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

if [ ! -f "db/welfare.db" ]; then
    echo "Initializing database..."
    node init.js
fi

echo "Starting server..."
node server.js
