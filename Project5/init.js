const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'welfare.db');
const db = new sqlite3.Database(dbPath);

const items = [
    { name: '中秋月饼礼盒', category: '节日礼品', stock: 100, unit: '盒', description: '精美中秋月饼礼盒，含8种口味' },
    { name: '春节大礼包', category: '节日礼品', stock: 150, unit: '份', description: '春节年货大礼包，坚果糖果礼盒' },
    { name: '端午粽子礼盒', category: '节日礼品', stock: 120, unit: '盒', description: '端午鲜肉、豆沙粽子礼盒' },
    { name: '员工生日蛋糕卡', category: '生日福利', stock: 200, unit: '张', description: '品牌连锁蛋糕店兑换卡' },
    { name: '电影兑换券', category: '文化福利', stock: 300, unit: '张', description: '全国院线通兑电影票' },
    { name: '超市购物卡', category: '生活福利', stock: 100, unit: '张', description: '大型超市购物卡，面值500元' },
    { name: '防暑降温用品', category: '劳保用品', stock: 80, unit: '套', description: '夏季防暑降温清凉大礼包' },
    { name: '保温杯', category: '办公用品', stock: 60, unit: '个', description: '316不锈钢商务保温杯' }
];

const employees = [
    { name: '张伟', department: '技术部', position: '高级工程师', phone: '13800138001' },
    { name: '李娜', department: '市场部', position: '市场经理', phone: '13800138002' },
    { name: '王芳', department: '人事部', position: '人事主管', phone: '13800138003' },
    { name: '刘强', department: '财务部', position: '财务总监', phone: '13800138004' },
    { name: '陈静', department: '技术部', position: '前端工程师', phone: '13800138005' },
    { name: '赵磊', department: '运营部', position: '运营专员', phone: '13800138006' },
    { name: '孙丽', department: '行政部', position: '行政助理', phone: '13800138007' },
    { name: '周杰', department: '技术部', position: '后端工程师', phone: '13800138008' },
    { name: '吴敏', department: '市场部', position: '销售代表', phone: '13800138009' },
    { name: '郑涛', department: '技术部', position: '产品经理', phone: '13800138010' }
];

const batches = [
    { name: '2024年中秋节福利', description: '中秋佳节员工礼品发放', batch_date: '2024-09-15', status: 'completed' },
    { name: '2025年春节福利', description: '春节员工年货大礼包发放', batch_date: '2025-01-20', status: 'completed' },
    { name: '2025年端午节福利', description: '端午粽子礼盒发放', batch_date: '2025-06-10', status: 'active' },
    { name: '2025年员工生日福利', description: '年度员工生日蛋糕卡发放', batch_date: '2025-01-01', status: 'active' },
    { name: '2025年夏季防暑降温', description: '夏季高温防暑用品发放', batch_date: '2025-07-15', status: 'active' }
];

const records = [
    { employee_id: 1, item_id: 1, batch_id: 1, quantity: 1, receive_date: '2024-09-15', remark: '已领取' },
    { employee_id: 2, item_id: 1, batch_id: 1, quantity: 1, receive_date: '2024-09-15', remark: '已领取' },
    { employee_id: 3, item_id: 1, batch_id: 1, quantity: 1, receive_date: '2024-09-15', remark: '已领取' },
    { employee_id: 4, item_id: 1, batch_id: 1, quantity: 1, receive_date: '2024-09-16', remark: '代领' },
    { employee_id: 5, item_id: 1, batch_id: 1, quantity: 1, receive_date: '2024-09-16', remark: '已领取' },
    { employee_id: 1, item_id: 2, batch_id: 2, quantity: 1, receive_date: '2025-01-20', remark: '已领取' },
    { employee_id: 2, item_id: 2, batch_id: 2, quantity: 1, receive_date: '2025-01-20', remark: '已领取' },
    { employee_id: 3, item_id: 2, batch_id: 2, quantity: 1, receive_date: '2025-01-21', remark: '已领取' },
    { employee_id: 6, item_id: 2, batch_id: 2, quantity: 1, receive_date: '2025-01-21', remark: '已领取' },
    { employee_id: 7, item_id: 2, batch_id: 2, quantity: 1, receive_date: '2025-01-22', remark: '已领取' },
    { employee_id: 1, item_id: 4, batch_id: 4, quantity: 1, receive_date: '2025-03-10', remark: '生日福利' },
    { employee_id: 8, item_id: 4, batch_id: 4, quantity: 1, receive_date: '2025-04-05', remark: '生日福利' },
    { employee_id: 2, item_id: 4, batch_id: 4, quantity: 1, receive_date: '2025-05-12', remark: '生日福利' },
    { employee_id: 1, item_id: 5, batch_id: 4, quantity: 2, receive_date: '2025-02-15', remark: '文化福利' },
    { employee_id: 5, item_id: 5, batch_id: 4, quantity: 2, receive_date: '2025-02-15', remark: '文化福利' }
];

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function init() {
    await runQuery(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            stock INTEGER DEFAULT 0,
            unit TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await runQuery(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            department TEXT,
            position TEXT,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await runQuery(`
        CREATE TABLE IF NOT EXISTS batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            batch_date DATE,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await runQuery(`
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            batch_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            receive_date DATE,
            remark TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            FOREIGN KEY (item_id) REFERENCES items(id),
            FOREIGN KEY (batch_id) REFERENCES batches(id)
        )
    `);

    const itemCount = await getQuery('SELECT COUNT(*) as count FROM items');
    if (itemCount.count === 0) {
        for (const item of items) {
            await runQuery('INSERT INTO items (name, category, stock, unit, description) VALUES (?, ?, ?, ?, ?)',
                [item.name, item.category, item.stock, item.unit, item.description]);
        }
        console.log('Items initialized successfully');
    }

    const empCount = await getQuery('SELECT COUNT(*) as count FROM employees');
    if (empCount.count === 0) {
        for (const emp of employees) {
            await runQuery('INSERT INTO employees (name, department, position, phone) VALUES (?, ?, ?, ?)',
                [emp.name, emp.department, emp.position, emp.phone]);
        }
        console.log('Employees initialized successfully');
    }

    const batchCount = await getQuery('SELECT COUNT(*) as count FROM batches');
    if (batchCount.count === 0) {
        for (const batch of batches) {
            await runQuery('INSERT INTO batches (name, description, batch_date, status) VALUES (?, ?, ?, ?)',
                [batch.name, batch.description, batch.batch_date, batch.status]);
        }
        console.log('Batches initialized successfully');
    }

    const recordCount = await getQuery('SELECT COUNT(*) as count FROM records');
    if (recordCount.count === 0) {
        for (const record of records) {
            await runQuery('INSERT INTO records (employee_id, item_id, batch_id, quantity, receive_date, remark) VALUES (?, ?, ?, ?, ?, ?)',
                [record.employee_id, record.item_id, record.batch_id, record.quantity, record.receive_date, record.remark]);
        }
        console.log('Records initialized successfully');
    }

    console.log('Database initialization completed');
    db.close();
}

init().catch(err => {
    console.error('Init failed:', err);
    process.exit(1);
});
