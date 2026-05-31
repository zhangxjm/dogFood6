#!/bin/bash

echo "Stopping backend server..."
pkill -f "uvicorn app.main:app" || echo "Backend not running"

echo "Stopping frontend server..."
pkill -f "vite" || echo "Frontend not running"

echo "All services stopped."
