const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

let db = null;
let SQL = null;

function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, buffer);
}

function runAsync(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return Promise.resolve({});
}

function getAsync(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const result = stmt.getAsObject();
    stmt.free();
    return Promise.resolve(result);
  }
  stmt.free();
  return Promise.resolve(undefined);
}

function allAsync(sql, params = []) {
  const results = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return Promise.resolve(results);
}

async function initDatabase() {
  SQL = await initSqlJs();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  await createTables();
  const needsSeeding = await isSeedingNeeded();
  if (needsSeeding) {
    await seedData();
  }

  saveDb();
  console.log('Database initialized:', DB_PATH);
  return db;
}

async function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT,
      category TEXT,
      status TEXT DEFAULT 'idle',
      location TEXT,
      manufacturer TEXT,
      purchase_date TEXT,
      last_calibration_date TEXT,
      next_calibration_date TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      device_id TEXT,
      start_time TEXT,
      end_time TEXT,
      responsible_person TEXT,
      description TEXT,
      parameters TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS experiment_data (
      id TEXT PRIMARY KEY,
      experiment_id TEXT NOT NULL,
      file_name TEXT,
      file_path TEXT,
      file_size INTEGER,
      format TEXT,
      parsing_rule_id TEXT,
      is_parsed INTEGER DEFAULT 0,
      parsed_result TEXT,
      collection_status TEXT DEFAULT 'pending',
      data_points INTEGER DEFAULT 0,
      start_time TEXT,
      end_time TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS calibration_records (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      calibration_date TEXT NOT NULL,
      next_calibration_date TEXT,
      result TEXT,
      operator TEXT,
      certificate_no TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS parsing_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      format TEXT NOT NULL,
      description TEXT,
      config TEXT,
      field_mapping TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS report_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      sections TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      experiment_id TEXT NOT NULL,
      template_id TEXT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'generated',
      file_path TEXT,
      generated_by TEXT,
      generated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )`
  ];

  for (const sql of tables) {
    db.run(sql);
  }
}

async function isSeedingNeeded() {
  const result = db.exec('SELECT COUNT(*) as count FROM devices');
  return result.length === 0 || result[0].values[0][0] === 0;
}

async function seedData() {
  console.log('Seeding initial data...');

  const devices = [
    { id: uuidv4(), name: '电磁振动台', model: 'EV-2000', category: '力学设备', status: 'running', location: 'A区-101', manufacturer: '航天科工集团', purchase_date: '2022-03-15', last_calibration_date: '2026-01-10', next_calibration_date: '2026-07-10', description: '大型电磁振动台，频率范围5-3000Hz，最大推力200kN' },
    { id: uuidv4(), name: '热真空试验舱', model: 'TV-500', category: '热环境设备', status: 'idle', location: 'B区-203', manufacturer: '中国航天科技集团', purchase_date: '2021-08-20', last_calibration_date: '2025-12-05', next_calibration_date: '2026-06-05', description: '热真空试验舱，温度范围-70℃~+150℃，真空度优于1×10⁻³Pa' },
    { id: uuidv4(), name: '离心机', model: 'CF-100', category: '力学设备', status: 'running', location: 'A区-105', manufacturer: '中航工业', purchase_date: '2023-01-10', last_calibration_date: '2026-02-20', next_calibration_date: '2026-08-20', description: '精密离心机，最大加速度100g，转臂半径5m' },
    { id: uuidv4(), name: '冲击试验台', model: 'SH-5000', category: '力学设备', status: 'maintenance', location: 'A区-108', manufacturer: '航天科工集团', purchase_date: '2020-06-30', last_calibration_date: '2025-09-15', next_calibration_date: '2026-03-15', description: '冲击试验台，峰值加速度可达5000g' },
    { id: uuidv4(), name: '声学试验室', model: 'AC-150', category: '声学设备', status: 'idle', location: 'C区-301', manufacturer: '中科院声学所', purchase_date: '2022-11-25', last_calibration_date: '2026-04-01', next_calibration_date: '2026-10-01', description: '混响室声学试验系统，最大声压级150dB' }
  ];

  for (const d of devices) {
    db.run(
      'INSERT INTO devices (id, name, model, category, status, location, manufacturer, purchase_date, last_calibration_date, next_calibration_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [d.id, d.name, d.model, d.category, d.status, d.location, d.manufacturer, d.purchase_date, d.last_calibration_date, d.next_calibration_date, d.description]
    );
  }

  const experiments = [
    { id: uuidv4(), name: '卫星载荷正弦振动试验', type: '力学环境试验', status: 'completed', device_id: devices[0].id, start_time: '2026-05-10 09:00:00', end_time: '2026-05-10 17:30:00', responsible_person: '张伟', description: '卫星有效载荷正弦扫频振动试验，验证载荷结构力学性能', parameters: '{"frequency_range":"5-2000Hz","sweep_rate":"2oct/min","acceleration":"5g"}' },
    { id: uuidv4(), name: '载荷热真空循环试验', type: '热环境试验', status: 'running', device_id: devices[1].id, start_time: '2026-05-25 08:00:00', end_time: null, responsible_person: '李明', description: '载荷热真空循环试验，模拟太空热环境', parameters: '{"temp_high":"+80℃","temp_low":"-40℃","cycles":8,"vacuum":"1e-3Pa"}' },
    { id: uuidv4(), name: '载荷离心加速度试验', type: '力学环境试验', status: 'collecting', device_id: devices[2].id, start_time: '2026-05-28 10:00:00', end_time: null, responsible_person: '王芳', description: '恒加速度试验，验证载荷在过载环境下的性能', parameters: '{"max_acceleration":"15g","duration":"5min","directions":"3轴6向"}' },
    { id: uuidv4(), name: '载荷电磁兼容性测试', type: '电磁兼容试验', status: 'prepared', device_id: null, start_time: null, end_time: null, responsible_person: '赵磊', description: '载荷电磁兼容性测试，包括传导和辐射发射/敏感度测试', parameters: '{"standard":"GJB151B","test_items":["CE101","CE102","RE102","CS101","RS103"]}' },
    { id: uuidv4(), name: '载荷冲击响应试验', type: '力学环境试验', status: 'abnormal', device_id: devices[3].id, start_time: '2026-05-20 14:00:00', end_time: null, responsible_person: '陈静', description: '冲击响应谱试验，模拟运输和发射过程中的冲击环境', parameters: '{"shock_level":"500g","pulse_width":"1ms","directions":"3轴6向"}' },
    { id: uuidv4(), name: '载荷声振试验', type: '声学试验', status: 'draft', device_id: devices[4].id, start_time: null, end_time: null, responsible_person: '刘洋', description: '声振联合试验，验证载荷在噪声环境下的结构响应', parameters: '{"spl_level":"138dB","duration":"2min","frequency_range":"50-10000Hz"}' },
    { id: uuidv4(), name: '载荷热循环试验', type: '热环境试验', status: 'analyzing', device_id: devices[1].id, start_time: '2026-05-15 08:00:00', end_time: '2026-05-22 18:00:00', responsible_person: '李明', description: '载荷热循环试验，评估热循环对载荷性能的影响', parameters: '{"temp_high":"+60℃","temp_low":"-30℃","cycles":12,"dwell_time":"2h"}' },
    { id: uuidv4(), name: '载荷综合环境试验', type: '综合环境试验', status: 'draft', device_id: null, start_time: null, end_time: null, responsible_person: '张伟', description: '力学-热-电磁综合环境试验方案', parameters: '{"combined_factors":["vibration","thermal","EMC"],"test_sequence":"sequential"}' }
  ];

  for (const e of experiments) {
    db.run(
      'INSERT INTO experiments (id, name, type, status, device_id, start_time, end_time, responsible_person, description, parameters) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [e.id, e.name, e.type, e.status, e.device_id, e.start_time, e.end_time, e.responsible_person, e.description, e.parameters]
    );
  }

  const parsingRules = [
    { id: uuidv4(), name: 'CSV振动数据解析规则', format: 'CSV', description: '适用于振动试验CSV格式数据，支持逗号和分号分隔', config: '{"delimiter":",","encoding":"utf-8","skip_rows":2,"decimal_separator":"."}', field_mapping: '{"time":"时间","acceleration_x":"加速度X","acceleration_y":"加速度Y","acceleration_z":"加速度Z","frequency":"频率"}', is_active: 1 },
    { id: uuidv4(), name: 'JSON传感器数据解析规则', format: 'JSON', description: '适用于JSON格式传感器采集数据', config: '{"root_key":"data","timestamp_key":"timestamp","values_key":"values","encoding":"utf-8"}', field_mapping: '{"time":"timestamp","temperature":"temp","humidity":"hum","pressure":"press"}', is_active: 1 },
    { id: uuidv4(), name: 'XML试验报告解析规则', format: 'XML', description: '适用于XML格式试验数据报告', config: '{"root_tag":"TestData","record_tag":"Record","encoding":"utf-8"}', field_mapping: '{"time":"TimeStamp","value":"Value","channel":"Channel","unit":"Unit"}', is_active: 1 },
    { id: uuidv4(), name: '二进制数据解析规则', format: 'binary', description: '适用于二进制/十六进制原始采集数据', config: '{"byte_order":"little-endian","header_size":64,"record_size":32,"encoding":"hex"}', field_mapping: '{"time":"bytes[0:8]","channel_id":"bytes[8:10]","value":"bytes[10:18]","status":"bytes[18:20]"}', is_active: 1 },
    { id: uuidv4(), name: 'TXT文本数据解析规则', format: 'TXT', description: '适用于制表符或空格分隔的文本数据', config: '{"delimiter":"\\t","encoding":"utf-8","skip_rows":1,"comment_char":"#"}', field_mapping: '{"time":"col_0","value1":"col_1","value2":"col_2","value3":"col_3"}', is_active: 1 },
    { id: uuidv4(), name: 'XLS表格数据解析规则', format: 'XLS', description: '适用于Excel表格格式试验数据', config: '{"sheet_index":0,"header_row":0,"data_start_row":1,"encoding":"utf-8"}', field_mapping: '{"time":"A列","parameter":"B列","value":"C列","unit":"D列"}', is_active: 1 }
  ];

  for (const r of parsingRules) {
    db.run(
      'INSERT INTO parsing_rules (id, name, format, description, config, field_mapping, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [r.id, r.name, r.format, r.description, r.config, r.field_mapping, r.is_active]
    );
  }

  const templates = [
    { id: uuidv4(), name: '力学环境试验报告模板', description: '适用于振动、冲击、离心等力学环境试验报告', sections: '["试验概述","试验条件","试验设备","试验数据","结果分析","结论与建议"]', is_active: 1 },
    { id: uuidv4(), name: '热环境试验报告模板', description: '适用于热真空、热循环等热环境试验报告', sections: '["试验概述","温度曲线","热平衡数据","试验设备","结果分析","结论与建议"]', is_active: 1 },
    { id: uuidv4(), name: '综合试验报告模板', description: '适用于多种环境因素综合试验报告', sections: '["试验概述","试验条件","试验设备","力学数据","热学数据","电磁数据","综合分析","结论与建议"]', is_active: 1 }
  ];

  for (const t of templates) {
    db.run(
      'INSERT INTO report_templates (id, name, description, sections, is_active) VALUES (?, ?, ?, ?, ?)',
      [t.id, t.name, t.description, t.sections, t.is_active]
    );
  }

  for (const d of devices) {
    for (let i = 0; i < 2; i++) {
      db.run(
        'INSERT INTO calibration_records (id, device_id, calibration_date, next_calibration_date, result, operator, certificate_no, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          d.id,
          dayjs().subtract(6 - i, 'month').format('YYYY-MM-DD'),
          dayjs().add(i + 1, 'month').format('YYYY-MM-DD'),
          '合格',
          ['张工', '李工', '王工'][Math.floor(Math.random() * 3)],
          `CAL-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          i === 0 ? '首次标定，各项指标正常' : '定期标定，各项指标符合要求'
        ]
      );
    }
  }

  const dataRecords = [
    { id: uuidv4(), experiment_id: experiments[0].id, file_name: 'vibration_data_01.csv', file_size: 2048576, format: 'CSV', is_parsed: 1, parsed_result: '{"channels":4,"sample_rate":2048,"duration":3600}', collection_status: 'completed', data_points: 7372800, start_time: '2026-05-10 09:05:00', end_time: '2026-05-10 10:05:00' },
    { id: uuidv4(), experiment_id: experiments[0].id, file_name: 'vibration_data_02.csv', file_size: 1536000, format: 'CSV', is_parsed: 1, parsed_result: '{"channels":4,"sample_rate":2048,"duration":2700}', collection_status: 'completed', data_points: 5529600, start_time: '2026-05-10 10:10:00', end_time: '2026-05-10 10:55:00' },
    { id: uuidv4(), experiment_id: experiments[1].id, file_name: 'thermal_vacuum_data.json', file_size: 5120000, format: 'JSON', is_parsed: 0, parsed_result: null, collection_status: 'collecting', data_points: 864000, start_time: '2026-05-25 08:05:00', end_time: null },
    { id: uuidv4(), experiment_id: experiments[2].id, file_name: 'centrifuge_data_01.csv', file_size: 1024000, format: 'CSV', is_parsed: 0, parsed_result: null, collection_status: 'collecting', data_points: 300000, start_time: '2026-05-28 10:05:00', end_time: null },
    { id: uuidv4(), experiment_id: experiments[6].id, file_name: 'thermal_cycle_data.json', file_size: 8192000, format: 'JSON', is_parsed: 1, parsed_result: '{"channels":12,"sample_rate":10,"duration":604800,"cycles":12}', collection_status: 'completed', data_points: 7257600, start_time: '2026-05-15 08:05:00', end_time: '2026-05-22 17:55:00' },
    { id: uuidv4(), experiment_id: experiments[4].id, file_name: 'shock_data.bin', file_size: 256000, format: 'binary', is_parsed: 0, parsed_result: null, collection_status: 'abnormal', data_points: 50000, start_time: '2026-05-20 14:05:00', end_time: null }
  ];

  for (const dr of dataRecords) {
    db.run(
      'INSERT INTO experiment_data (id, experiment_id, file_name, file_size, format, is_parsed, parsed_result, collection_status, data_points, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [dr.id, dr.experiment_id, dr.file_name, dr.file_size, dr.format, dr.is_parsed, dr.parsed_result, dr.collection_status, dr.data_points, dr.start_time, dr.end_time]
    );
  }

  saveDb();
  console.log('Seed data inserted successfully');
}

module.exports = {
  getDb,
  initDatabase,
  runAsync,
  getAsync,
  allAsync
};
