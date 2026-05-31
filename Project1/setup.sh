#!/bin/bash

echo "============================================"
echo "  Installing dependencies - Backend"
echo "============================================"
cd "$(dirname "$0")/server"
npm install

echo ""
echo "============================================"
echo "  Installing dependencies - Frontend"
echo "============================================"
cd "$(dirname "$0")/client"
npm install

echo ""
echo "============================================"
echo "  Setup completed successfully!"
echo "============================================"
echo "  Run ./start.sh to launch the application."
echo "============================================"
