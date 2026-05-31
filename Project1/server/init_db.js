const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'unlock_service.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        service_type TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        appointment_time TEXT,
        price REAL DEFAULT 0,
        rating INTEGER DEFAULT 0,
        review TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

const checkExisting = () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
      if (err) reject(err);
      else resolve(row.count > 0);
    });
  });
};

const insertOrder = (data) => {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO orders (customer_name, phone, address, service_type, description, status, appointment_time, price, rating, review)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, data, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const sampleData = [
  ['张伟', '13812345678', '北京市朝阳区建国路88号SOHO现代城A座1205', '防盗门开锁', '出门忘带钥匙，门锁为防盗门锁芯', 'completed', '2026-05-20 10:00', 150, 5, '师傅很专业，服务态度好，速度很快！'],
  ['李娜', '13987654321', '北京市海淀区中关村大街15号创业大厦B座802', '汽车开锁', '车钥匙锁在车内了', 'completed', '2026-05-21 14:30', 200, 4, '服务不错，就是价格稍贵'],
  ['王强', '13611112222', '北京市西城区金融街7号英蓝国际金融中心903', '保险柜开锁', '密码忘记了，需要打开保险柜', 'in_progress', '2026-05-26 09:00', 300, 0, ''],
  ['刘芳', '13733334444', '北京市东城区王府井大街138号新东安市场公寓2801', '防盗门换锁', '需要更换新锁芯', 'pending', '2026-05-27 15:00', 180, 0, ''],
  ['陈明', '13555556666', '北京市丰台区丰台路68号院3号楼5单元301', '门锁维修', '门锁卡涩，需要维修', 'pending', '2026-05-28 11:00', 80, 0, ''],
  ['赵丽', '13999998888', '北京市通州区新华北路75号万达广场公寓1506', '密码锁设置', '新购买的密码锁需要安装调试', 'completed', '2026-05-22 16:00', 120, 5, '非常专业，讲解很清楚'],
  ['孙浩', '13444445555', '北京市大兴区黄村西大街115号院2号楼2单元402', '配钥匙', '需要配两把钥匙', 'pending', '2026-05-29 10:30', 30, 0, ''],
  ['周静', '13877776666', '北京市石景山古城大街39号院1号楼3单元102', '玻璃门锁', '办公室玻璃门锁损坏', 'completed', '2026-05-23 09:30', 100, 4, '修好后很好用'],
  ['吴峰', '13655558888', '北京市昌平区回龙观东大街199号院8号楼1单元1803', '防盗门开锁', '钥匙断在锁里了', 'in_progress', '2026-05-26 13:00', 160, 0, ''],
  ['郑华', '13466667777', '北京市房山区良乡拱辰大街18号院5号楼4单元602', '换锁芯', '想升级成C级锁芯', 'pending', '2026-05-30 14:00', 220, 0, '']
];

async function main() {
  try {
    await initDb();
    const hasData = await checkExisting();
    
    if (hasData) {
      console.log('Data already exists, initialization skipped.');
      db.close();
      process.exit(0);
    }

    for (const data of sampleData) {
      await insertOrder(data);
    }

    console.log('Data initialization completed successfully. 10 sample records inserted.');
    db.close();
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err);
    db.close();
    process.exit(1);
  }
}

main();
