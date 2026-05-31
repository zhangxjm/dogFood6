const express = require('express');
const router = express.Router();
const SeataTransaction = require('../models/seataTransaction');

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await SeataTransaction.findAll(req.query);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/transactions/:xid', async (req, res) => {
  try {
    const transaction = await SeataTransaction.findByXid(req.params.xid);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/begin', async (req, res) => {
  try {
    const { transaction_id } = req.body;
    if (!transaction_id) {
      return res.status(400).json({ success: false, error: 'Missing transaction_id' });
    }
    const xid = await SeataTransaction.begin(transaction_id);
    res.json({ success: true, data: { xid, transaction_id } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/commit/:xid', async (req, res) => {
  try {
    const result = await SeataTransaction.commit(req.params.xid);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction committed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rollback/:xid', async (req, res) => {
  try {
    const result = await SeataTransaction.rollback(req.params.xid);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction rolled back successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
