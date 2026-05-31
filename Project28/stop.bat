@echo off
echo Stopping Satellite Orbit Simulation Platform...
docker-compose -f docker/docker-compose.yml down
echo Services stopped.
pause
