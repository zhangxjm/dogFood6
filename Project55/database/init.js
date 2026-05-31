const { run, get, saveDatabase, initDatabase } = require('./db');

async function initData() {
  await initDatabase();

  await run(`
    CREATE TABLE IF NOT EXISTS appliances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      brand TEXT,
      model TEXT,
      daily_price REAL NOT NULL,
      location TEXT,
      image_url TEXT,
      contact_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS rentals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appliance_id INTEGER NOT NULL,
      renter_name TEXT NOT NULL,
      renter_phone TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'active',
      reminder_sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rental_id INTEGER NOT NULL,
      reminder_type TEXT NOT NULL,
      reminder_date DATETIME NOT NULL,
      sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const result = await get('SELECT COUNT(*) as count FROM appliances');
  
  if (result.count === 0) {
    const sampleAppliances = [
      ['海尔冰箱', '冰箱', '家用双开门冰箱，容量500升，九成新', '海尔', 'BCD-500W', 15, '北京市朝阳区', '张三', '13800138001', 'available'],
      ['格力空调', '空调', '1.5匹壁挂式空调，制冷效果好', '格力', 'KFR-35GW', 12, '北京市海淀区', '李四', '13800138002', 'available'],
      ['小米洗衣机', '洗衣机', '滚筒式全自动洗衣机，容量8公斤', '小米', 'XQG80', 10, '北京市西城区', '王五', '13800138003', 'available'],
      ['美的微波炉', '微波炉', '智能变频微波炉，多种烹饪模式', '美的', 'M3-L233B', 5, '北京市东城区', '赵六', '13800138004', 'available'],
      ['索尼电视', '电视', '55英寸4K智能电视，画质清晰', '索尼', 'KD-55X8000', 20, '北京市丰台区', '孙七', '13800138005', 'rented']
    ];

    for (const appliance of sampleAppliances) {
      await run(`
        INSERT INTO appliances (name, category, description, brand, model, daily_price, location, contact_name, contact_phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, appliance);
    }

    const today = new Date();
    const startDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    await run(`
      INSERT INTO rentals (appliance_id, renter_name, renter_phone, start_date, end_date, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [5, '周八', '13900139001', startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], 100, 'active']);

    console.log('Sample data initialized successfully!');
  }

  saveDatabase();
  console.log('Database initialized successfully!');
}

initData().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
