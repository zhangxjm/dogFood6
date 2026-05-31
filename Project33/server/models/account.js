const { run, get, all } = require('../config/database');

class Account {
  static async create(accountData) {
    return run(
      'INSERT INTO accounts (user_id, currency, balance, account_type, risk_level) VALUES (?, ?, ?, ?, ?)',
      [accountData.user_id, accountData.currency, accountData.balance || 0, accountData.account_type || 'normal', accountData.risk_level || 'low']
    );
  }

  static async findById(id) {
    return get('SELECT * FROM accounts WHERE id = ?', [id]);
  }

  static async findByUserId(user_id) {
    return all('SELECT * FROM accounts WHERE user_id = ? ORDER BY currency', [user_id]);
  }

  static async findByUserAndCurrency(user_id, currency) {
    return get('SELECT * FROM accounts WHERE user_id = ? AND currency = ?', [user_id, currency]);
  }

  static async updateBalance(id, newBalance) {
    return run('UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newBalance, id]);
  }

  static async freezeAmount(id, amount) {
    return run('UPDATE accounts SET frozen_amount = frozen_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [amount, id]);
  }

  static async unfreezeAmount(id, amount) {
    return run('UPDATE accounts SET frozen_amount = frozen_amount - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [amount, id]);
  }

  static async deductFromFrozen(id, amount) {
    return run(
      'UPDATE accounts SET balance = balance - ?, frozen_amount = frozen_amount - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND frozen_amount >= ? AND balance >= ?',
      [amount, amount, id, amount, amount]
    );
  }

  static async addBalance(id, amount) {
    return run('UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [amount, id]);
  }

  static async deductBalance(id, amount) {
    return run('UPDATE accounts SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND balance >= ?', [amount, id, amount]);
  }

  static async updateRiskLevel(id, risk_level) {
    return run('UPDATE accounts SET risk_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [risk_level, id]);
  }

  static async findAll(filters = {}) {
    let query = 'SELECT a.*, u.username, u.real_name FROM accounts a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
    const params = [];
    
    if (filters.risk_level) {
      query += ' AND a.risk_level = ?';
      params.push(filters.risk_level);
    }
    if (filters.currency) {
      query += ' AND a.currency = ?';
      params.push(filters.currency);
    }
    
    query += ' ORDER BY a.created_at DESC';
    return all(query, params);
  }
}

module.exports = Account;
