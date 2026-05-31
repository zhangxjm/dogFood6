const { run, get, all } = require('../config/database');

class Transaction {
  static async create(transactionData) {
    return run(
      `INSERT INTO transactions (id, user_id, from_account_id, to_account_id, from_currency, to_currency, 
        amount, converted_amount, exchange_rate, fee, status, transaction_type, payment_method, seata_xid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionData.id,
        transactionData.user_id,
        transactionData.from_account_id || null,
        transactionData.to_account_id || null,
        transactionData.from_currency,
        transactionData.to_currency,
        transactionData.amount,
        transactionData.converted_amount || null,
        transactionData.exchange_rate || null,
        transactionData.fee || 0,
        transactionData.status || 'pending',
        transactionData.transaction_type,
        transactionData.payment_method || null,
        transactionData.seata_xid || null
      ]
    );
  }

  static async findById(id) {
    return get(`
      SELECT t.*, u.username, u.real_name 
      FROM transactions t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.id = ?
    `, [id]);
  }

  static async findByUserId(user_id, filters = {}) {
    let query = `
      SELECT t.*, u.username, u.real_name 
      FROM transactions t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.user_id = ?
    `;
    const params = [user_id];

    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    if (filters.transaction_type) {
      query += ' AND t.transaction_type = ?';
      params.push(filters.transaction_type);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 20, filters.offset || 0);

    return all(query, params);
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, u.username, u.real_name 
      FROM transactions t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    if (filters.transaction_type) {
      query += ' AND t.transaction_type = ?';
      params.push(filters.transaction_type);
    }
    if (filters.is_blocked !== undefined) {
      query += ' AND t.is_blocked = ?';
      params.push(filters.is_blocked ? 1 : 0);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 50, filters.offset || 0);

    return all(query, params);
  }

  static async updateStatus(id, status) {
    return run('UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  }

  static async updateRiskInfo(id, risk_score, risk_level, risk_details) {
    return run(`
      UPDATE transactions 
      SET risk_score = ?, risk_level = ?, risk_details = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [risk_score, risk_level, risk_details ? JSON.stringify(risk_details) : null, id]);
  }

  static async blockTransaction(id, block_reason) {
    return run(`
      UPDATE transactions 
      SET is_blocked = 1, block_reason = ?, status = 'blocked', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [block_reason, id]);
  }

  static async unblockTransaction(id) {
    return run(`
      UPDATE transactions 
      SET is_blocked = 0, block_reason = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);
  }

  static async updateSeataXid(id, seata_xid) {
    return run('UPDATE transactions SET seata_xid = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [seata_xid, id]);
  }

  static async updateThirdPartyTradeId(id, third_party_trade_id) {
    return run('UPDATE transactions SET third_party_trade_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [third_party_trade_id, id]);
  }

  static async getStatistics() {
    return get(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN is_blocked = 1 THEN 1 ELSE 0 END) as blocked_count,
        SUM(amount) as total_amount,
        AVG(risk_score) as avg_risk_score
      FROM transactions
    `, []);
  }

  static async getByDateRange(startDate, endDate) {
    return all(`
      SELECT * FROM transactions 
      WHERE created_at BETWEEN ? AND ?
      ORDER BY created_at DESC
    `, [startDate, endDate]);
  }
}

module.exports = Transaction;