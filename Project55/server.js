const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment');
const { query, run, get, initDatabase } = require('./database/db');

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(serve(path.join(__dirname, 'public')));

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
  } else {
    await next();
  }
});

router.get('/api/appliances', async (ctx) => {
  const { status, category } = ctx.query;
  let sql = 'SELECT * FROM appliances WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  sql += ' ORDER BY created_at DESC';

  const appliances = await query(sql, params);
  ctx.body = { success: true, data: appliances };
});

router.get('/api/appliances/:id', async (ctx) => {
  const { id } = ctx.params;
  const appliance = await get('SELECT * FROM appliances WHERE id = ?', [id]);
  
  if (appliance) {
    ctx.body = { success: true, data: appliance };
  } else {
    ctx.status = 404;
    ctx.body = { success: false, message: '家电不存在' };
  }
});

router.post('/api/appliances', async (ctx) => {
  const { name, category, description, brand, model, daily_price, location, image_url, contact_name, contact_phone } = ctx.request.body;

  if (!name || !category || !daily_price || !contact_name || !contact_phone) {
    ctx.status = 400;
    ctx.body = { success: false, message: '必填字段不能为空' };
    return;
  }

  const result = await run(`
    INSERT INTO appliances (name, category, description, brand, model, daily_price, location, image_url, contact_name, contact_phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `, [name, category, description || '', brand || '', model || '', daily_price, location || '', image_url || '', contact_name, contact_phone]);

  ctx.body = { success: true, data: { id: result.lastID, ...ctx.request.body } };
});

router.get('/api/rentals', async (ctx) => {
  const { status } = ctx.query;
  let sql = `
    SELECT r.*, a.name as appliance_name, a.daily_price, a.location
    FROM rentals r
    JOIN appliances a ON r.appliance_id = a.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY r.created_at DESC';

  const rentals = await query(sql, params);
  ctx.body = { success: true, data: rentals };
});

router.post('/api/rentals', async (ctx) => {
  const { appliance_id, renter_name, renter_phone, start_date, end_date } = ctx.request.body;

  if (!appliance_id || !renter_name || !renter_phone || !start_date || !end_date) {
    ctx.status = 400;
    ctx.body = { success: false, message: '必填字段不能为空' };
    return;
  }

  const appliance = await get('SELECT * FROM appliances WHERE id = ? AND status = "available"', [appliance_id]);
  if (!appliance) {
    ctx.status = 400;
    ctx.body = { success: false, message: '该家电不可租赁' };
    return;
  }

  const start = moment(start_date);
  const end = moment(end_date);
  const days = end.diff(start, 'days') + 1;

  if (days <= 0) {
    ctx.status = 400;
    ctx.body = { success: false, message: '结束日期必须晚于开始日期' };
    return;
  }

  const total_price = days * appliance.daily_price;

  const result = await run(`
    INSERT INTO rentals (appliance_id, renter_name, renter_phone, start_date, end_date, total_price, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `, [appliance_id, renter_name, renter_phone, start_date, end_date, total_price]);

  await run('UPDATE appliances SET status = "rented" WHERE id = ?', [appliance_id]);

  ctx.body = {
    success: true,
    data: {
      id: result.lastID,
      appliance_name: appliance.name,
      days,
      total_price,
      ...ctx.request.body
    }
  };
});

router.put('/api/rentals/:id/complete', async (ctx) => {
  const { id } = ctx.params;

  const rental = await get('SELECT * FROM rentals WHERE id = ?', [id]);
  if (!rental) {
    ctx.status = 404;
    ctx.body = { success: false, message: '租赁记录不存在' };
    return;
  }

  await run('UPDATE rentals SET status = "completed" WHERE id = ?', [id]);
  await run('UPDATE appliances SET status = "available" WHERE id = ?', [rental.appliance_id]);

  ctx.body = { success: true, message: '租赁已完成' };
});

router.get('/api/reminders', async (ctx) => {
  const today = moment().format('YYYY-MM-DD');
  const threeDaysLater = moment().add(3, 'days').format('YYYY-MM-DD');

  const reminders = await query(`
    SELECT r.*, a.name as appliance_name, a.contact_phone as owner_phone, 
           r.renter_name, r.renter_phone, r.end_date
    FROM rentals r
    JOIN appliances a ON r.appliance_id = a.id
    WHERE r.status = 'active' AND r.end_date <= ? AND r.end_date >= ?
    ORDER BY r.end_date ASC
  `, [threeDaysLater, today]);

  ctx.body = { success: true, data: reminders };
});

router.get('/api/categories', async (ctx) => {
  const categories = await query('SELECT DISTINCT category FROM appliances');
  ctx.body = { success: true, data: categories.map(c => c.category) };
});

app.use(router.routes()).use(router.allowedMethods());

async function checkExpiringRentals() {
  const today = moment().format('YYYY-MM-DD');
  const threeDaysLater = moment().add(3, 'days').format('YYYY-MM-DD');

  const expiringRentals = await query(`
    SELECT r.*, a.name as appliance_name, a.contact_name as owner_name, a.contact_phone as owner_phone
    FROM rentals r
    JOIN appliances a ON r.appliance_id = a.id
    WHERE r.status = 'active' AND r.end_date <= ? AND r.end_date >= ? AND r.reminder_sent = 0
  `, [threeDaysLater, today]);

  for (const rental of expiringRentals) {
    const daysUntilExpiry = moment(rental.end_date).diff(moment(), 'days');
    console.log(`[Reminder] Rental ID: ${rental.id}, Appliance: ${rental.appliance_name}, ${daysUntilExpiry} days left`);
    console.log(`  - Renter: ${rental.renter_name} (${rental.renter_phone})`);
    console.log(`  - End date: ${rental.end_date}`);
    
    await run('UPDATE rentals SET reminder_sent = 1 WHERE id = ?', [rental.id]);
  }

  if (expiringRentals.length > 0) {
    console.log(`Checked and sent ${expiringRentals.length} expiring reminders`);
  }
}

cron.schedule('0 9 * * *', () => {
  console.log('Running daily reminder check...');
  checkExpiringRentals();
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Open http://localhost:${PORT} in your browser`);
      
      setTimeout(checkExpiringRentals, 2000);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
