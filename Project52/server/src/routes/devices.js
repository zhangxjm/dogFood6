const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const { getAsync, allAsync, runAsync } = require('../db/init');

const router = express.Router();

const statusMap = {
  'idle': '在线',
  'running': '运行中',
  'maintenance': '维护中',
  'offline': '离线'
};

const statusReverseMap = {
  '在线': 'idle',
  '运行中': 'running',
  '维护中': 'maintenance',
  '离线': 'offline'
};

function mapDeviceStatus(device) {
  if (!device) return device;
  return {
    ...device,
    code: device.model,
    device_code: device.model,
    status: statusMap[device.status] || device.status
  };
}

router.get('/', async (req, res) => {
  try {
    const { status, category, keyword } = req.query;

    let sql = 'SELECT * FROM devices WHERE 1=1';
    const params = [];

    if (status) {
      const dbStatus = statusReverseMap[status] || status;
      sql += ' AND status = ?';
      params.push(dbStatus);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (keyword) {
      sql += ' AND (name LIKE ? OR model LIKE ? OR location LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const devices = await allAsync(sql, params);
    const mapped = devices.map(mapDeviceStatus);
    res.json({ code: 0, message: '获取设备列表成功', data: { list: mapped, total: mapped.length } });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!device) {
      return res.json({ code: 1, message: '设备不存在', data: null });
    }
    const calibrations = await allAsync('SELECT * FROM calibration_records WHERE device_id = ? ORDER BY calibration_date DESC', [req.params.id]);
    const mapped = mapDeviceStatus(device);
    res.json({ code: 0, message: '获取设备详情成功', data: { ...mapped, calibrations } });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, device_code, code, type, category, status, location, manufacturer, purchase_date, description } = req.body;

    if (!name) {
      return res.json({ code: 1, message: '设备名称不能为空', data: null });
    }

    const deviceCode = code || device_code;
    const dbStatus = statusReverseMap[status] || status || 'idle';
    const deviceType = category || type;

    await runAsync(
      'INSERT INTO devices (id, name, model, category, status, location, manufacturer, purchase_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, deviceCode || null, deviceType || null, dbStatus, location || null, manufacturer || null, purchase_date || null, description || null]
    );

    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [id]);
    const mapped = mapDeviceStatus(device);
    res.json({ code: 0, message: '设备注册成功', data: mapped });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await getAsync('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ code: 1, message: '设备不存在', data: null });
    }

    const { name, device_code, code, type, category, status, location, manufacturer, purchase_date, description, last_calibration_date, next_calibration_date } = req.body;
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const deviceCode = code || device_code || existing.model;
    const dbStatus = status ? (statusReverseMap[status] || status) : existing.status;
    const deviceType = category || type || existing.category;

    await runAsync(
      'UPDATE devices SET name=COALESCE(?,name), model=COALESCE(?,model), category=COALESCE(?,category), status=COALESCE(?,status), location=COALESCE(?,location), manufacturer=COALESCE(?,manufacturer), purchase_date=COALESCE(?,purchase_date), description=COALESCE(?,description), last_calibration_date=COALESCE(?,last_calibration_date), next_calibration_date=COALESCE(?,next_calibration_date), updated_at=? WHERE id=?',
      [name, deviceCode, deviceType, dbStatus, location, manufacturer, purchase_date, description, last_calibration_date, next_calibration_date, now, req.params.id]
    );

    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    const mapped = mapDeviceStatus(device);
    res.json({ code: 0, message: '设备更新成功', data: mapped });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await getAsync('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ code: 1, message: '设备不存在', data: null });
    }
    await runAsync('DELETE FROM calibration_records WHERE device_id = ?', [req.params.id]);
    await runAsync('DELETE FROM devices WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '设备删除成功', data: null });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const device = await getAsync('SELECT id, name, status, last_calibration_date, next_calibration_date FROM devices WHERE id = ?', [req.params.id]);
    if (!device) {
      return res.json({ code: 1, message: '设备不存在', data: null });
    }
    res.json({ code: 0, message: '获取设备状态成功', data: device });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/:id/calibrate', async (req, res) => {
  try {
    const device = await getAsync('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!device) {
      return res.json({ code: 1, message: '设备不存在', data: null });
    }

    const { calibration_date, next_calibration_date, result, operator, certificate_no, notes } = req.body;
    if (!calibration_date) {
      return res.json({ code: 1, message: '标定日期不能为空', data: null });
    }

    const id = uuidv4();
    await runAsync(
      'INSERT INTO calibration_records (id, device_id, calibration_date, next_calibration_date, result, operator, certificate_no, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.params.id, calibration_date, next_calibration_date || null, result || '合格', operator || null, certificate_no || null, notes || null]
    );

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    await runAsync('UPDATE devices SET last_calibration_date=?, next_calibration_date=?, updated_at=? WHERE id=?',
      [calibration_date, next_calibration_date || null, now, req.params.id]);

    const record = await getAsync('SELECT * FROM calibration_records WHERE id = ?', [id]);
    res.json({ code: 0, message: '标定记录添加成功', data: record });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

module.exports = router;
