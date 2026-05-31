#!/bin/bash
echo "========================================"
echo "Cold Chain Traceability System"
echo "Starting services with Docker..."
echo "========================================"

echo "Creating required directories..."
mkdir -p docker/mosquitto/data
mkdir -p docker/mosquitto/log
mkdir -p docker/influxdb/data
mkdir -p docker/influxdb/config
mkdir -p backend/data

echo ""
echo "Building and starting Docker containers..."
echo "This may take several minutes on first run."
echo ""

docker-compose up -d --build

echo ""
echo "========================================"
echo "Services are starting up..."
echo "========================================"
echo ""
echo "Please wait 30-60 seconds for all services to initialize."
echo ""
echo "Frontend URL: http://localhost"
echo "Backend API: http://localhost:8080"
echo "MQTT Broker: localhost:1883"
echo "InfluxDB: http://localhost:8086"
echo ""
echo "Use 'docker-compose logs -f' to view logs."
echo "Use 'docker-compose down' to stop services."
echo "========================================"
