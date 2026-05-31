# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

### Start Services

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop services and remove volumes
docker-compose down -v
```

### Access URLs

- Frontend UI: http://localhost:3000
- Backend API: http://localhost:8080/api
- API Health Check: http://localhost:8080/api/quantum/gates

## Dockerfile Optimization

### Backend
- Uses multi-stage build to minimize image size
- First stage: Maven builder with Eclipse Temurin 17
- Second stage: Eclipse Temurin JRE Alpine runtime
- Final image size: ~150MB

### Frontend
- Uses three-stage build for optimization
- Stage 1: Install dependencies
- Stage 2: Build Next.js application
- Stage 3: Run production server with standalone output
- Uses Next.js `output: 'standalone'` feature
- Final image size: ~200MB

## Service Configuration

### Backend Service
- Port: 8080
- Health check: TCP port check every 30 seconds
- Database: SQLite file stored in `backend-data` volume
- Environment: `SPRING_PROFILES_ACTIVE=docker`

### Frontend Service
- Port: 3000
- Depends on backend service (healthy state)
- API proxy: Rewrites `/api/*` to backend
- Environment: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`

## Volumes

- `backend-data`: Persists SQLite database file

## Networks

- `quantum-network`: Internal bridge network for service communication

## Troubleshooting

### Build Failures

If you encounter network issues during build:

```bash
# Clear Docker build cache
docker builder prune -a

# Pull base images manually
docker pull maven:3.9-eclipse-temurin-17
docker pull eclipse-temurin:17-jre-alpine
docker pull node:18-alpine
```

### Connection Issues

```bash
# Check if containers are running
docker-compose ps

# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

### Database Issues

```bash
# Delete database volume to reset
docker-compose down -v
docker-compose up --build -d
```
