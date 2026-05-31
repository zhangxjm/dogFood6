const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = req.db;
    const services = db.prepare(`SELECT * FROM service_types ORDER BY category, id`).all();
    res.render('services/index', { services });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
