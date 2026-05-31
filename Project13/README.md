# Metaverse Virtual Exhibition System

## Overview

An immersive metaverse virtual exhibition system built with NestJS (backend) and Next.js (frontend), featuring:

- 3D virtual exhibition hall with interactive booths
- Real-time multiplayer experience via Socket.io
- Digital NFT collection and redemption system
- WebRTC-based video/audio chat
- Customizable virtual avatars
- SQLite database for data persistence

## Tech Stack

### Backend
- NestJS 10.x
- Socket.io 4.x
- better-sqlite3
- TypeScript

### Frontend
- Next.js 14.x
- React 18.x
- Three.js + React Three Fiber
- Socket.io Client
- TailwindCSS
- TypeScript

## Quick Start

### Prerequisites
- Node.js 20+
- npm

### Option 1: Production Mode (Recommended)
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### Option 2: Development Mode
```bash
# Windows
start-dev.bat

# Or manually:
cd server
npm install
npm run start:dev

# In another terminal:
cd client
npm install
npm run dev
```

### Option 3: Docker
```bash
# Windows
start-docker.bat

# Or manually:
docker-compose up --build
```

## Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Demo Accounts

The system auto-initializes with demo data:

| Username       | Avatar Style | Color   |
|---------------|--------------|---------|
| demo_user_01  | robot        | #4A90D9 |
| demo_user_02  | human        | #D94A4A |
| demo_user_03  | alien        | #4AD974 |

## Features

### Virtual Exhibition Hall
- 3D interactive environment using Three.js
- Multiple exhibition booths with themes
- Real-time user presence tracking
- Chat system

### Booth Customization
- Customize booth colors and themes
- Configure booth description
- Real-time updates

### NFT Collection
- Mint digital collectibles
- Rarity levels (legendary, epic, rare, common)
- Collection management
- Limited supply tracking

### Multiplayer Features
- Real-time position synchronization
- Avatar rendering for all users
- Public and private chat
- WebRTC video/audio support

## API Endpoints

### Exhibitions
- `GET /exhibitions` - List all exhibitions
- `GET /exhibitions/:id` - Get exhibition details
- `POST /exhibitions` - Create exhibition
- `PUT /exhibitions/:id` - Update exhibition
- `DELETE /exhibitions/:id` - Delete exhibition

### Booths
- `GET /booths` - List all booths
- `GET /booths?exhibitionId=:id` - List booths by exhibition
- `GET /booths/:id` - Get booth details
- `POST /booths` - Create booth
- `PUT /booths/:id` - Update booth
- `PUT /booths/:id/customize` - Customize booth
- `DELETE /booths/:id` - Delete booth

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `POST /users/login` - Login
- `PUT /users/:id` - Update user
- `PUT /users/:id/avatar` - Update avatar
- `GET /users/:id/nfts` - Get user NFTs
- `DELETE /users/:id` - Delete user

### NFTs
- `GET /nfts` - List all NFTs
- `GET /nfts?boothId=:id` - List NFTs by booth
- `GET /nfts/:id` - Get NFT details
- `POST /nfts` - Create NFT
- `POST /nfts/mint` - Mint NFT
- `PUT /nfts/:id` - Update NFT
- `DELETE /nfts/:id` - Delete NFT

## Project Structure

```
Project13/
├── server/                    # NestJS Backend
│   ├── src/
│   │   ├── main.ts           # Entry point
│   │   ├── app.module.ts     # App module
│   │   ├── database/         # SQLite module
│   │   ├── exhibition/       # Exhibition module
│   │   ├── booth/            # Booth module
│   │   ├── user/             # User module
│   │   ├── nft/              # NFT module
│   │   ├── avatar/           # Avatar sync module
│   │   └── webrtc/           # WebRTC module
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── client/                    # Next.js Frontend
│   ├── src/
│   │   ├── pages/            # Next.js pages
│   │   │   ├── login.tsx
│   │   │   ├── index.tsx
│   │   │   ├── exhibition.tsx
│   │   │   ├── booth/[id].tsx
│   │   │   └── nft.tsx
│   │   ├── styles/           # Global styles
│   │   └── utils/            # Utilities
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
├── start.bat                 # Windows start script
├── start.sh                  # Linux/Mac start script
├── start-dev.bat             # Dev mode start script
└── start-docker.bat          # Docker start script
```

## Database Schema

### users
- id (INTEGER, PRIMARY KEY)
- username (TEXT, UNIQUE)
- avatar_data (TEXT, JSON)
- created_at (DATETIME)

### exhibitions
- id (INTEGER, PRIMARY KEY)
- name (TEXT)
- description (TEXT)
- start_date (DATETIME)
- end_date (DATETIME)
- status (TEXT)
- created_at (DATETIME)

### booths
- id (INTEGER, PRIMARY KEY)
- exhibition_id (INTEGER, FK)
- name (TEXT)
- owner_id (INTEGER, FK)
- position_x, position_y, position_z (REAL)
- rotation (REAL)
- theme (TEXT)
- custom_data (TEXT, JSON)
- status (TEXT)
- created_at (DATETIME)

### nfts
- id (INTEGER, PRIMARY KEY)
- booth_id (INTEGER, FK)
- name (TEXT)
- description (TEXT)
- image_url (TEXT)
- metadata (TEXT, JSON)
- total_supply (INTEGER)
- minted_count (INTEGER)
- created_at (DATETIME)

### user_nfts
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FK)
- nft_id (INTEGER, FK)
- minted_at (DATETIME)

## License

MIT
