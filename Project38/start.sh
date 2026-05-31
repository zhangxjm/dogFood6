#!/bin/bash
echo "================================"
echo "Dialect Culture Sharing Platform"
echo "================================"
echo ""

if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "Error: Python is not installed or not in PATH"
        exit 1
    fi
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment"
        exit 1
    fi
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt -q
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

if [ -f "instance/dialect.db" ]; then
    echo "Database already exists, skipping initialization."
else
    echo "Initializing database with sample data..."
fi

echo ""
echo "Starting server on http://0.0.0.0:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python app.py
