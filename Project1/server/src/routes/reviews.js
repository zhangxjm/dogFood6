const express = require('express');
const router = express.Router();

router.post('/order/:id', async (req, res) => {
  try {
    const order = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await req.db.run(`
      UPDATE orders SET
        rating = ?,
        review = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [rating, review || '', req.params.id]);

    const updated = await req.db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const reviews = await req.db.all(`
      SELECT id, customer_name, service_type, rating, review, address, created_at
      FROM orders
      WHERE rating IS NOT NULL AND rating > 0
      ORDER BY updated_at DESC
      LIMIT 20
    `);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
