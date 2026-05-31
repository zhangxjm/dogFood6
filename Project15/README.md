# Silver Hair Intelligent Wearable Health Monitoring Platform

## Introduction

A full-stack health monitoring system for elderly care, featuring:

- **Backend**: Java Spring Boot 3.2 with SQLite database
- **Frontend**: Svelte 4 with WebSocket real-time updates
- **IoT Integration**: Bluetooth wearable device simulation
- **Health Monitoring**: Heart rate, blood oxygen, temperature tracking
- **Alert System**: Automatic abnormal health alerts
- **Emergency Call**: Quick emergency contact system
- **Data Security**: Medical data desensitization
- **Real-time Communication**: WebSocket for live data updates

## Architecture

```
Project15/
├── backend/           # Spring Boot backend
│   ├── src/main/java/com/eldercare/
│   │   ├── controller/    # REST API controllers
│   │   ├── service/       # Business logic
│   │   ├── entity/        # Database entities
│   │   ├── repository/  # Data access layer
│   │   ├── dto/         # Data transfer objects
│   │   ├── config/      # Configuration classes
│   │   └── ElderCareApplication.java
│   └── pom.xml
├── frontend/          # Svelte frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/        # Page components
│   │   ├── styles/       # CSS styles
│   │   ├── store.js      # State management
│   │   ├── App.svelte   # Main app component
│   │   └── main.js       # Entry point
│   └── package.json
├── docker-compose.yml   # MQTT broker
├── start.bat          # Windows startup script
├── start.sh           # Linux/Mac startup script
└── stop.bat           # Stop services script
```

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+
- Docker (optional, for MQTT broker)

### Windows

```cmd
start.bat
```

### Linux/Mac

```bash
chmod +x start.sh
./start.sh
```

### Manual Start

#### Backend

```bash
cd backend
mvn spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Access URLs

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **WebSocket**: ws://localhost:8080/ws

## API Endpoints

### Elderly Management
- `GET /api/elderly` - List all elderly persons
- `POST /api/elderly` - Add elderly person
- `PUT /api/elderly/{id}` - Update elderly person
- `DELETE /api/elderly/{id}` - Delete elderly person

### Health Data
- `GET /api/health/elderly/{id}` - Get health data for elderly
- `GET /api/health/elderly/{id}/latest` - Get latest health data

### Alerts
- `GET /api/alerts/elderly/{id}` - Get alerts for elderly
- `GET /api/alerts/pending` - Get pending alerts
- `POST /api/alerts/{id}/handle` - Handle alert

### Emergency Calls
- `GET /api/emergency/elderly/{id}` - Get emergency calls
- `GET /api/emergency/pending` - Get pending calls
- `POST /api/emergency` - Create emergency call
- `POST /api/emergency/{id}/handle` - Handle call

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Add device
- `PUT /api/devices/{id}` - Update device
- `DELETE /api/devices/{id}` - Delete device

### IoT Simulation
- `POST /api/iot/simulation/start` - Start simulation
- `POST /api/iot/simulation/stop` - Stop simulation
- `GET /api/iot/simulation/status` - Get simulation status

## WebSocket Topics

- `/topic/health` - Real-time health data
- `/topic/alerts` - Alert notifications
- `/topic/emergency` - Emergency call notifications
- `/topic/devices` - Device status updates

## Features

### Health Monitoring
- Real-time heart rate tracking (60-100 bpm normal range)
- Blood oxygen monitoring (95%+ normal range)
- Temperature tracking (36.0-37.5°C normal range)
- Blood pressure monitoring
- Step counting
- Sleep quality tracking

### Alert System
- Automatic abnormal value detection
- Multi-level alerts (CRITICAL, WARNING)
- Real-time notification via WebSocket
- Alert handling and resolution tracking

### Emergency Call
- One-click emergency call
- Auto-notify family members
- Call handling workflow

### Data Security
- Name masking (张**
- Phone number masking (138****5678)
- ID card masking
- Address masking

### IoT Integration
- Bluetooth device simulation
- Real-time data collection
- Low power communication
- Device status monitoring

## Default Data

The system initializes with sample data:

- 3 elderly persons
- 4 family members
- 3 wearable devices
- 3 health data records

## Configuration

### Backend Configuration (application.yml)

```yaml
server:
  port: 8080

eldercare:
  health:
    heart-rate:
      min-normal: 60
      max-normal: 100
      critical-low: 40
      critical-high: 140
    blood-oxygen:
      min-normal: 95
      critical-low: 90
    temperature:
      min-normal: 36.0
      max-normal: 37.5
      critical-low: 35.0
      critical-high: 39.0
  desensitization:
    name-mask: true
    phone-mask: true
    id-card-mask: true
    address-mask: true
```

## Technologies

### Backend
- Spring Boot 3.2.5
- Spring Data JPA
- Spring WebSocket
- Spring Security
- SQLite Database
- Hibernate ORM

### Frontend
- Svelte 4
- SockJS
- STOMP.js
- Vite

### Infrastructure
- MQTT Broker (Eclipse Mosquitto)
- Docker

## License

MIT License
