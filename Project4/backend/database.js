const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {};
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(content);
      } else {
        this.data = {
          subjects: [],
          knowledge_points: [],
          categories: [],
          questions: [],
          practice_records: []
        };
        this.save();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = {
        subjects: [],
        knowledge_points: [],
        categories: [],
        questions: [],
        practice_records: []
      };
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  getAll(table) {
    return this.data[table] || [];
  }

  getById(table, id) {
    return (this.data[table] || []).find(item => item.id === id);
  }

  create(table, item) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    const maxId = this.data[table].reduce((max, item) => Math.max(max, item.id || 0), 0);
    const newItem = {
      ...item,
      id: maxId + 1,
      created_at: new Date().toISOString()
    };
    this.data[table].push(newItem);
    this.save();
    return newItem;
  }

  findOrCreate(table, where, defaults) {
    const existing = (this.data[table] || []).find(item => {
      return Object.keys(where).every(key => item[key] === where[key]);
    });
    if (existing) {
      return [existing, false];
    }
    const newItem = this.create(table, { ...where, ...defaults });
    return [newItem, true];
  }

  update(table, id, updates) {
    const index = (this.data[table] || []).findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data[table][index] = {
      ...this.data[table][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data[table][index];
  }

  delete(table, id) {
    if (!this.data[table]) return false;
    const index = this.data[table].findIndex(item => item.id === id);
    if (index === -1) return false;
    this.data[table].splice(index, 1);
    this.save();
    return true;
  }

  deleteByField(table, field, value) {
    if (!this.data[table]) return;
    this.data[table] = this.data[table].filter(item => item[field] !== value);
    this.save();
  }

  count(table) {
    return (this.data[table] || []).length;
  }

  findAll(table, where = {}) {
    let results = this.data[table] || [];
    Object.keys(where).forEach(key => {
      results = results.filter(item => item[key] === where[key]);
    });
    return results;
  }
}

const dbPath = path.join(__dirname, 'database.json');
const db = new JSONDatabase(dbPath);

module.exports = {
  db,
  JSONDatabase
};
