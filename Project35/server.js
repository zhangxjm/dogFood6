const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const initDatabase = require('./database/db');

async function startServer() {
  const db = await initDatabase();
  
  db.exec(`CREATE TABLE IF NOT EXISTS service_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS technicians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialty TEXT,
    rating REAL DEFAULT 5.0,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    service_type_id INTEGER NOT NULL,
    technician_id INTEGER,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    problem_description TEXT,
    status TEXT DEFAULT 'pending',
    total_price REAL,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    FOREIGN KEY (technician_id) REFERENCES technicians(id)
  )`);

  const serviceCount = db.get(`SELECT COUNT(*) as count FROM service_types`);
  if (serviceCount.count === 0) {
    const services = [
      ['水管维修', '水电维修', '水龙头、水管、马桶漏水维修', 80, 'fa-wrench'],
      ['电路维修', '水电维修', '开关、插座、线路故障检修', 100, 'fa-bolt'],
      ['灯具安装', '水电维修', '吊灯、吸顶灯、LED灯安装', 60, 'fa-lightbulb-o'],
      ['空调维修', '家电维修', '空调不制冷、漏水、清洗保养', 150, 'fa-snowflake-o'],
      ['洗衣机维修', '家电维修', '洗衣机不脱水、不进水、异响', 120, 'fa-tv'],
      ['冰箱维修', '家电维修', '冰箱不制冷、结冰、异响', 130, 'fa-archive'],
      ['热水器维修', '家电维修', '热水器不加热、漏水、点火故障', 100, 'fa-fire'],
      ['燃气灶维修', '家电维修', '燃气灶打不着火、漏气维修', 90, 'fa-fire-extinguisher']
    ];
    const stmt = db.prepare(`INSERT INTO service_types (name, category, description, base_price, icon) VALUES (?, ?, ?, ?, ?)`);
    services.forEach(s => stmt.run(...s));

    const technicians = [
      ['张师傅', '13800138001', '水电维修', 4.8],
      ['李师傅', '13800138002', '家电维修', 4.9],
      ['王师傅', '13800138003', '空调维修', 4.7],
      ['赵师傅', '13800138004', '综合维修', 4.6]
    ];
    const techStmt = db.prepare(`INSERT INTO technicians (name, phone, specialty, rating) VALUES (?, ?, ?, ?)`);
    technicians.forEach(t => techStmt.run(...t));

    console.log('Database initialized with default data.');
  }
  
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride('_method'));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  const indexRoutes = require('./routes/index');
  const orderRoutes = require('./routes/orders');
  const serviceRoutes = require('./routes/services');

  app.use('/', indexRoutes);
  app.use('/orders', orderRoutes);
  app.use('/services', serviceRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the system`);
  });
}

startServer().catch(console.error);
