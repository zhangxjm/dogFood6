const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'repair.db');

async function initDatabase() {
  const SQL = await initSqlJs();
  
  let dbInstance;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }
  
  console.log('Connected to SQLite database');
  
  function saveToFile() {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
  
  const db = {
    run: function(sql, params) {
      if (params) {
        dbInstance.run(sql, params);
      } else {
        dbInstance.run(sql);
      }
      saveToFile();
    },
    
    all: function(sql, params) {
      const stmt = dbInstance.prepare(sql);
      if (params) stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    },
    
    get: function(sql, params) {
      const stmt = dbInstance.prepare(sql);
      if (params) stmt.bind(params);
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    },
    
    exec: function(sql) {
      dbInstance.exec(sql);
      saveToFile();
    },
    
    prepare: function(sql) {
      return {
        run: function(...params) {
          dbInstance.run(sql, params);
          saveToFile();
        },
        
        all: function(...params) {
          const stmt = dbInstance.prepare(sql);
          stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
        
        get: function(...params) {
          const stmt = dbInstance.prepare(sql);
          stmt.bind(params);
          let result = null;
          if (stmt.step()) {
            result = stmt.getAsObject();
          }
          stmt.free();
          return result;
        }
      };
    },
    
    export: saveToFile
  };
  
  return db;
}

module.exports = initDatabase;
