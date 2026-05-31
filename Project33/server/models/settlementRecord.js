const { run, get, all } = require('../config/database');

class SettlementRecord {
  static async create(settlementData) {
    return run(
      `INSERT INTO settlement_records (transaction_id, settlement_currency, settlement_amount, settlement_status)
      VALUES (?, ?, ?, ?)`,
      [
        settlementData.transaction_id,
        settlementData.settlement_currency,
        settlementData.settlement_amount,
        settlementData.settlement_status || 'pending'
      ]
    );
  }

  static async findById(id) {
    return get(`
      SELECT sr.*, t.*, u.username, u.real_name
      FROM settlement_records sr
      LEFT JOIN transactions t ON sr.transaction_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE sr.id = ?
    `, [id]);
  }

  static async findByTransactionId(transaction_id) {
    return all('SELECT * FROM settlement_records WHERE transaction_id = ?', [transaction_id]);
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT sr.*, t.amount, t.from_currency, t.to_currency, t.user_id, u.username, u.real_name
      FROM settlement_records sr
      LEFT JOIN transactions t ON sr.transaction_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.settlement_status) {
      query += ' AND sr.settlement_status = ?';
      params.push(filters.settlement_status);
    }

    query += ' ORDER BY sr.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 50, filters.offset || 0);

    return all(query, params);
  }

  static async updateStatus(id, status) {
    return run(`
      UPDATE settlement_records 
      SET settlement_status = ?, settled_at = CASE WHEN ? = 'settled' THEN CURRENT_TIMESTAMP ELSE settled_at END
      WHERE id = ?
    `, [status, status, id]);
  }

  static async getStatistics() {
    return get(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN settlement_status = 'settled' THEN 1 ELSE 0 END) as settled_count,
        SUM(CASE WHEN settlement_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN settlement_status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(settlement_amount) as total_settlement_amount
      FROM settlement_records
    `, []);
  }
}

module.exports = SettlementRecord;