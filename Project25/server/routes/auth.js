const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, execute, executeAndGetLastId } = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'metaverse-training-secret-key-2024';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) {
    return res.status(401).json({ error: '用户不存在' });
  }

  const isValid = bcrypt.compareSync(password, user.password);

  if (!isValid) {
    return res.status(401).json({ error: '密码错误' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      display_name: user.display_name,
      avatar: user.avatar
    }
  });
});

router.post('/register', (req, res) => {
  const { username, password, display_name, role } = req.body;

  if (!username || !password || !display_name) {
    return res.status(400).json({ error: '请填写完整信息' });
  }

  const existingUser = queryOne('SELECT id FROM users WHERE username = ?', [username]);

  if (existingUser) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

  const lastId = executeAndGetLastId(
    'INSERT INTO users (username, password, role, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
    [username, hashedPassword, role || 'student', display_name, avatarUrl]
  );

  const user = queryOne('SELECT id, username, role, display_name, avatar FROM users WHERE id = ?', [lastId]);

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({ token, user });
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
}

router.get('/profile', authMiddleware, (req, res) => {
  const user = queryOne(
    'SELECT id, username, role, display_name, avatar, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json({ user });
});

router.put('/profile', authMiddleware, (req, res) => {
  const { display_name, avatar } = req.body;

  execute(
    'UPDATE users SET display_name = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [display_name || req.user.display_name, avatar || null, req.user.id]
  );

  const user = queryOne(
    'SELECT id, username, role, display_name, avatar FROM users WHERE id = ?',
    [req.user.id]
  );

  res.json({ user });
});

module.exports = { router, authMiddleware };
