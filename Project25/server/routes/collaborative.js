const express = require('express');
const { query, queryOne, execute, executeAndGetLastId } = require('../database');
const { authMiddleware } = require('./auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/rooms', authMiddleware, (req, res) => {
  const { module_id, max_users } = req.body;

  if (!module_id) {
    return res.status(400).json({ error: '请选择实训模块' });
  }

  const module = queryOne('SELECT * FROM training_modules WHERE id = ?', [module_id]);

  if (!module) {
    return res.status(404).json({ error: '实训模块不存在' });
  }

  const roomCode = uuidv4().substring(0, 6).toUpperCase();

  const roomId = executeAndGetLastId(
    'INSERT INTO collaborative_rooms (room_code, module_id, host_id, max_users) VALUES (?, ?, ?, ?)',
    [roomCode, module_id, req.user.id, max_users || 4]
  );

  execute(
    'INSERT INTO room_participants (room_id, user_id, role) VALUES (?, ?, ?)',
    [roomId, req.user.id, 'host']
  );

  const room = queryOne(`
    SELECT cr.*, tm.name as module_name
    FROM collaborative_rooms cr
    JOIN training_modules tm ON cr.module_id = tm.id
    WHERE cr.id = ?
  `, [roomId]);

  const participants = query(`
    SELECT rp.*, u.username, u.display_name, u.avatar, u.role as user_role
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ?
  `, [room.id]);

  room.participants = participants;

  res.status(201).json({ room });
});

router.get('/rooms', authMiddleware, (req, res) => {
  const rooms = query(`
    SELECT cr.*, tm.name as module_name, u.display_name as host_name
    FROM collaborative_rooms cr
    JOIN training_modules tm ON cr.module_id = tm.id
    JOIN users u ON cr.host_id = u.id
    WHERE cr.status != 'closed'
    ORDER BY cr.created_at DESC
    LIMIT 20
  `);

  const roomsWithParticipants = rooms.map(room => {
    const participants = query(`
      SELECT rp.*, u.username, u.display_name, u.avatar
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = ?
    `, [room.id]);
    return { ...room, participants };
  });

  res.json({ rooms: roomsWithParticipants });
});

router.get('/rooms/:code', authMiddleware, (req, res) => {
  const room = queryOne(`
    SELECT cr.*, tm.name as module_name, tm.scene_config
    FROM collaborative_rooms cr
    JOIN training_modules tm ON cr.module_id = tm.id
    WHERE cr.room_code = ?
  `, [req.params.code]);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  room.scene_config = JSON.parse(room.scene_config || '{}');

  const participants = query(`
    SELECT rp.*, u.username, u.display_name, u.avatar, u.role as user_role
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ?
  `, [room.id]);

  room.participants = participants;

  res.json({ room });
});

router.post('/rooms/:code/join', authMiddleware, (req, res) => {
  const room = queryOne('SELECT * FROM collaborative_rooms WHERE room_code = ?', [req.params.code]);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  if (room.status === 'closed') {
    return res.status(400).json({ error: '房间已关闭' });
  }

  const participantCount = queryOne('SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?', [room.id]);

  if (participantCount.count >= room.max_users) {
    return res.status(400).json({ error: '房间已满' });
  }

  const existingParticipant = queryOne('SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?', [room.id, req.user.id]);

  if (existingParticipant) {
    return res.json({ message: '已在房间中', room_id: room.id });
  }

  execute(
    'INSERT INTO room_participants (room_id, user_id, role) VALUES (?, ?, ?)',
    [room.id, req.user.id, 'participant']
  );

  res.json({ message: '加入成功', room_id: room.id });
});

router.post('/rooms/:code/leave', authMiddleware, (req, res) => {
  const room = queryOne('SELECT * FROM collaborative_rooms WHERE room_code = ?', [req.params.code]);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  execute('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?', [room.id, req.user.id]);

  const remainingCount = queryOne('SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?', [room.id]);

  if (!remainingCount || remainingCount.count === 0 || room.host_id === req.user.id) {
    execute("UPDATE collaborative_rooms SET status = 'closed' WHERE id = ?", [room.id]);
  }

  res.json({ message: '已离开房间' });
});

router.post('/rooms/:code/start', authMiddleware, (req, res) => {
  const room = queryOne('SELECT * FROM collaborative_rooms WHERE room_code = ?', [req.params.code]);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  if (room.host_id !== req.user.id) {
    return res.status(403).json({ error: '只有房主可以开始实训' });
  }

  execute("UPDATE collaborative_rooms SET status = 'active' WHERE id = ?", [room.id]);

  const participants = query(`
    SELECT rp.user_id, u.username, u.display_name
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ?
  `, [room.id]);

  const sessions = [];

  for (const participant of participants) {
    const sessionId = executeAndGetLastId(
      'INSERT INTO training_sessions (user_id, module_id, status, start_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [participant.user_id, room.module_id, 'in_progress']
    );
    sessions.push({
      user_id: participant.user_id,
      username: participant.username,
      display_name: participant.display_name,
      session_id: sessionId
    });
  }

  res.json({ message: '实训已开始', sessions });
});

router.post('/rooms/:code/close', authMiddleware, (req, res) => {
  const room = queryOne('SELECT * FROM collaborative_rooms WHERE room_code = ?', [req.params.code]);

  if (!room) {
    return res.status(404).json({ error: '房间不存在' });
  }

  if (room.host_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: '只有房主可以关闭房间' });
  }

  execute("UPDATE collaborative_rooms SET status = 'closed' WHERE id = ?", [room.id]);
  execute('DELETE FROM room_participants WHERE room_id = ?', [room.id]);

  res.json({ message: '房间已关闭' });
});

module.exports = router;
