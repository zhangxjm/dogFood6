@echo off
echo ========================================
echo Starting Gateway Service
echo ========================================

cd backend\gateway
java -jar target\gateway-1.0.0.jar
