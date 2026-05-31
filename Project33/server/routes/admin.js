const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Account = require('../models/account');
const Transaction = require('../models/transaction');

router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll(req.query);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, password, real_name, phone, email } = req.body;
    if (!username || !password || !real_name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const result = await User.create({ username, password, real_name, phone, email });
    const user = await User.findById(result.lastID);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const result = await User.update(req.params.id, req.body);
    if (!result || result.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const user = await User.findById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.findAll(req.query);
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users/:userId/accounts', async (req, res) => {
  try {
    const accounts = await Account.findByUserId(req.params.userId);
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.findAll(req.query);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
