const express = require('express');
const router = express.Router();
const ExchangeRate = require('../models/exchangeRate');

router.get('/', async (req, res) => {
  try {
    const rates = await ExchangeRate.getAll();
    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/convert', async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const rate = await ExchangeRate.getRate(from, to);
    if (rate === null) {
      return res.status(404).json({ success: false, error: 'Exchange rate not available' });
    }
    const converted = parseFloat(amount) * rate;
    res.json({
      success: true,
      data: {
        from_currency: from,
        to_currency: to,
        original_amount: parseFloat(amount),
        exchange_rate: rate,
        converted_amount: converted
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { from_currency, to_currency, rate } = req.body;
    if (!from_currency || !to_currency || !rate) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    await ExchangeRate.createOrUpdate(from_currency, to_currency, parseFloat(rate));
    const updatedRate = await ExchangeRate.getRate(from_currency, to_currency);
    res.json({
      success: true,
      data: { from_currency, to_currency, rate: updatedRate }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:from/:to', async (req, res) => {
  try {
    const rate = await ExchangeRate.getRate(req.params.from, req.params.to);
    if (rate === null) {
      return res.status(404).json({ success: false, error: 'Exchange rate not available' });
    }
    res.json({
      success: true,
      data: {
        from_currency: req.params.from,
        to_currency: req.params.to,
        rate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
