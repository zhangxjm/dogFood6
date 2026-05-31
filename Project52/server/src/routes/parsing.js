const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const { getAsync, allAsync, runAsync } = require('../db/init');
const { parseCSV, parseJSON, parseXML, parseBinary, parseTXT, standardizeData } = require('../services/dataParser');

const router = express.Router();

router.get('/rules', async (req, res) => {
  try {
    const rules = await allAsync('SELECT * FROM parsing_rules ORDER BY created_at DESC');
    res.json({ code: 0, message: '获取解析规则列表成功', data: { list: rules, total: rules.length } });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const id = uuidv4();
    const { name, format, description, config, field_mapping } = req.body;

    if (!name || !format) {
      return res.json({ code: 1, message: '规则名称和格式不能为空', data: null });
    }

    await runAsync(
      'INSERT INTO parsing_rules (id, name, format, description, config, field_mapping, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [id, name, format, description || null, config ? JSON.stringify(config) : null, field_mapping ? JSON.stringify(field_mapping) : null]
    );

    const rule = await getAsync('SELECT * FROM parsing_rules WHERE id = ?', [id]);
    res.json({ code: 0, message: '解析规则创建成功', data: rule });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.put('/rules/:id', async (req, res) => {
  try {
    const existing = await getAsync('SELECT * FROM parsing_rules WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ code: 1, message: '解析规则不存在', data: null });
    }

    const { name, format, description, config, field_mapping, is_active } = req.body;
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    await runAsync(
      'UPDATE parsing_rules SET name=COALESCE(?,name), format=COALESCE(?,format), description=COALESCE(?,description), config=COALESCE(?,config), field_mapping=COALESCE(?,field_mapping), is_active=COALESCE(?,is_active), updated_at=? WHERE id=?',
      [name, format, description, config ? JSON.stringify(config) : null, field_mapping ? JSON.stringify(field_mapping) : null, is_active !== undefined ? is_active : null, now, req.params.id]
    );

    const rule = await getAsync('SELECT * FROM parsing_rules WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '解析规则更新成功', data: rule });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const existing = await getAsync('SELECT * FROM parsing_rules WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ code: 1, message: '解析规则不存在', data: null });
    }
    await runAsync('DELETE FROM parsing_rules WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '解析规则删除成功', data: null });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/parse', async (req, res) => {
  try {
    const { data_id, rule_id, raw_data } = req.body;

    let config = {};
    let fieldMapping = {};

    if (rule_id) {
      const rule = await getAsync('SELECT * FROM parsing_rules WHERE id = ?', [rule_id]);
      if (!rule) {
        return res.json({ code: 1, message: '解析规则不存在', data: null });
      }
      try { config = JSON.parse(rule.config || '{}'); } catch { config = {}; }
      try { fieldMapping = JSON.parse(rule.field_mapping || '{}'); } catch { fieldMapping = {}; }

      if (data_id) {
        const dataRecord = await getAsync('SELECT * FROM experiment_data WHERE id = ?', [data_id]);
        if (!dataRecord) {
          return res.json({ code: 1, message: '数据记录不存在', data: null });
        }
        await runAsync('UPDATE experiment_data SET parsing_rule_id = ? WHERE id = ?', [rule_id, data_id]);
      }
    }

    const dataToParse = raw_data || '';
    if (!dataToParse) {
      return res.json({ code: 1, message: '无数据可解析', data: null });
    }

    const format = (config.format || 'CSV').toUpperCase();
    let result;

    try {
      switch (format) {
        case 'CSV':
          result = parseCSV(dataToParse, config);
          break;
        case 'JSON':
          result = parseJSON(dataToParse, config);
          break;
        case 'XML':
          result = parseXML(dataToParse, config);
          break;
        case 'BINARY':
          result = parseBinary(dataToParse, config);
          break;
        case 'TXT':
          result = parseTXT(dataToParse, config);
          break;
        case 'XLS':
          result = parseCSV(dataToParse, { ...config, delimiter: config.delimiter || ',' });
          break;
        default:
          result = parseCSV(dataToParse, config);
      }
    } catch (e) {
      return res.json({ code: 1, message: `解析失败: ${e.message}`, data: null });
    }

    if (data_id && result.totalRows > 0) {
      await runAsync('UPDATE experiment_data SET is_parsed = 1, parsed_result = ?, data_points = ? WHERE id = ?',
        [JSON.stringify(result), result.totalRows, data_id]);
    }

    res.json({ code: 0, message: '数据解析成功', data: result });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

router.post('/standardize', (req, res) => {
  try {
    const { parsed_data, target_format } = req.body;

    if (!parsed_data) {
      return res.json({ code: 1, message: '无数据可标准化', data: null });
    }

    const result = standardizeData(parsed_data, target_format || 'json');
    res.json({ code: 0, message: '数据标准化完成', data: result });
  } catch (err) {
    res.json({ code: 1, message: err.message, data: null });
  }
});

module.exports = router;
