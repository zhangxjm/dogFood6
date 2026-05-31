# Silver Care Booking System

## Project Overview
Silver Care Booking System is a full-stack web application for elderly healthcare and wellness accommodation booking. Built with Spring Boot backend and Vue3 frontend, featuring WebSocket real-time chat, simulated WeChat payment, and multi-role permission control.

## Tech Stack
### Backend
- Java 11
- Spring Boot 2.7.18
- Spring Security + JWT
- MyBatis-Plus
- SQLite Database
- WebSocket
- WeChat Pay API

### Frontend
- Vue 3
- Vite
- Pinia (State Management)
- Vue Router
- Element Plus (UI Library)
- Axios
- ECharts

## Features
### Core Modules
1. **Room Booking**: Browse, search, and book wellness rooms
2. **Service Packages**: Various healthcare service packages
3. **Health Data**: Record and track health metrics
4. **Online Chat**: Real-time communication with staff via WebSocket
5. **Payment System**: Simulated WeChat payment integration
6. **User Management**: Multi-role system (Admin, Staff, User)
7. **Booking Management**: Admin dashboard for reservations

## Quick Start

### Prerequisites
- JDK 11+
- Maven 3.6+
- Node.js 16+
- npm or yarn

### Development Mode
```bash
# Windows
start-dev.bat

# Or manually:
# Terminal 1 - Backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Production Mode
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Docker
```bash
docker-compose up -d
```

## Test Accounts
| Role    | Username | Password  |
|---------|----------|-----------|
| Admin   | admin    | admin123  |
| Staff   | staff    | staff123  |
| User    | user     | user123   |

## Access URLs
- Backend API: http://localhost:8080
- Frontend: http://localhost:3000 (dev) or http://localhost:8080 (prod)
- WebSocket: ws://localhost:8080/ws/chat/{userId}

## Project Structure
```
silver-care-booking/
├── src/
│   └── main/
│       ├── java/com/silvercare/
│       │   ├── entity/          # Data entities
│       │   ├── mapper/          # MyBatis mappers
│       │   ├── service/         # Business logic
│       │   ├── controller/      # API controllers
│       │   ├── config/          # Configuration
│       │   ├── filter/          # Filters
│       │   └── websocket/       # WebSocket handlers
│       └── resources/
│           ├── application.yml  # App config
│           └── schema.sql       # Database schema
├── frontend/
│   ├── src/
│   │   ├── views/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── api/                 # API services
│   │   ├── store/               # Pinia stores
│   │   ├── router/              # Vue Router
│   │   └── utils/               # Utilities
│   ├── package.json
│   └── vite.config.js
├── pom.xml
├── docker-compose.yml
├── Dockerfile
└── start.bat/start.sh
```

## Database Schema
- user: User accounts and profiles
- room: Room information and availability
- service_package: Healthcare service packages
- booking: Reservation records
- health_data: Health tracking data
- payment: Payment transactions
- chat_message: Chat messages

## Initialization
The system automatically initializes:
1. Database tables (SQLite)
2. Default test accounts
3. Sample rooms (20 rooms, 4 types)
4. Sample service packages (5 packages)
