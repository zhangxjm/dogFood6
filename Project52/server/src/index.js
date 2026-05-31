const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/init');

const experimentsRouter = require('./routes/experiments');
const dataRouter = require('./routes/data');
const devicesRouter = require('./routes/devices');
const parsingRouter = require('./routes/parsing');
const reportsRouter = require('./routes/reports');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/reports', express.static(path.join(__dirname, '..', 'reports')));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api/experiments', experimentsRouter);
app.use('/api/data', dataRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/parsing', parsingRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'Server is running', data: { timestamp: new Date().toISOString() } });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ code: 1, message: `Server error: ${err.message}`, data: null });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`  Aerospace Payload Test Data System`);
      console.log(`  Server running on http://localhost:${PORT}`);
      console.log(`  API Health: http://localhost:${PORT}/api/health`);
      console.log(`========================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
