const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getAsync, allAsync, runAsync } = require('../db/init');
const { generateReport } = require('../services/reportGenerator');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { experiment_id, status, page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let countSql = 'SELECT COUNT(*) as total FROM reports WHERE 1=1';
    let sql = 'SELECT r.*, e.name as experiment_name FROM reports r LEFT JOIN experiments e ON r.experiment_id = e.id WHERE 1=1';
    const params = [];

    if (experiment_id) {
      countSql += ' AND r.experiment_id = ?';
      sql += ' AND r.experiment_id = ?';
      params.push(experiment_id);
    }
    if (status) {
      countSql += ' AND r.status = ?';
      sql += ' AND r.status = ?';
      params.push(status);
    }

    const { total } = await getAsync(countSql, params);
    sql += ' ORDER BY r.generated_at DESC LIMIT ? OFFSET ?';
    const list = await allAsync(sql, [...params, Number(pageSize), offset]);

    res.json({
      code: 0,
      message: '获取报告列表成功',
      data: { list, total, page: Number(page), pageSize: Number(pageSize) }
    });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const templates = await allAsync('SELECT * FROM report_templates ORDER BY created_at DESC');
    res.json({ code: 0, message: '获取报告模板列表成功', data: { list: templates, total: templates.length } });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, description, sections } = req.body;

    if (!name) {
      return res.json({ code: 1, message: '模板名称不能为空', data: null });
    }

    await runAsync(
      'INSERT INTO report_templates (id, name, description, sections, is_active) VALUES (?, ?, ?, ?, 1)',
      [id, name, description || null, sections ? JSON.stringify(sections) : null]
    );

    const template = await getAsync('SELECT * FROM report_templates WHERE id = ?', [id]);
    res.json({ code: 0, message: '报告模板创建成功', data: template });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await getAsync('SELECT r.*, e.name as experiment_name FROM reports r LEFT JOIN experiments e ON r.experiment_id = e.id WHERE r.id = ?', [req.params.id]);
    if (!report) {
      return res.json({ code: 1, message: '报告不存在', data: null });
    }
    res.json({ code: 0, message: '获取报告详情成功', data: report });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { experiment_id, template_id } = req.body;

    if (!experiment_id) {
      return res.json({ code: 1, message: '试验ID不能为空', data: null });
    }

    const result = await generateReport(experiment_id, template_id);
    res.json({ code: 0, message: '报告生成成功', data: result });
  } catch (e) {
    res.json({ code: 1, message: `报告生成失败: ${e.message}`, data: null });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const report = await getAsync('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (!report) {
      return res.json({ code: 1, message: '报告不存在', data: null });
    }

    if (!report.file_path || !fs.existsSync(report.file_path)) {
      return res.json({ code: 1, message: '报告文件不存在', data: null });
    }

    const fileName = path.basename(report.file_path);
    res.download(report.file_path, fileName);
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

module.exports = router;
