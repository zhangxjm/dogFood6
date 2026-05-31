require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './data/customs.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`PRAGMA foreign_keys = ON`);

      db.run(`CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hs_code VARCHAR(20) UNIQUE NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        description TEXT,
        tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
        consumption_tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
        vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1300,
        is_restricted BOOLEAN NOT NULL DEFAULT 0,
        required_documents TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INTEGER,
        hs_code VARCHAR(20),
        origin_country VARCHAR(50) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        weight DECIMAL(10,3),
        dimensions VARCHAR(50),
        image_url VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES product_categories(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS declarations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        declaration_no VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        declaration_type VARCHAR(20) NOT NULL DEFAULT 'IMPORT',
        trade_mode VARCHAR(50) NOT NULL DEFAULT 'GENERAL_TRADE',
        exporter_name VARCHAR(200) NOT NULL,
        exporter_address TEXT,
        importer_name VARCHAR(200) NOT NULL,
        importer_address TEXT,
        port_of_entry VARCHAR(100) NOT NULL,
        port_of_departure VARCHAR(100),
        departure_date DATE,
        arrival_date DATE,
        transport_mode VARCHAR(50) NOT NULL DEFAULT 'SEA',
        voyage_no VARCHAR(50),
        bl_no VARCHAR(50),
        invoice_no VARCHAR(50),
        invoice_date DATE,
        total_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        total_weight DECIMAL(12,3),
        total_package_count INTEGER,
        customs_duty DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        consumption_tax DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        total_tax DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        submitted_at DATETIME,
        customs_received_at DATETIME,
        inspected_at DATETIME,
        released_at DATETIME,
        rejected_at DATETIME,
        rejection_reason TEXT,
        customs_response TEXT,
        created_by VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS declaration_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        declaration_id INTEGER NOT NULL,
        product_id INTEGER,
        item_no INTEGER NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        hs_code VARCHAR(20) NOT NULL,
        origin_country VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        unit VARCHAR(20) NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        weight_per_unit DECIMAL(10,3),
        total_weight DECIMAL(12,3),
        customs_duty_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
        consumption_tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
        vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.1300,
        customs_duty_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        consumption_tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        total_tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        verification_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (declaration_id) REFERENCES declarations(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS declaration_status_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        declaration_id INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL,
        message TEXT,
        operator VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (declaration_id) REFERENCES declarations(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS customs_api_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        api_name VARCHAR(100) NOT NULL,
        request_url TEXT NOT NULL,
        request_method VARCHAR(10) NOT NULL,
        request_body TEXT,
        response_body TEXT,
        status_code INTEGER,
        duration_ms INTEGER,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS async_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id VARCHAR(100) UNIQUE NOT NULL,
        task_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        payload TEXT,
        result TEXT,
        error_message TEXT,
        progress INTEGER DEFAULT 0,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, () => {
        const categories = [
          { hs_code: '4911910000', category_name: '印刷的图片及设计图样', tax_rate: 0.0000, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 0, description: '文化创意印刷品' },
          { hs_code: '6913100000', category_name: '陶瓷雕塑品及装饰品', tax_rate: 0.1000, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 0, description: '陶瓷文创产品' },
          { hs_code: '7117190000', category_name: '仿首饰', tax_rate: 0.3500, consumption_tax_rate: 0.1000, vat_rate: 0.1300, is_restricted: 0, description: '文创首饰类' },
          { hs_code: '8306299000', category_name: '其他贱金属雕塑像及装饰品', tax_rate: 0.2000, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 0, description: '金属文创产品' },
          { hs_code: '9701900000', category_name: '其他绘画、拼贴画及装饰画', tax_rate: 0.1400, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 0, description: '艺术画作' },
          { hs_code: '9703000000', category_name: '各种材料制的雕塑品原件', tax_rate: 0.1400, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 1, description: '需要进口许可', required_documents: '文化部门批文,原产地证明' },
          { hs_code: '3926400000', category_name: '塑料制小雕塑品及装饰品', tax_rate: 0.1000, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 0, description: '塑料文创产品' },
          { hs_code: '4202210000', category_name: '皮革制手提包', tax_rate: 0.1000, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 0, description: '文创箱包类' },
          { hs_code: '6109100000', category_name: '棉制T恤衫', tax_rate: 0.1000, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 0, description: '文创服装类' },
          { hs_code: '8523511000', category_name: '音乐专辑光盘', tax_rate: 0.0000, consumption_tax_rate: 0.0000, vat_rate: 0.1300, is_restricted: 1, description: '需要内容审查', required_documents: '文化部音像制品进口批准单' }
        ];

        let completed = 0;
        const total = categories.length;

        categories.forEach((cat, index) => {
          db.run(`INSERT OR IGNORE INTO product_categories (hs_code, category_name, description, tax_rate, consumption_tax_rate, vat_rate, is_restricted, required_documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [cat.hs_code, cat.category_name, cat.description, cat.tax_rate, cat.consumption_tax_rate, cat.vat_rate, cat.is_restricted, cat.required_documents || null],
            (err) => {
              if (err) console.error('Error inserting category:', err);
              completed++;
              if (completed === total) {
                insertProducts();
              }
            }
          );
        });
      });

      function insertProducts() {
        const products = [
          { sku: 'CCP-001', name: '故宫文创青花瓷书签', description: '青花瓷风格金属书签，故宫联名款', hs_code: '8306299000', origin_country: 'CN', unit_price: 15.99, weight: 0.05 },
          { sku: 'CCP-002', name: '敦煌飞天艺术丝巾', description: '100%桑蚕丝，敦煌艺术图案', hs_code: '6214100000', origin_country: 'CN', unit_price: 89.00, weight: 0.12 },
          { sku: 'CCP-003', name: '兵马俑Q版手办套装', description: 'Q版兵马俑摆件，含5个角色', hs_code: '3926400000', origin_country: 'CN', unit_price: 129.00, weight: 0.35 },
          { sku: 'CCP-004', name: '清明上河图画册', description: '高清印刷珍藏版清明上河图', hs_code: '4911910000', origin_country: 'CN', unit_price: 268.00, weight: 1.20 },
          { sku: 'CCP-005', name: '京剧脸谱陶瓷茶杯', description: '国粹京剧脸谱设计陶瓷杯', hs_code: '6913100000', origin_country: 'CN', unit_price: 59.00, weight: 0.25 },
          { sku: 'CCP-006', name: '故宫神兽系列徽章', description: '故宫太和殿脊兽徽章套装', hs_code: '8306299000', origin_country: 'CN', unit_price: 35.00, weight: 0.08 },
          { sku: 'CCP-007', name: '熊猫文创帆布包', description: '环保帆布包，熊猫图案设计', hs_code: '4202210000', origin_country: 'CN', unit_price: 45.00, weight: 0.20 },
          { sku: 'CCP-008', name: '中国风复古典邮册', description: '珍藏邮票合集，含纪念邮票', hs_code: '4911910000', origin_country: 'CN', unit_price: 188.00, weight: 0.45 }
        ];

        let completed = 0;
        const total = products.length;

        products.forEach((p) => {
          db.run(`INSERT OR IGNORE INTO products (sku, name, description, hs_code, origin_country, unit_price, weight, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [p.sku, p.name, p.description, p.hs_code, p.origin_country, p.unit_price, p.weight],
            (err) => {
              if (err) console.error('Error inserting product:', err);
              completed++;
              if (completed === total) {
                console.log('Database initialized successfully with seed data');
                resolve();
              }
            }
          );
        });
      }
    });
  });
};

initDatabase()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
    db.close();
    process.exit(1);
  });
