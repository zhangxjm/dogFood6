const express = require('express');
const cors = require('cors');
const path = require('path');
const initDatabase = require('./models/init');
const { get, all } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3034;

initDatabase().then(() => {
  console.log('Database initialization completed');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/risk', require('./routes/riskControl'));
app.use('/api/settlements', require('./routes/settlement'));
app.use('/api/exchange-rates', require('./routes/exchangeRate'));
app.use('/api/seata', require('./routes/seata'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cross-border Payment Risk Control System is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    const accountCount = await get('SELECT COUNT(*) as count FROM accounts');
    const transactionStats = await get(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN is_blocked = 1 THEN 1 ELSE 0 END) as blocked_count,
        SUM(amount) as total_amount,
        AVG(risk_score) as avg_risk_score
      FROM transactions
    `);
    const alertStats = await get(`
      SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN is_resolved = 0 THEN 1 ELSE 0 END) as unresolved_alerts,
        SUM(CASE WHEN alert_level = 'critical' THEN 1 ELSE 0 END) as critical_alerts
      FROM risk_alerts
    `);
    const settlementStats = await get(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN settlement_status = 'settled' THEN 1 ELSE 0 END) as settled_count,
        SUM(CASE WHEN settlement_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(settlement_amount) as total_settlement_amount
      FROM settlement_records
    `);
    
    const recentTransactions = await all(`
      SELECT t.*, u.username, u.real_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    const recentAlerts = await all(`
      SELECT ra.*, t.amount, t.from_currency, t.to_currency, u.username
      FROM risk_alerts ra
      LEFT JOIN transactions t ON ra.transaction_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY ra.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        users: { total: userCount.count },
        accounts: { total: accountCount.count },
        transactions: transactionStats,
        alerts: alertStats,
        settlements: settlementStats,
        recent_transactions: recentTransactions,
        recent_alerts: recentAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Cross-border Payment Risk Control System`);
  console.log(`  Server running on port: ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});

module.exports = app;
