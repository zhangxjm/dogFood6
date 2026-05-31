const express = require('express');
const cors = require('cors');
const path = require('path');
const initDatabase = require('./src/db');
const orderRoutes = require('./src/routes/orders');
const reviewRoutes = require('./src/routes/reviews');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  const dbPath = path.join(__dirname, 'unlock_service.db');
  const db = await initDatabase(dbPath);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  app.get('/api/stats', async (req, res) => {
    try {
      const total = await req.db.get('SELECT COUNT(*) as count FROM orders');
      const pending = await req.db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
      const inProgress = await req.db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'in_progress'");
      const completed = await req.db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'completed'");
      const reviewed = await req.db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'completed' AND rating IS NOT NULL AND rating > 0");
      res.json({
        total: total.count,
        pending: pending.count,
        inProgress: inProgress.count,
        completed: completed.count,
        reviewed: reviewed.count
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
