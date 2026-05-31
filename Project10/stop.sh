#!/bin/bash
echo "========================================"
echo "Pet Grooming System Stop Script"
echo "========================================"
echo ""

echo "Stopping all services..."
docker-compose down
echo ""

echo "All services stopped."
echo "========================================"
