#!/bin/bash

echo "========================================"
echo "Remote Sensing Platform - Starting..."
echo "========================================"

echo ""
echo "[1/6] Creating necessary directories..."
mkdir -p backend/uploads backend/thumbnails backend/change_masks

echo ""
echo "[2/6] Cleaning old Docker resources..."
docker-compose down --volumes --rmi all

echo ""
echo "[3/6] Cleaning Docker build cache..."
docker builder prune -f

echo ""
echo "[4/6] Starting Docker containers..."
docker-compose up -d --build --force-recreate

echo ""
echo "[5/6] Waiting for backend to be ready..."
sleep 50

echo ""
echo "[6/6] Initializing sample data..."
docker exec rs-backend python init_data.py

echo ""
echo "========================================"
echo "Services started successfully!"
echo "========================================"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:3000"
echo "Elasticsearch: http://localhost:9200"
echo "========================================"
