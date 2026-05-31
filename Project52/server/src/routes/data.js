const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const { getAsync, allAsync, runAsync } = require('../db/init');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${dayjs().format('YYYYMMDD_HHmmss')}_${uuidv4().substring(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }
});

router.get('/collection', async (req, res) => {
  try {
    const { experiment_id, collection_status, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let countSql = 'SELECT COUNT(*) as total FROM experiment_data WHERE 1=1';
    let sql = 'SELECT ed.*, e.name as experiment_name FROM experiment_data ed LEFT JOIN experiments e ON ed.experiment_id = e.id WHERE 1=1';
    const params = [];

    if (experiment_id) {
      countSql += ' AND ed.experiment_id = ?';
      sql += ' AND ed.experiment_id = ?';
      params.push(experiment_id);
    }
    if (collection_status) {
      countSql += ' AND ed.collection_status = ?';
      sql += ' AND ed.collection_status = ?';
      params.push(collection_status);
    }

    const { total } = await getAsync(countSql, params);
    sql += ' ORDER BY ed.created_at DESC LIMIT ? OFFSET ?';
    const list = await allAsync(sql, [...params, Number(pageSize), offset]);

    res.json({
      code: 0,
      message: '获取数据采集列表成功',
      data: { list, total, page: Number(page), pageSize: Number(pageSize) }
    });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/collection/start', async (req, res) => {
  try {
    const { experiment_id, format } = req.body;

    if (!experiment_id) {
      return res.json({ code: 1, message: '试验ID不能为空', data: null });
    }

    const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [experiment_id]);
    if (!experiment) {
      return res.json({ code: 1, message: '试验不存在', data: null });
    }

    if (!['running', 'collecting'].includes(experiment.status)) {
      return res.json({ code: 1, message: '当前试验状态不允许开始数据采集', data: null });
    }

    const id = uuidv4();
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    await runAsync(
      'INSERT INTO experiment_data (id, experiment_id, format, collection_status, start_time, data_points) VALUES (?, ?, ?, ?, ?, 0)',
      [id, experiment_id, format || 'CSV', 'collecting', now]
    );

    if (experiment.status === 'running') {
      await runAsync('UPDATE experiments SET status = ?, updated_at = ? WHERE id = ?', ['collecting', now, experiment_id]);
    }

    const record = await getAsync('SELECT * FROM experiment_data WHERE id = ?', [id]);
    res.json({ code: 0, message: '数据采集已启动', data: record });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/collection/stop', async (req, res) => {
  try {
    const { data_id } = req.body;

    if (!data_id) {
      return res.json({ code: 1, message: '数据记录ID不能为空', data: null });
    }

    const record = await getAsync('SELECT * FROM experiment_data WHERE id = ?', [data_id]);
    if (!record) {
      return res.json({ code: 1, message: '数据记录不存在', data: null });
    }

    if (record.collection_status !== 'collecting') {
      return res.json({ code: 1, message: '当前状态不允许停止采集', data: null });
    }

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    await runAsync('UPDATE experiment_data SET collection_status = ?, end_time = ? WHERE id = ?', ['completed', now, data_id]);

    const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [record.experiment_id]);
    if (experiment && experiment.status === 'collecting') {
      await runAsync('UPDATE experiments SET status = ?, updated_at = ? WHERE id = ?', ['analyzing', now, record.experiment_id]);
    }

    const updated = await getAsync('SELECT * FROM experiment_data WHERE id = ?', [data_id]);
    res.json({ code: 0, message: '数据采集已停止', data: updated });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    const { experiment_id, format } = req.body;

    if (!req.file) {
      return res.json({ code: 1, message: '请上传文件', data: null });
    }
    if (!experiment_id) {
      fs.unlinkSync(req.file.path);
      return res.json({ code: 1, message: '试验ID不能为空', data: null });
    }

    const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [experiment_id]);
    if (!experiment) {
      fs.unlinkSync(req.file.path);
      return res.json({ code: 1, message: '试验不存在', data: null });
    }

    const id = uuidv4();
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const ext = path.extname(req.file.originalname).substring(1).toUpperCase();
    const fileFormat = format || ext || 'UNKNOWN';

    await runAsync(
      'INSERT INTO experiment_data (id, experiment_id, file_name, file_path, file_size, format, collection_status, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, experiment_id, req.file.originalname, req.file.path, req.file.size, fileFormat, 'completed', now, now]
    );

    const record = await getAsync('SELECT * FROM experiment_data WHERE id = ?', [id]);
    res.json({ code: 0, message: '文件导入成功', data: record });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.get('/validate/:experimentId', async (req, res) => {
  try {
    const experimentId = req.params.experimentId;

    const experiment = await getAsync('SELECT * FROM experiments WHERE id = ?', [experimentId]);
    if (!experiment) {
      return res.json({ code: 1, message: '试验不存在', data: null });
    }

    const dataRecords = await allAsync('SELECT * FROM experiment_data WHERE experiment_id = ?', [experimentId]);

    const validation = {
      experiment_id: experimentId,
      experiment_name: experiment.name,
      total_files: dataRecords.length,
      parsed_files: dataRecords.filter(d => d.is_parsed).length,
      unparsed_files: dataRecords.filter(d => !d.is_parsed).length,
      collecting_files: dataRecords.filter(d => d.collection_status === 'collecting').length,
      abnormal_files: dataRecords.filter(d => d.collection_status === 'abnormal').length,
      total_data_points: dataRecords.reduce((sum, d) => sum + (d.data_points || 0), 0),
      formats: [...new Set(dataRecords.map(d => d.format).filter(Boolean))],
      is_valid: dataRecords.length > 0 && dataRecords.filter(d => d.collection_status === 'abnormal').length === 0
    };

    res.json({ code: 0, message: '数据验证完成', data: validation });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

module.exports = router;
