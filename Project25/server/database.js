const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'training.db');

let db;
let SQL;

async function initDatabase() {
  SQL = await initSqlJs();

  let dbData = null;
  if (fs.existsSync(dbPath)) {
    dbData = fs.readFileSync(dbPath);
    db = new SQL.Database(dbData);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      display_name TEXT NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS training_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'easy',
      scene_config TEXT,
      duration INTEGER DEFAULT 0,
      max_score INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS training_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      start_time DATETIME,
      end_time DATETIME,
      score REAL DEFAULT 0,
      data_record TEXT,
      operations_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (module_id) REFERENCES training_modules(id)
    );

    CREATE TABLE IF NOT EXISTS operation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      operation_type TEXT NOT NULL,
      operation_data TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_correct INTEGER DEFAULT 1,
      FOREIGN KEY (session_id) REFERENCES training_sessions(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      score REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (session_id) REFERENCES training_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS collaborative_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT UNIQUE NOT NULL,
      module_id INTEGER NOT NULL,
      host_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'waiting',
      max_users INTEGER DEFAULT 4,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES training_modules(id),
      FOREIGN KEY (host_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS room_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL DEFAULT 'participant',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES collaborative_rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(room_id, user_id)
    );
  `);

  const userCount = db.exec('SELECT COUNT(*) as count FROM users');
  if (userCount.length === 0 || userCount[0].values[0][0] === 0) {
    const bcrypt = require('bcryptjs');

    db.run(
      'INSERT INTO users (username, password, role, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
      ['admin', bcrypt.hashSync('admin123', 10), 'admin', '系统管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin']
    );
    db.run(
      'INSERT INTO users (username, password, role, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
      ['teacher', bcrypt.hashSync('teacher123', 10), 'teacher', '张老师', 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher']
    );
    db.run(
      'INSERT INTO users (username, password, role, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
      ['student1', bcrypt.hashSync('student123', 10), 'student', '李同学', 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1']
    );
    db.run(
      'INSERT INTO users (username, password, role, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
      ['student2', bcrypt.hashSync('student123', 10), 'student', '王同学', 'https://api.dicebear.com/7.x/avataaars/svg?seed=student2']
    );
    db.run(
      'INSERT INTO users (username, password, role, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
      ['student3', bcrypt.hashSync('student123', 10), 'student', '赵同学', 'https://api.dicebear.com/7.x/avataaars/svg?seed=student3']
    );
  }

  const moduleCount = db.exec('SELECT COUNT(*) as count FROM training_modules');
  if (moduleCount.length === 0 || moduleCount[0].values[0][0] === 0) {
    db.run(
      'INSERT INTO training_modules (name, description, category, difficulty, scene_config, duration, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['电路基础实训', '学习基本电路原理，包括串联、并联电路的连接与测量', 'electronics', 'easy',
        JSON.stringify({ sceneType: 'circuit', components: ['resistor', 'battery', 'switch', 'voltmeter', 'ammeter'], background: 'lab' }),
        30, 100]
    );
    db.run(
      'INSERT INTO training_modules (name, description, category, difficulty, scene_config, duration, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['机械装配实训', '学习机械零件的装配与拆卸，掌握工具使用方法', 'mechanical', 'medium',
        JSON.stringify({ sceneType: 'workshop', components: ['gear', 'shaft', 'bearing', 'bolt', 'wrench'], background: 'workshop' }),
        45, 100]
    );
    db.run(
      'INSERT INTO training_modules (name, description, category, difficulty, scene_config, duration, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['化学实验操作', '进行基础化学实验，学习安全操作规范和实验流程', 'chemistry', 'medium',
        JSON.stringify({ sceneType: 'lab', components: ['beaker', 'test_tube', 'bunsen_burner', 'pipette', 'flask'], background: 'chem_lab' }),
        40, 100]
    );
    db.run(
      'INSERT INTO training_modules (name, description, category, difficulty, scene_config, duration, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['PLC编程实训', '学习PLC编程逻辑，实现自动化控制程序设计', 'automation', 'hard',
        JSON.stringify({ sceneType: 'control_room', components: ['plc', 'sensor', 'motor', 'conveyor', 'hmi'], background: 'factory' }),
        60, 100]
    );
    db.run(
      'INSERT INTO training_modules (name, description, category, difficulty, scene_config, duration, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['机器人操作实训', '操作工业机器人完成抓取、搬运等任务', 'robotics', 'hard',
        JSON.stringify({ sceneType: 'robotics_lab', components: ['robot_arm', 'gripper', 'conveyor', 'vision_system', 'plc'], background: 'robotics' }),
        50, 100]
    );
    db.run(
      'INSERT INTO training_modules (name, description, category, difficulty, scene_config, duration, max_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['网络配置实训', '学习网络设备配置，包括路由器、交换机的基本设置', 'networking', 'medium',
        JSON.stringify({ sceneType: 'server_room', components: ['router', 'switch', 'server', 'cable', 'pc'], background: 'server_room' }),
        35, 100]
    );
  }

  saveDatabase();
  console.log('[DB] Database initialized successfully');
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function query(sql, params = []) {
  const results = db.exec(sql, params);
  if (results.length === 0) return [];
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

function execute(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  return { changes: db.getRowsModified() };
}

function executeAndGetLastId(sql, params = []) {
  db.run(sql, params);
  const result = queryOne('SELECT last_insert_rowid() as lastId');
  saveDatabase();
  return result ? result.lastId : null;
}

module.exports = {
  initDatabase,
  query,
  queryOne,
  execute,
  executeAndGetLastId
};
