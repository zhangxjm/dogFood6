const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { initDatabase } = require('./database');
const { router: authRoutes } = require('./routes/auth');
const trainingRoutes = require('./routes/training');
const sessionRoutes = require('./routes/session');
const collaborativeRoutes = require('./routes/collaborative');
const achievementRoutes = require('./routes/achievement');
const { handleWebSocketConnection } = require('./websocket/handler');

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
  await initDatabase();

  app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/training', trainingRoutes);
  app.use('/api/session', sessionRoutes);
  app.use('/api/collaborative', collaborativeRoutes);
  app.use('/api/achievement', achievementRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server, path: '/ws' });

  const rooms = new Map();

  wss.on('connection', (ws, req) => {
    handleWebSocketConnection(ws, req, rooms);
  });

  server.listen(PORT, () => {
    console.log(`[SERVER] Metaverse Training Platform running on port ${PORT}`);
    console.log(`[SERVER] WebSocket server ready at ws://localhost:${PORT}/ws`);
  });

  process.on('SIGINT', () => {
    console.log('[SERVER] Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer().catch(err => {
  console.error('[SERVER] Failed to start server:', err);
  process.exit(1);
});
