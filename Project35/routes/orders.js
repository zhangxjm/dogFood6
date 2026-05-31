const express = require('express');
const router = express.Router();

function generateOrderNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REP${year}${month}${day}${random}`;
}

router.get('/', (req, res) => {
  try {
    const db = req.db;
    const status = req.query.status || 'all';
    let orders;
    
    if (status === 'all') {
      orders = db.prepare(`
        SELECT orders.*, service_types.name as service_name, service_types.base_price, technicians.name as technician_name
        FROM orders
        LEFT JOIN service_types ON orders.service_type_id = service_types.id
        LEFT JOIN technicians ON orders.technician_id = technicians.id
        ORDER BY orders.created_at DESC
      `).all();
    } else {
      orders = db.prepare(`
        SELECT orders.*, service_types.name as service_name, service_types.base_price, technicians.name as technician_name
        FROM orders
        LEFT JOIN service_types ON orders.service_type_id = service_types.id
        LEFT JOIN technicians ON orders.technician_id = technicians.id
        WHERE orders.status = ?
        ORDER BY orders.created_at DESC
      `).all(status);
    }
    
    const statusMap = {
      'pending': '待处理',
      'assigned': '已派单',
      'processing': '维修中',
      'completed': '已完成'
    };
    
    res.render('orders/index', { orders, status, statusMap });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/new', (req, res) => {
  try {
    const db = req.db;
    const serviceId = req.query.service_id;
    const services = db.prepare(`SELECT * FROM service_types ORDER BY id`).all();
    res.render('orders/new', { services, selectedServiceId: serviceId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/', (req, res) => {
  try {
    const db = req.db;
    const { customer_name, customer_phone, customer_address, service_type_id, appointment_date, appointment_time, problem_description } = req.body;
    const order_no = generateOrderNo();
    
    const service = db.prepare(`SELECT * FROM service_types WHERE id = ?`).get(service_type_id);
    const technician = db.prepare(`SELECT * FROM technicians WHERE status = 'available' ORDER BY RANDOM() LIMIT 1`).get();
    
    const technician_id = technician ? technician.id : null;
    const status = technician ? 'assigned' : 'pending';
    const total_price = service ? service.base_price : 0;
    
    db.prepare(`
      INSERT INTO orders (order_no, customer_name, customer_phone, customer_address, service_type_id, technician_id, appointment_date, appointment_time, problem_description, status, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(order_no, customer_name, customer_phone, customer_address, service_type_id, technician_id, appointment_date, appointment_time, problem_description, status, total_price);
    
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    
    const order = db.prepare(`
      SELECT orders.*, service_types.name as service_name, service_types.description as service_description, 
             service_types.base_price, technicians.name as technician_name, technicians.phone as technician_phone, technicians.specialty as technician_specialty
      FROM orders
      LEFT JOIN service_types ON orders.service_type_id = service_types.id
      LEFT JOIN technicians ON orders.technician_id = technicians.id
      WHERE orders.id = ?
    `).get(id);
    
    if (!order) {
      return res.status(404).send('Order not found');
    }
    
    const statusMap = {
      'pending': '待处理',
      'assigned': '已派单',
      'processing': '维修中',
      'completed': '已完成'
    };
    
    res.render('orders/show', { order, statusMap });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/assign', (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const order = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    const technician = db.prepare(`SELECT * FROM technicians WHERE status = 'available' ORDER BY RANDOM() LIMIT 1`).get();
    if (technician) {
      db.prepare(`UPDATE orders SET status = 'assigned', technician_id = ? WHERE id = ?`).run(technician.id, id);
    } else {
      db.prepare(`UPDATE orders SET status = 'assigned' WHERE id = ?`).run(id);
    }
    res.redirect(`/orders/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/start', (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    db.prepare(`UPDATE orders SET status = 'processing' WHERE id = ?`).run(id);
    res.redirect(`/orders/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/:id/complete', (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    const { remark, actual_price } = req.body;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.prepare(`UPDATE orders SET status = 'completed', completed_at = ?, remark = ?, total_price = ? WHERE id = ?`).run(now, remark || '', actual_price, id);
    res.redirect(`/orders/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = req.db;
    const { id } = req.params;
    db.prepare(`DELETE FROM orders WHERE id = ?`).run(id);
    res.redirect('/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
