const express = require('express');
const router = express.Router();
const PaymentService = require('../services/paymentService');
const RiskControlService = require('../services/riskControlService');
const Transaction = require('../models/transaction');
const Account = require('../models/account');

router.post('/', async (req, res) => {
  try {
    const { user_id, from_account_id, to_account_id, from_currency, to_currency, amount, transaction_type, payment_method } = req.body;
    
    if (!user_id || !from_currency || !to_currency || !amount || !transaction_type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const paymentResult = await PaymentService.createPayment({
      user_id,
      from_account_id,
      to_account_id,
      from_currency,
      to_currency,
      amount,
      transaction_type,
      payment_method
    });

    const transaction = await Transaction.findById(paymentResult.transaction_id);
    const riskResult = await RiskControlService.evaluateTransaction(transaction);

    if (riskResult.should_block) {
      return res.json({
        success: true,
        data: {
          ...paymentResult,
          risk_assessment: riskResult,
          blocked: true,
          message: 'Transaction blocked due to high risk'
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...paymentResult,
        risk_assessment: riskResult
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/process', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    if (transaction.is_blocked) {
      return res.status(403).json({ success: false, error: 'Transaction is blocked by risk control' });
    }

    const result = await PaymentService.processPayment(req.params.id);
    
    await RiskControlService.updateAccountRiskLevel(transaction.user_id);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/refund', async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await PaymentService.refundPayment(req.params.id, reason);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/status', async (req, res) => {
  try {
    const status = await PaymentService.getPaymentStatus(req.params.id);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.findByUserId(req.params.userId, req.query);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
