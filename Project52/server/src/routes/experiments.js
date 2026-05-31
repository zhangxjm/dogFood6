const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const { getAsync, allAsync, runAsync } = require('../db/init');
const { validateTransition, getAvailableTransitions } = require('../services/processManager');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, type, keyword, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let countSql = 'SELECT COUNT(*) as total FROM experiments WHERE 1=1';
    let sql = 'SELECT e.*, d.name as device_name FROM experiments e LEFT JOIN devices d ON e.device_id = d.id WHERE 1=1';
    const params = [];

    if (status) {
      countSql += ' AND e.status = ?';
      sql += ' AND e.status = ?';
      params.push(status);
    }
    if (type) {
      countSql += ' AND e.type = ?';
      sql += ' AND e.type = ?';
      params.push(type);
    }
    if (keyword) {
      countSql += ' AND (e.name LIKE ? OR e.responsible_person LIKE ?)';
      sql += ' AND (e.name LIKE ? OR e.responsible_person LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const { total } = await getAsync(countSql, params);

    sql += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    const list = await allAsync(sql, [...params, Number(pageSize), offset]);

    res.json({
      code: 0,
      message: '获取试验列表成功',
      data: { list, total, page: Number(page), pageSize: Number(pageSize) }
    });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const experiment = await getAsync('SELECT e.*, d.name as device_name FROM experiments e LEFT JOIN devices d ON e.device_id = d.id WHERE e.id = ?', [req.params.id]);
    if (!experiment) {
      return res.json({ code: 1, message: '试验不存在', data: null });
    }
    const transitions = getAvailableTransitions(experiment.status);
    res.json({ code: 0, message: '获取试验详情成功', data: { ...experiment, available_transitions: transitions } });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, type, device_id, responsible_person, description, parameters } = req.body;

    if (!name || !type) {
      return res.json({ code: 1, message: '试验名称和类型不能为空', data: null });
    }

    await runAsync(
      'INSERT INTO experiments (id, name, type, status, device_id, responsible_person, description, parameters) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, 'draft', device_id || null, responsible_person || null, description || null, parameters ? JSON.stringify(parameters) : null]
    );

    const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [id]);
    res.json({ code: 0, message: '试验创建成功', data: experiment });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await getAsync('SELECT * FROM experiments WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ code: 1, message: '试验不存在', data: null });
    }

    const { name, type, device_id, responsible_person, description, parameters } = req.body;
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    await runAsync(
      'UPDATE experiments SET name=COALESCE(?,name), type=COALESCE(?,type), device_id=COALESCE(?,device_id), responsible_person=COALESCE(?,responsible_person), description=COALESCE(?,description), parameters=COALESCE(?,parameters), updated_at=? WHERE id=?',
      [name, type, device_id, responsible_person, description, parameters ? JSON.stringify(parameters) : null, now, req.params.id]
    );

    const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '试验更新成功', data: experiment });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [req.params.id]);
    if (!experiment) {
      return res.json({ code: 1, message: '试验不存在', data: null });
    }

    const { status } = req.body;
    if (!status) {
      return res.json({ code: 1, message: '目标状态不能为空', data: null });
    }

    const validation = validateTransition(experiment.status, status);
    if (!validation.valid) {
      return res.json({ code: 1, message: validation.message, data: null });
    }

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const updates = { status, updated_at: now };

    if (status === 'running' && !experiment.start_time) {
      updates.start_time = now;
    }
    if (status === 'completed') {
      updates.end_time = now;
    }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await runAsync(`UPDATE experiments SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const updated = await getAsync('SELECT * FROM experiments WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '状态变更成功', data: updated });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await getAsync('SELECT * FROM experiments WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ code: 1, message: '试验不存在', data: null });
    }

    await runAsync('DELETE FROM experiment_data WHERE experiment_id = ?', [req.params.id]);
    await runAsync('DELETE FROM reports WHERE experiment_id = ?', [req.params.id]);
    await runAsync('DELETE FROM experiments WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '试验删除成功', data: null });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

module.exports = router;
