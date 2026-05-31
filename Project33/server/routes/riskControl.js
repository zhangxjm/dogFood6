const express = require('express');
const router = express.Router();
const RiskRule = require('../models/riskRule');
const RiskAlert = require('../models/riskAlert');
const Transaction = require('../models/transaction');

router.get('/rules', async (req, res) => {
  try {
    const rules = await RiskRule.findAll();
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const { rule_name, rule_type, condition, threshold, action, priority, description } = req.body;
    if (!rule_name || !rule_type || !condition) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const result = await RiskRule.create({ rule_name, rule_type, condition, threshold, action, priority, description });
    const rule = await RiskRule.findById(result.lastID);
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/rules/:id', async (req, res) => {
  try {
    const result = await RiskRule.update(req.params.id, req.body);
    if (!result || result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    const rule = await RiskRule.findById(req.params.id);
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const result = await RiskRule.delete(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const alerts = await RiskAlert.findAll(req.query);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alerts/:id', async (req, res) => {
  try {
    const alert = await RiskAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const result = await RiskAlert.resolve(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }
    res.json({ success: true, message: 'Alert resolved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/statistics', async (req, res) => {
  try {
    const alertStats = await RiskAlert.getStatistics();
    const transactionStats = await Transaction.getStatistics();
    res.json({
      success: true,
      data: {
        alerts: alertStats,
        transactions: transactionStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/transactions/:id/unblock', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    await Transaction.unblockTransaction(req.params.id);
    res.json({ success: true, message: 'Transaction unblocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
