#!/bin/bash

echo "Starting Fishing Gear Consignment System..."
echo ""

echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not in PATH."
    echo "Please install Docker first."
    exit 1
fi

echo ""
echo "Starting MySQL container..."
docker-compose up -d mysql

echo ""
echo "Waiting for MySQL to be ready..."
until docker-compose exec -T mysql mysqladmin ping -h localhost -u admin -padmin123456 > /dev/null 2>&1; do
    sleep 3
done

echo "MySQL is ready!"
echo ""

echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed or not in PATH."
    echo "Please install Node.js first."
    exit 1
fi

echo ""
echo "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "Initializing database..."
npm run init

echo ""
echo "Starting application..."
echo "Server will run at http://localhost:3000"
echo ""
npm start
