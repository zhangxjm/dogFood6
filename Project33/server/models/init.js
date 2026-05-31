const { run, get, all } = require('../config/database');

const initDatabase = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      real_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      currency TEXT NOT NULL,
      balance REAL DEFAULT 0,
      frozen_amount REAL DEFAULT 0,
      account_type TEXT DEFAULT 'normal',
      risk_level TEXT DEFAULT 'low',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      from_account_id INTEGER,
      to_account_id INTEGER,
      from_currency TEXT NOT NULL,
      to_currency TEXT NOT NULL,
      amount REAL NOT NULL,
      converted_amount REAL,
      exchange_rate REAL,
      fee REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      transaction_type TEXT NOT NULL,
      payment_method TEXT,
      third_party_trade_id TEXT,
      risk_score REAL DEFAULT 0,
      risk_level TEXT DEFAULT 'low',
      risk_details TEXT,
      is_blocked INTEGER DEFAULT 0,
      block_reason TEXT,
      seata_xid TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_currency TEXT NOT NULL,
      to_currency TEXT NOT NULL,
      rate REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS risk_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_name TEXT NOT NULL,
      rule_type TEXT NOT NULL,
      condition TEXT NOT NULL,
      threshold REAL,
      action TEXT DEFAULT 'block',
      priority INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS risk_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      rule_id INTEGER,
      alert_type TEXT NOT NULL,
      alert_level TEXT DEFAULT 'warning',
      description TEXT,
      is_resolved INTEGER DEFAULT 0,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (rule_id) REFERENCES risk_rules(id)
    );

    CREATE TABLE IF NOT EXISTS settlement_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      settlement_currency TEXT NOT NULL,
      settlement_amount REAL NOT NULL,
      settlement_status TEXT DEFAULT 'pending',
      settled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );

    CREATE TABLE IF NOT EXISTS compliance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      transaction_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );

    CREATE TABLE IF NOT EXISTS third_party_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      payment_channel TEXT NOT NULL,
      channel_trade_id TEXT,
      request_data TEXT,
      response_data TEXT,
      status TEXT DEFAULT 'pending',
      callback_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );

    CREATE TABLE IF NOT EXISTS seata_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      xid TEXT UNIQUE NOT NULL,
      transaction_id TEXT,
      status TEXT DEFAULT 'begin',
      branch_id TEXT,
      resource_id TEXT,
      application_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const statements = sql.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    await run(stmt);
  }

  console.log('Database tables initialized successfully');
};

module.exports = initDatabase;
