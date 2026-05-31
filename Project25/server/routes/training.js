const express = require('express');
const { query, queryOne, execute, executeAndGetLastId } = require('../database');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.get('/modules', authMiddleware, (req, res) => {
  const { category, difficulty } = req.query;

  let sql = 'SELECT * FROM training_modules WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (difficulty) {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }

  sql += ' ORDER BY created_at DESC';

  const modules = query(sql, params).map(mod => ({
    ...mod,
    scene_config: JSON.parse(mod.scene_config || '{}')
  }));

  res.json({ modules });
});

router.get('/modules/:id', authMiddleware, (req, res) => {
  const module = queryOne('SELECT * FROM training_modules WHERE id = ?', [req.params.id]);

  if (!module) {
    return res.status(404).json({ error: '实训模块不存在' });
  }

  module.scene_config = JSON.parse(module.scene_config || '{}');

  const userStats = queryOne(`
    SELECT 
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
      AVG(CASE WHEN status = 'completed' THEN score END) as avg_score,
      MAX(CASE WHEN status = 'completed' THEN score END) as best_score
    FROM training_sessions 
    WHERE module_id = ? AND user_id = ?
  `, [req.params.id, req.user.id]);

  res.json({ module, userStats: userStats || { completed_count: 0, avg_score: 0, best_score: 0 } });
});

router.post('/modules', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: '权限不足' });
  }

  const { name, description, category, difficulty, scene_config, duration, max_score } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: '模块名称和分类不能为空' });
  }

  const lastId = executeAndGetLastId(
    'INSERT INTO training_modules (name, description, category, difficulty, scene_config, duration, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description || '', category, difficulty || 'easy', JSON.stringify(scene_config || {}), duration || 30, max_score || 100]
  );

  const module = queryOne('SELECT * FROM training_modules WHERE id = ?', [lastId]);
  module.scene_config = JSON.parse(module.scene_config || '{}');

  res.status(201).json({ module });
});

router.put('/modules/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: '权限不足' });
  }

  const { name, description, category, difficulty, scene_config, duration, max_score } = req.body;

  execute(
    'UPDATE training_modules SET name = ?, description = ?, category = ?, difficulty = ?, scene_config = ?, duration = ?, max_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, category, difficulty, JSON.stringify(scene_config), duration, max_score, req.params.id]
  );

  const module = queryOne('SELECT * FROM training_modules WHERE id = ?', [req.params.id]);
  module.scene_config = JSON.parse(module.scene_config || '{}');

  res.json({ module });
});

router.delete('/modules/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' });
  }

  execute('DELETE FROM training_sessions WHERE module_id = ?', [req.params.id]);
  execute('DELETE FROM training_modules WHERE id = ?', [req.params.id]);

  res.json({ message: '模块已删除' });
});

router.get('/categories', authMiddleware, (req, res) => {
  const categories = [
    { key: 'electronics', name: '电子电路' },
    { key: 'mechanical', name: '机械装配' },
    { key: 'chemistry', name: '化学实验' },
    { key: 'automation', name: '自动化控制' },
    { key: 'robotics', name: '机器人技术' },
    { key: 'networking', name: '网络技术' }
  ];

  res.json({ categories });
});

router.get('/difficulties', authMiddleware, (req, res) => {
  const difficulties = [
    { key: 'easy', name: '初级' },
    { key: 'medium', name: '中级' },
    { key: 'hard', name: '高级' }
  ];

  res.json({ difficulties });
});

module.exports = router;
