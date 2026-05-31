const Transaction = require('../models/transaction');
const SettlementRecord = require('../models/settlementRecord');
const ExchangeRate = require('../models/exchangeRate');
const Account = require('../models/account');
const { all } = require('../config/database');

class SettlementService {
  static async createSettlement(transactionId, settlementCurrency) {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Only completed transactions can be settled');
    }

    let settlementAmount = transaction.amount;
    if (transaction.from_currency !== settlementCurrency) {
      const rate = await ExchangeRate.getRate(transaction.from_currency, settlementCurrency);
      if (rate === null) {
        throw new Error('Exchange rate not available for settlement');
      }
      settlementAmount = transaction.amount * rate;
    }

    const settlement = await SettlementRecord.create({
      transaction_id: transactionId,
      settlement_currency: settlementCurrency,
      settlement_amount: settlementAmount,
      settlement_status: 'pending'
    });

    return {
      settlement_id: settlement.lastID,
      transaction_id: transactionId,
      settlement_currency: settlementCurrency,
      settlement_amount: settlementAmount
    };
  }

  static async processSettlement(settlementId) {
    const settlement = await SettlementRecord.findById(settlementId);
    if (!settlement) {
      throw new Error('Settlement record not found');
    }

    if (settlement.settlement_status !== 'pending') {
      throw new Error('Settlement already processed');
    }

    try {
      await this.executeSettlement(settlement);

      await SettlementRecord.updateStatus(settlementId, 'settled');

      return { success: true, message: 'Settlement processed successfully' };
    } catch (error) {
      await SettlementRecord.updateStatus(settlementId, 'failed');
      throw error;
    }
  }

  static async executeSettlement(settlement) {
    const simulatedDelay = Math.random() * 1000 + 200;
    await new Promise(resolve => setTimeout(resolve, simulatedDelay));

    const successRate = 0.98;
    if (Math.random() > successRate) {
      throw new Error('Settlement execution failed');
    }

    return true;
  }

  static async batchSettle(settlementIds) {
    const results = [];
    for (const id of settlementIds) {
      try {
        const result = await this.processSettlement(id);
        results.push({ id, success: true, ...result });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }

  static async getPendingSettlements() {
    return await SettlementRecord.findAll({ settlement_status: 'pending' });
  }

  static async getSettlementSummary() {
    const stats = await SettlementRecord.getStatistics();
    return stats;
  }

  static async getSettlementByDateRange(startDate, endDate) {
    return await all(`
      SELECT sr.*, t.amount, t.from_currency, t.to_currency, t.user_id, u.username, u.real_name
      FROM settlement_records sr
      LEFT JOIN transactions t ON sr.transaction_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE sr.created_at BETWEEN ? AND ?
      ORDER BY sr.created_at DESC
    `, [startDate, endDate]);
  }

  static async autoSettle() {
    const pendingSettlements = await this.getPendingSettlements();
    const results = [];

    for (const settlement of pendingSettlements) {
      try {
        await this.processSettlement(settlement.id);
        results.push({ id: settlement.id, success: true });
      } catch (error) {
        results.push({ id: settlement.id, success: false, error: error.message });
      }
    }

    return {
      total: pendingSettlements.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }
}

module.exports = SettlementService;
