const express = require('express');
const { query, queryOne, execute, executeAndGetLastId } = require('../database');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.post('/start', authMiddleware, (req, res) => {
  const { module_id } = req.body;

  if (!module_id) {
    return res.status(400).json({ error: '请选择实训模块' });
  }

  const module = queryOne('SELECT * FROM training_modules WHERE id = ?', [module_id]);

  if (!module) {
    return res.status(404).json({ error: '实训模块不存在' });
  }

  const lastId = executeAndGetLastId(
    'INSERT INTO training_sessions (user_id, module_id, status, start_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [req.user.id, module_id, 'in_progress']
  );

  const session = queryOne(`
    SELECT ts.*, tm.name as module_name, tm.category as module_category, tm.difficulty as module_difficulty
    FROM training_sessions ts
    JOIN training_modules tm ON ts.module_id = tm.id
    WHERE ts.id = ?
  `, [lastId]);

  res.status(201).json({ session });
});

router.post('/:id/complete', authMiddleware, (req, res) => {
  const { data_record, score, operations_count, error_count } = req.body;
  const sessionId = req.params.id;

  const session = queryOne('SELECT * FROM training_sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id]);

  if (!session) {
    return res.status(404).json({ error: '实训记录不存在' });
  }

  if (session.status === 'completed') {
    return res.status(400).json({ error: '实训已完成' });
  }

  const module = queryOne('SELECT max_score FROM training_modules WHERE id = ?', [session.module_id]);
  const finalScore = Math.min(Math.max(score || 0, 0), module.max_score);

  execute(
    'UPDATE training_sessions SET status = ?, end_time = CURRENT_TIMESTAMP, score = ?, data_record = ?, operations_count = ?, error_count = ? WHERE id = ?',
    ['completed', finalScore, JSON.stringify(data_record || {}), operations_count || 0, error_count || 0, sessionId]
  );

  if (finalScore >= 90) {
    const title = finalScore === 100 ? '完美通关' : '优秀表现';
    const description = finalScore === 100 ? '以满分完成实训，表现完美！' : '以优异成绩完成实训，继续保持！';

    execute(
      'INSERT INTO achievements (user_id, session_id, title, description, score) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, sessionId, title, description, finalScore]
    );
  }

  const updatedSession = queryOne('SELECT * FROM training_sessions WHERE id = ?', [sessionId]);
  updatedSession.data_record = JSON.parse(updatedSession.data_record || '{}');

  res.json({ session: updatedSession });
});

router.post('/:id/log', authMiddleware, (req, res) => {
  const { operation_type, operation_data, is_correct } = req.body;
  const sessionId = req.params.id;

  const session = queryOne('SELECT * FROM training_sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id]);

  if (!session) {
    return res.status(404).json({ error: '实训记录不存在' });
  }

  const logId = executeAndGetLastId(
    'INSERT INTO operation_logs (session_id, user_id, operation_type, operation_data, is_correct) VALUES (?, ?, ?, ?, ?)',
    [sessionId, req.user.id, operation_type, JSON.stringify(operation_data || {}), is_correct !== false ? 1 : 0]
  );

  const currentOps = session.operations_count + 1;
  const currentErrors = session.error_count + (is_correct === false ? 1 : 0);

  execute(
    'UPDATE training_sessions SET operations_count = ?, error_count = ? WHERE id = ?',
    [currentOps, currentErrors, sessionId]
  );

  res.json({ log_id: logId });
});

router.get('/', authMiddleware, (req, res) => {
  const { module_id, status, limit = 20, offset = 0 } = req.query;

  let sql = `
    SELECT ts.*, tm.name as module_name, tm.category as module_category
    FROM training_sessions ts
    JOIN training_modules tm ON ts.module_id = tm.id
    WHERE ts.user_id = ?
  `;
  const params = [req.user.id];

  if (module_id) {
    sql += ' AND ts.module_id = ?';
    params.push(module_id);
  }

  if (status) {
    sql += ' AND ts.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY ts.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const sessions = query(sql, params).map(s => ({
    ...s,
    data_record: JSON.parse(s.data_record || '{}')
  }));

  const totalResult = queryOne('SELECT COUNT(*) as count FROM training_sessions WHERE user_id = ?', [req.user.id]);

  res.json({ sessions, total: totalResult ? totalResult.count : 0 });
});

router.get('/:id', authMiddleware, (req, res) => {
  const session = queryOne(`
    SELECT ts.*, tm.name as module_name, tm.category as module_category, tm.difficulty as module_difficulty,
           tm.scene_config, u.display_name as user_name
    FROM training_sessions ts
    JOIN training_modules tm ON ts.module_id = tm.id
    JOIN users u ON ts.user_id = u.id
    WHERE ts.id = ? AND ts.user_id = ?
  `, [req.params.id, req.user.id]);

  if (!session) {
    return res.status(404).json({ error: '实训记录不存在' });
  }

  session.data_record = JSON.parse(session.data_record || '{}');
  session.scene_config = JSON.parse(session.scene_config || '{}');

  const logs = query('SELECT * FROM operation_logs WHERE session_id = ? ORDER BY timestamp ASC', [req.params.id]);
  session.logs = logs.map(log => ({
    ...log,
    operation_data: JSON.parse(log.operation_data || '{}')
  }));

  res.json({ session });
});

router.get('/stats/overview', authMiddleware, (req, res) => {
  const stats = queryOne(`
    SELECT 
      COUNT(*) as total_sessions,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
      AVG(CASE WHEN status = 'completed' THEN score END) as avg_score,
      SUM(operations_count) as total_operations,
      SUM(error_count) as total_errors
    FROM training_sessions 
    WHERE user_id = ?
  `, [req.user.id]);

  const categoryStats = query(`
    SELECT tm.category, COUNT(ts.id) as count, AVG(CASE WHEN ts.status = 'completed' THEN ts.score END) as avg_score
    FROM training_sessions ts
    JOIN training_modules tm ON ts.module_id = tm.id
    WHERE ts.user_id = ?
    GROUP BY tm.category
  `, [req.user.id]);

  res.json({ stats: stats || {}, categoryStats });
});

module.exports = router;
