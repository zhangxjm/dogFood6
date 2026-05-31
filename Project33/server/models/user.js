const { run, get, all } = require('../config/database');

class User {
  static async create(userData) {
    const result = await run(
      'INSERT INTO users (username, password, real_name, phone, email, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userData.username, userData.password, userData.real_name, userData.phone || null, userData.email || null, userData.status || 'active']
    );
    return result;
  }

  static async findById(id) {
    return get('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async findByUsername(username) {
    return get('SELECT * FROM users WHERE username = ?', [username]);
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY created_at DESC';
    return all(query, params);
  }

  static async update(id, userData) {
    const fields = [];
    const params = [];
    
    if (userData.real_name !== undefined) {
      fields.push('real_name = ?');
      params.push(userData.real_name);
    }
    if (userData.phone !== undefined) {
      fields.push('phone = ?');
      params.push(userData.phone);
    }
    if (userData.email !== undefined) {
      fields.push('email = ?');
      params.push(userData.email);
    }
    if (userData.status !== undefined) {
      fields.push('status = ?');
      params.push(userData.status);
    }
    
    if (fields.length === 0) return null;
    
    params.push(id);
    return run(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
  }
}

module.exports = User;
