const { run, get, all } = require('../config/database');

class SeataTransaction {
  static async create(xid, transaction_id, status = 'begin') {
    return run(
      `INSERT INTO seata_transactions (xid, transaction_id, status)
      VALUES (?, ?, ?)`,
      [xid, transaction_id, status]
    );
  }

  static async findByXid(xid) {
    return get('SELECT * FROM seata_transactions WHERE xid = ?', [xid]);
  }

  static async findByTransactionId(transaction_id) {
    return get('SELECT * FROM seata_transactions WHERE transaction_id = ?', [transaction_id]);
  }

  static async updateStatus(xid, status) {
    return run('UPDATE seata_transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE xid = ?', [status, xid]);
  }

  static generateXid() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `seata_xid_${timestamp}_${random}`;
  }

  static async begin(transaction_id) {
    const xid = this.generateXid();
    await this.create(xid, transaction_id, 'begin');
    return xid;
  }

  static async commit(xid) {
    return this.updateStatus(xid, 'committed');
  }

  static async rollback(xid) {
    return this.updateStatus(xid, 'rollback');
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM seata_transactions WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 50, filters.offset || 0);

    return all(query, params);
  }
}

module.exports = SeataTransaction;