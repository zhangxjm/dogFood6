const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, keyword } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (keyword) {
      sql += ' AND (customer_name LIKE ? OR phone LIKE ? OR address LIKE ?)';
      const like = `%${keyword}%`;
      params.push(like, like, like);
    }

    sql += ' ORDER BY created_at DESC';
    const orders = await req.db.all(sql, params);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_name, phone, address, service_type, description, appointment_time, price } = req.body;

    if (!customer_name || !phone || !address || !service_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await req.db.run(`
      INSERT INTO orders (customer_name, phone, address, service_type, description, appointment_time, price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [customer_name, phone, address, service_type, description || '', appointment_time || null, price || 0]);

    const order = await req.db.get('SELECT * FROM orders WHERE id = ?', [result.lastID]);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const order = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { customer_name, phone, address, service_type, description, status, appointment_time, price } = req.body;

    await req.db.run(`
      UPDATE orders SET
        customer_name = COALESCE(?, customer_name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        service_type = COALESCE(?, service_type),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        appointment_time = COALESCE(?, appointment_time),
        price = COALESCE(?, price),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      customer_name || null,
      phone || null,
      address || null,
      service_type || null,
      description !== undefined ? description : null,
      status || null,
      appointment_time || null,
      price !== undefined ? price : null,
      req.params.id
    ]);

    const updated = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const order = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await req.db.run("UPDATE orders SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?",
      [status, req.params.id]);

    const updated = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await req.db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
