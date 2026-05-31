const { run, get, all } = require('../config/database');

class RiskRule {
  static async create(ruleData) {
    return run(
      `INSERT INTO risk_rules (rule_name, rule_type, condition, threshold, action, priority, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ruleData.rule_name,
        ruleData.rule_type,
        ruleData.condition,
        ruleData.threshold || null,
        ruleData.action || 'block',
        ruleData.priority || 0,
        ruleData.description || null
      ]
    );
  }

  static async findById(id) {
    return get('SELECT * FROM risk_rules WHERE id = ?', [id]);
  }

  static async findAll(activeOnly = true) {
    let query = 'SELECT * FROM risk_rules';
    const params = [];
    if (activeOnly) {
      query += ' WHERE is_active = ?';
      params.push(1);
    }
    query += ' ORDER BY priority DESC, id ASC';
    return all(query, params);
  }

  static async update(id, ruleData) {
    const fields = [];
    const params = [];

    if (ruleData.rule_name !== undefined) {
      fields.push('rule_name = ?');
      params.push(ruleData.rule_name);
    }
    if (ruleData.condition !== undefined) {
      fields.push('condition = ?');
      params.push(ruleData.condition);
    }
    if (ruleData.threshold !== undefined) {
      fields.push('threshold = ?');
      params.push(ruleData.threshold);
    }
    if (ruleData.action !== undefined) {
      fields.push('action = ?');
      params.push(ruleData.action);
    }
    if (ruleData.priority !== undefined) {
      fields.push('priority = ?');
      params.push(ruleData.priority);
    }
    if (ruleData.is_active !== undefined) {
      fields.push('is_active = ?');
      params.push(ruleData.is_active ? 1 : 0);
    }

    if (fields.length === 0) return null;

    params.push(id);
    return run(`UPDATE risk_rules SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    return run('DELETE FROM risk_rules WHERE id = ?', [id]);
  }
}

module.exports = RiskRule;