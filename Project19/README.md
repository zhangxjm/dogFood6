# Quantum Computing Visualization Teaching System

A full-stack quantum computing visualization and teaching platform built with Spring Boot and Next.js.

## Features

- Quantum gate simulation (X, Y, Z, H, S, T, CNOT, CZ, SWAP, Toffoli)
- Quantum algorithm visualization (Bell state, GHZ, Deutsch, Grover, QFT, Teleportation, Superdense coding)
- Interactive circuit editor
- Real-time quantum state visualization
- Experiment data recording and management
- Tutorial system for learning quantum computing

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2
- SQLite Database
- Maven

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.x
- Node.js 18+
- npm or yarn

### Local Development

1. Start the backend:
```bash
cd backend
mvn spring-boot:run
```

2. Start the frontend (in another terminal):
```bash
cd frontend
npm install
npm run dev
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Windows Scripts

- `start.bat` - Start services locally
- `start-docker.bat` - Start services with Docker

## Project Structure

```
.
├── backend/
│   ├── src/main/java/com/quantum/
│   │   ├── core/           # Quantum computing core logic
│   │   ├── entity/         # Database entities
│   │   ├── repository/     # Data repositories
│   │   ├── service/        # Business services
│   │   ├── controller/     # API controllers
│   │   └── config/         # Configuration
│   └── pom.xml
├── frontend/
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and API clients
│   └── package.json
├── docker-compose.yml
├── start.bat
└── start-docker.bat
```

## API Endpoints

### Quantum Simulation
- `POST /api/quantum/simulate` - Simulate quantum circuit
- `GET /api/quantum/algorithm/{name}` - Run predefined algorithm
- `GET /api/quantum/gates` - Get all gate information
- `GET /api/quantum/gates/{name}` - Get specific gate info
- `GET /api/quantum/algorithms` - Get all algorithms

### Experiments
- `POST /api/quantum/experiments` - Save experiment
- `GET /api/quantum/experiments` - List all experiments
- `GET /api/quantum/experiments/{id}` - Get experiment details
- `DELETE /api/quantum/experiments/{id}` - Delete experiment

### Tutorials
- `GET /api/tutorials` - List all tutorials
- `GET /api/tutorials/{id}` - Get tutorial details
- `GET /api/tutorials/category/{category}` - Filter by category
- `GET /api/tutorials/difficulty` - Filter by difficulty
