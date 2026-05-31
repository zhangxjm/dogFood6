const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'welfare.db');

let db;

function initDatabase() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dbPath)) {
            console.log('Database not found, initializing...');
            require('./init.js');
            setTimeout(() => {
                db = new sqlite3.Database(dbPath, resolve);
            }, 1000);
        } else {
            db = new sqlite3.Database(dbPath, resolve);
        }
    });
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.title = '公司福利管理系统';
    next();
});

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

app.get('/', async (req, res) => {
    try {
        const stats = {
            totalItems: (await getOne('SELECT COUNT(*) as count FROM items')).count,
            totalEmployees: (await getOne('SELECT COUNT(*) as count FROM employees')).count,
            totalBatches: (await getOne('SELECT COUNT(*) as count FROM batches')).count,
            totalRecords: (await getOne('SELECT COUNT(*) as count FROM records')).count,
            totalStock: (await getOne('SELECT SUM(stock) as total FROM items')).total || 0,
            activeBatches: (await getOne('SELECT COUNT(*) as count FROM batches WHERE status = ?', ['active'])).count
        };

        const recentRecords = await query(`
            SELECT r.*, e.name as employee_name, i.name as item_name, b.name as batch_name
            FROM records r
            JOIN employees e ON r.employee_id = e.id
            JOIN items i ON r.item_id = i.id
            JOIN batches b ON r.batch_id = b.id
            ORDER BY r.created_at DESC
            LIMIT 10
        `);

        const popularItems = await query(`
            SELECT i.*, COALESCE(SUM(r.quantity), 0) as total_distributed
            FROM items i
            LEFT JOIN records r ON i.id = r.item_id
            GROUP BY i.id
            ORDER BY total_distributed DESC
            LIMIT 5
        `);

        res.render('index', { stats, recentRecords, popularItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/items', async (req, res) => {
    try {
        const items = await query('SELECT * FROM items ORDER BY created_at DESC');
        res.render('items', { items });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/items', async (req, res) => {
    try {
        const { name, category, stock, unit, description } = req.body;
        await run('INSERT INTO items (name, category, stock, unit, description) VALUES (?, ?, ?, ?, ?)', 
            [name, category, stock || 0, unit, description]);
        res.redirect('/items');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.put('/items/:id', async (req, res) => {
    try {
        const { name, category, stock, unit, description } = req.body;
        await run('UPDATE items SET name = ?, category = ?, stock = ?, unit = ?, description = ? WHERE id = ?',
            [name, category, stock || 0, unit, description, req.params.id]);
        res.redirect('/items');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.delete('/items/:id', async (req, res) => {
    try {
        await run('DELETE FROM items WHERE id = ?', [req.params.id]);
        res.redirect('/items');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/employees', async (req, res) => {
    try {
        const employees = await query('SELECT * FROM employees ORDER BY created_at DESC');
        res.render('employees', { employees });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/employees', async (req, res) => {
    try {
        const { name, department, position, phone } = req.body;
        await run('INSERT INTO employees (name, department, position, phone) VALUES (?, ?, ?, ?)',
            [name, department, position, phone]);
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.put('/employees/:id', async (req, res) => {
    try {
        const { name, department, position, phone } = req.body;
        await run('UPDATE employees SET name = ?, department = ?, position = ?, phone = ? WHERE id = ?',
            [name, department, position, phone, req.params.id]);
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.delete('/employees/:id', async (req, res) => {
    try {
        await run('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/batches', async (req, res) => {
    try {
        const batches = await query('SELECT * FROM batches ORDER BY created_at DESC');
        res.render('batches', { batches });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/batches', async (req, res) => {
    try {
        const { name, description, batch_date, status } = req.body;
        await run('INSERT INTO batches (name, description, batch_date, status) VALUES (?, ?, ?, ?)',
            [name, description, batch_date, status || 'active']);
        res.redirect('/batches');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.put('/batches/:id', async (req, res) => {
    try {
        const { name, description, batch_date, status } = req.body;
        await run('UPDATE batches SET name = ?, description = ?, batch_date = ?, status = ? WHERE id = ?',
            [name, description, batch_date, status, req.params.id]);
        res.redirect('/batches');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.delete('/batches/:id', async (req, res) => {
    try {
        await run('DELETE FROM batches WHERE id = ?', [req.params.id]);
        res.redirect('/batches');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/records', async (req, res) => {
    try {
        const records = await query(`
            SELECT r.*, e.name as employee_name, i.name as item_name, b.name as batch_name
            FROM records r
            JOIN employees e ON r.employee_id = e.id
            JOIN items i ON r.item_id = i.id
            JOIN batches b ON r.batch_id = b.id
            ORDER BY r.created_at DESC
        `);

        const employees = await query('SELECT * FROM employees ORDER BY name');
        const items = await query('SELECT * FROM items ORDER BY name');
        const batches = await query('SELECT * FROM batches ORDER BY name');

        res.render('records', { records, employees, items, batches });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/records', async (req, res) => {
    try {
        const { employee_id, item_id, batch_id, quantity, receive_date, remark } = req.body;
        const qty = quantity || 1;
        
        await run('INSERT INTO records (employee_id, item_id, batch_id, quantity, receive_date, remark) VALUES (?, ?, ?, ?, ?, ?)',
            [employee_id, item_id, batch_id, qty, receive_date, remark]);
        await run('UPDATE items SET stock = stock - ? WHERE id = ?', [qty, item_id]);
        
        res.redirect('/records');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.delete('/records/:id', async (req, res) => {
    try {
        const record = await getOne('SELECT * FROM records WHERE id = ?', [req.params.id]);
        if (record) {
            await run('UPDATE items SET stock = stock + ? WHERE id = ?', [record.quantity, record.item_id]);
            await run('DELETE FROM records WHERE id = ?', [req.params.id]);
        }
        res.redirect('/records');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const batchStats = await query(`
            SELECT b.id, b.name, b.status, 
                   COUNT(DISTINCT r.employee_id) as employee_count,
                   COALESCE(SUM(r.quantity), 0) as total_quantity,
                   COUNT(r.id) as record_count
            FROM batches b
            LEFT JOIN records r ON b.id = r.batch_id
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `);

        const departmentStats = await query(`
            SELECT e.department, 
                   COUNT(DISTINCT e.id) as employee_count,
                   COUNT(r.id) as record_count,
                   COALESCE(SUM(r.quantity), 0) as total_items
            FROM employees e
            LEFT JOIN records r ON e.id = r.employee_id
            GROUP BY e.department
            ORDER BY employee_count DESC
        `);

        res.json({ batchStats, departmentStats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
