import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'spa.db');

let db: SqlJsDatabase;

function saveToDisk() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }

    initializeTables(db);
    console.log('[Database] SQLite initialized at', DB_PATH);
  }
  return db;
}

function initializeTables(db: SqlJsDatabase) {
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      duration INTEGER NOT NULL,
      image TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      level TEXT DEFAULT 'regular',
      balance REAL DEFAULT 0,
      total_spent REAL DEFAULT 0,
      visit_count INTEGER DEFAULT 0,
      avatar TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      member_name TEXT DEFAULT '',
      service_id INTEGER NOT NULL,
      service_name TEXT DEFAULT '',
      service_price REAL DEFAULT 0,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      duration INTEGER DEFAULT 0,
      amount REAL DEFAULT 0,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS consumption_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      appointment_id INTEGER DEFAULT 0,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'balance',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS monthly_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL UNIQUE,
      amount REAL DEFAULT 0,
      count INTEGER DEFAULT 0
    );
  `);

  saveToDisk();
}

export function saveDatabase() {
  saveToDisk();
}

export function closeDatabase() {
  if (db) {
    saveToDisk();
    db.close();
    console.log('[Database] Connection closed');
  }
}

export function queryAll(sql: string, params?: any[]): any[] {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(sql: string, params?: any[]): any | undefined {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : undefined;
}

export function runSql(sql: string, params?: any[]): void {
  if (params) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
  saveToDisk();
}
