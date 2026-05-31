const express = require('express');
const router = express.Router();
const SettlementService = require('../services/settlementService');
const SettlementRecord = require('../models/settlementRecord');

router.get('/records', async (req, res) => {
  try {
    const records = await SettlementRecord.findAll(req.query);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/records/:id', async (req, res) => {
  try {
    const record = await SettlementRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Settlement record not found' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/records', async (req, res) => {
  try {
    const { transaction_id, settlement_currency } = req.body;
    if (!transaction_id || !settlement_currency) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const result = await SettlementService.createSettlement(transaction_id, settlement_currency);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/records/:id/process', async (req, res) => {
  try {
    const result = await SettlementService.processSettlement(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/batch-process', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Invalid settlement IDs' });
    }
    const results = await SettlementService.batchSettle(ids);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const records = await SettlementService.getPendingSettlements();
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const summary = await SettlementService.getSettlementSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auto-settle', async (req, res) => {
  try {
    const result = await SettlementService.autoSettle();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
