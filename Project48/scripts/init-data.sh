#!/bin/bash
set -e

echo "========================================"
echo "Data Initialization Script
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"
cd "$SCRIPT_DIR/.."

cd backend

echo "[1/3] Creating data directories..."
mkdir -p ../data
mkdir -p ../data/influxdb
mkdir -p ../data/mosquitto
mkdir -p ../data/mosquitto/config
mkdir -p ../ai-service/data/models
echo "Data directories created successfully."
echo ""

echo "[2/3] Downloading Go dependencies..."
go mod download
echo "Go dependencies downloaded successfully."
echo ""

echo "[3/3] Building and running data seeder..."
go run ./cmd/seeder.go
echo "Data initialized successfully."
echo ""

echo "========================================"
echo "Data initialization completed successfully!"
echo "========================================"
echo ""
echo "Default accounts:"
echo "  - Admin: admin / admin123"
echo "  - Engineer: engineer / engineer123"
echo "  - Manager: manager / manager123"
echo ""
