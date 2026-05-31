#!/bin/bash

echo "Starting Energy Management System..."

echo "Starting Docker containers..."
docker-compose up -d

echo "Waiting for Elasticsearch to be ready..."
sleep 30

echo "Starting Backend..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!

echo "Waiting for Backend to start..."
sleep 45

echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "System starting..."
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo "Elasticsearch: http://localhost:9200"
echo "Kibana: http://localhost:5601"

wait $BACKEND_PID $FRONTEND_PID
