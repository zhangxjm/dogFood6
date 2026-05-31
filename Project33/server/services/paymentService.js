const Transaction = require('../models/transaction');
const Account = require('../models/account');
const ExchangeRate = require('../models/exchangeRate');
const SeataTransaction = require('../models/seataTransaction');
const { v4: uuidv4 } = require('uuid');

class PaymentService {
  static async createPayment(paymentData) {
    const transactionId = uuidv4();
    
    let exchangeRate = null;
    let convertedAmount = null;
    if (paymentData.from_currency !== paymentData.to_currency) {
      exchangeRate = await ExchangeRate.getRate(paymentData.from_currency, paymentData.to_currency);
      if (exchangeRate === null) {
        throw new Error('Exchange rate not available for this currency pair');
      }
      convertedAmount = paymentData.amount * exchangeRate;
    } else {
      exchangeRate = 1;
      convertedAmount = paymentData.amount;
    }

    const fee = this.calculateFee(paymentData.amount, paymentData.transaction_type);

    const seataXid = SeataTransaction.generateXid();

    const transaction = {
      id: transactionId,
      user_id: paymentData.user_id,
      from_account_id: paymentData.from_account_id || null,
      to_account_id: paymentData.to_account_id || null,
      from_currency: paymentData.from_currency,
      to_currency: paymentData.to_currency,
      amount: paymentData.amount,
      converted_amount: convertedAmount,
      exchange_rate: exchangeRate,
      fee: fee,
      status: 'pending',
      transaction_type: paymentData.transaction_type,
      payment_method: paymentData.payment_method || 'bank_transfer',
      seata_xid: seataXid
    };

    await Transaction.create(transaction);
    await SeataTransaction.create(seataXid, transactionId, 'begin');

    return {
      transaction_id: transactionId,
      seata_xid: seataXid,
      amount: paymentData.amount,
      converted_amount: convertedAmount,
      fee: fee,
      exchange_rate: exchangeRate
    };
  }

  static calculateFee(amount, transactionType) {
    let feeRate = 0.001;
    
    switch (transactionType) {
      case 'cross_border':
        feeRate = 0.005;
        break;
      case 'exchange':
        feeRate = 0.002;
        break;
      case 'withdrawal':
        feeRate = 0.003;
        break;
      default:
        feeRate = 0.001;
    }

    return amount * feeRate;
  }

  static async processPayment(transactionId) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.is_blocked) {
      throw new Error('Transaction is blocked by risk control');
    }

    if (transaction.status !== 'pending') {
      throw new Error('Transaction already processed');
    }

    try {
      if (transaction.from_account_id) {
        const fromAccount = await Account.findById(transaction.from_account_id);
        if (!fromAccount) {
          throw new Error('Source account not found');
        }
        if (fromAccount.balance < transaction.amount + transaction.fee) {
          throw new Error('Insufficient balance');
        }
        await Account.freezeAmount(transaction.from_account_id, transaction.amount + transaction.fee);
      }

      await Transaction.updateStatus(transactionId, 'processing');

      const thirdPartyResult = await this.callThirdPartyPayment(transaction);
      
      if (thirdPartyResult.success) {
        await Transaction.updateThirdPartyTradeId(transactionId, thirdPartyResult.tradeId);

        if (transaction.from_account_id) {
          await Account.deductFromFrozen(transaction.from_account_id, transaction.amount + transaction.fee);
        }

        if (transaction.to_account_id) {
          await Account.addBalance(transaction.to_account_id, transaction.converted_amount || transaction.amount);
        }

        await Transaction.updateStatus(transactionId, 'completed');
        await SeataTransaction.commit(transaction.seata_xid);

        return { success: true, message: 'Payment processed successfully' };
      } else {
        throw new Error(thirdPartyResult.error || 'Third party payment failed');
      }
    } catch (error) {
      if (transaction.from_account_id) {
        await Account.unfreezeAmount(transaction.from_account_id, transaction.amount + transaction.fee);
      }
      await Transaction.updateStatus(transactionId, 'failed');
      await SeataTransaction.rollback(transaction.seata_xid);
      throw error;
    }
  }

  static async callThirdPartyPayment(transaction) {
    const simulatedDelay = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));

    const successRate = 0.95;
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
      return {
        success: true,
        tradeId: `TP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Third party payment declined'
      };
    }
  }

  static async refundPayment(transactionId, reason) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Only completed transactions can be refunded');
    }

    const refundXid = SeataTransaction.generateXid();

    try {
      if (transaction.from_account_id) {
        await Account.addBalance(transaction.from_account_id, transaction.amount + transaction.fee);
      }

      if (transaction.to_account_id) {
        await Account.deductBalance(transaction.to_account_id, transaction.converted_amount || transaction.amount);
      }

      await Transaction.updateStatus(transactionId, 'refunded');
      await SeataTransaction.create(refundXid, transactionId, 'committed');

      return { success: true, message: 'Refund processed successfully' };
    } catch (error) {
      await SeataTransaction.create(refundXid, transactionId, 'rollback');
      throw error;
    }
  }

  static async getPaymentStatus(transactionId) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return {
      transaction_id: transactionId,
      status: transaction.status,
      is_blocked: transaction.is_blocked === 1,
      block_reason: transaction.block_reason,
      risk_score: transaction.risk_score,
      risk_level: transaction.risk_level,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    };
  }
}

module.exports = PaymentService;
