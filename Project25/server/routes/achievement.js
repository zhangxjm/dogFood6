const express = require('express');
const { query, queryOne } = require('../database');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const achievements = query(`
    SELECT a.*, ts.module_id, tm.name as module_name
    FROM achievements a
    JOIN training_sessions ts ON a.session_id = ts.id
    JOIN training_modules tm ON ts.module_id = tm.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT 50
  `, [req.user.id]);

  res.json({ achievements });
});

router.get('/leaderboard', authMiddleware, (req, res) => {
  const { module_id, limit = 10 } = req.query;

  let sql = `
    SELECT u.id, u.username, u.display_name, u.avatar,
           COUNT(CASE WHEN ts.status = 'completed' THEN 1 END) as completed_count,
           AVG(CASE WHEN ts.status = 'completed' THEN ts.score END) as avg_score,
           MAX(CASE WHEN ts.status = 'completed' THEN ts.score END) as best_score
    FROM users u
    LEFT JOIN training_sessions ts ON u.id = ts.user_id
    LEFT JOIN training_modules tm ON ts.module_id = tm.id
    WHERE u.role = 'student'
  `;
  const params = [];

  if (module_id) {
    sql += ' AND tm.id = ?';
    params.push(module_id);
  }

  sql += ' GROUP BY u.id HAVING completed_count > 0 ORDER BY avg_score DESC LIMIT ?';
  params.push(parseInt(limit));

  const leaderboard = query(sql, params);

  res.json({ leaderboard });
});

router.get('/:id', authMiddleware, (req, res) => {
  const achievement = queryOne(`
    SELECT a.*, ts.module_id, tm.name as module_name, tm.category as module_category
    FROM achievements a
    JOIN training_sessions ts ON a.session_id = ts.id
    JOIN training_modules tm ON ts.module_id = tm.id
    WHERE a.id = ? AND a.user_id = ?
  `, [req.params.id, req.user.id]);

  if (!achievement) {
    return res.status(404).json({ error: '成就不存在' });
  }

  res.json({ achievement });
});

module.exports = router;
