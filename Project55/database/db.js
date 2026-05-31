const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;
let SQL = null;
const dbPath = path.join(__dirname, 'appliance_rental.db');

async function initDatabase() {
  if (db) return db;
  
  SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

async function query(sql, params = []) {
  if (!db) await initDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

async function run(sql, params = []) {
  if (!db) await initDatabase();
  db.run(sql, params);
  saveDatabase();
  return { 
    lastID: db.exec('SELECT last_insert_rowid() as id')[0].values[0][0],
    changes: db.getRowsModified()
  };
}

async function get(sql, params = []) {
  const results = await query(sql, params);
  return results[0] || null;
}

setInterval(saveDatabase, 30000);

process.on('exit', saveDatabase);

module.exports = { initDatabase, query, run, get, saveDatabase };
