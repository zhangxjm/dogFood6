const { run, get, all } = require('../config/database');

class RiskAlert {
  static async create(alertData) {
    return run(
      `INSERT INTO risk_alerts (transaction_id, rule_id, alert_type, alert_level, description)
      VALUES (?, ?, ?, ?, ?)`,
      [
        alertData.transaction_id,
        alertData.rule_id || null,
        alertData.alert_type,
        alertData.alert_level || 'warning',
        alertData.description || null
      ]
    );
  }

  static async findById(id) {
    return get(`
      SELECT ra.*, t.amount, t.from_currency, t.to_currency, t.user_id, u.username, u.real_name, rr.rule_name
      FROM risk_alerts ra
      LEFT JOIN transactions t ON ra.transaction_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN risk_rules rr ON ra.rule_id = rr.id
      WHERE ra.id = ?
    `, [id]);
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT ra.*, t.amount, t.from_currency, t.to_currency, t.user_id, u.username, u.real_name, rr.rule_name
      FROM risk_alerts ra
      LEFT JOIN transactions t ON ra.transaction_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN risk_rules rr ON ra.rule_id = rr.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.is_resolved !== undefined) {
      query += ' AND ra.is_resolved = ?';
      params.push(filters.is_resolved ? 1 : 0);
    }
    if (filters.alert_level) {
      query += ' AND ra.alert_level = ?';
      params.push(filters.alert_level);
    }

    query += ' ORDER BY ra.created_at DESC LIMIT ? OFFSET ?';
    params.push(filters.limit || 50, filters.offset || 0);

    return all(query, params);
  }

  static async resolve(id) {
    return run(`
      UPDATE risk_alerts 
      SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);
  }

  static async getStatistics() {
    return get(`
      SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN is_resolved = 0 THEN 1 ELSE 0 END) as unresolved_alerts,
        SUM(CASE WHEN alert_level = 'critical' THEN 1 ELSE 0 END) as critical_alerts,
        SUM(CASE WHEN alert_level = 'high' THEN 1 ELSE 0 END) as high_alerts,
        SUM(CASE WHEN alert_level = 'medium' THEN 1 ELSE 0 END) as medium_alerts,
        SUM(CASE WHEN alert_level = 'warning' THEN 1 ELSE 0 END) as warning_alerts
      FROM risk_alerts
    `, []);
  }
}

module.exports = RiskAlert;