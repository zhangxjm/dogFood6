const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = req.db;
    const services = db.prepare(`SELECT * FROM service_types ORDER BY category, id`).all();
    
    const categories = {};
    services.forEach(service => {
      if (!categories[service.category]) {
        categories[service.category] = [];
      }
      categories[service.category].push(service);
    });
    
    const pendingResult = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`).get();
    const completedResult = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'`).get();
    
    res.render('index', {
      categories,
      pendingCount: pendingResult.count,
      completedCount: completedResult.count
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
