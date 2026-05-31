const Transaction = require('../models/transaction');
const RiskRule = require('../models/riskRule');
const RiskAlert = require('../models/riskAlert');
const Account = require('../models/account');
const { get, all } = require('../config/database');

class RiskControlService {
  static async evaluateTransaction(transaction) {
    const rules = await RiskRule.findAll();
    const riskDetails = [];
    let riskScore = 0;
    let riskLevel = 'low';
    let shouldBlock = false;

    for (const rule of rules) {
      const result = await this.checkRule(rule, transaction);
      if (result.triggered) {
        riskDetails.push({
          rule_id: rule.id,
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          score: result.score,
          action: rule.action,
          description: result.description
        });

        riskScore += result.score;

        if (rule.action === 'block' && result.score > 0) {
          shouldBlock = true;
        }
      }
    }

    if (riskScore >= 80) {
      riskLevel = 'critical';
    } else if (riskScore >= 60) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
    }

    await Transaction.updateRiskInfo(transaction.id, riskScore, riskLevel, riskDetails);

    if (shouldBlock || riskLevel === 'critical') {
      await Transaction.blockTransaction(transaction.id, 'High risk transaction detected');
      
      for (const detail of riskDetails) {
        if (detail.action === 'block') {
          await RiskAlert.create({
            transaction_id: transaction.id,
            rule_id: detail.rule_id,
            alert_type: 'block',
            alert_level: 'critical',
            description: detail.description
          });
        }
      }
    } else if (riskLevel === 'high') {
      for (const detail of riskDetails) {
        await RiskAlert.create({
          transaction_id: transaction.id,
          rule_id: detail.rule_id,
          alert_type: 'warning',
          alert_level: 'high',
          description: detail.description
        });
      }
    }

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      should_block: shouldBlock,
      risk_details: riskDetails
    };
  }

  static async checkRule(rule, transaction) {
    const triggered = { triggered: false, score: 0, description: '' };

    try {
      switch (rule.rule_type) {
        case 'amount_threshold':
          if (transaction.amount > rule.threshold) {
            triggered.triggered = true;
            triggered.score = rule.priority * 10;
            triggered.description = `Transaction amount ${transaction.amount} exceeds threshold ${rule.threshold}`;
          }
          break;

        case 'frequency':
          const recentTransactions = await this.getRecentTransactions(transaction.user_id, 24);
          if (recentTransactions > rule.threshold) {
            triggered.triggered = true;
            triggered.score = rule.priority * 10;
            triggered.description = `Transaction frequency ${recentTransactions}/24h exceeds threshold ${rule.threshold}`;
          }
          break;

        case 'country_restriction':
          const restrictedCountries = JSON.parse(rule.condition);
          if (restrictedCountries.includes(transaction.to_currency)) {
            triggered.triggered = true;
            triggered.score = rule.priority * 15;
            triggered.description = `Transaction to restricted currency: ${transaction.to_currency}`;
          }
          break;

        case 'suspicious_pattern':
          if (await this.detectSuspiciousPattern(transaction)) {
            triggered.triggered = true;
            triggered.score = rule.priority * 20;
            triggered.description = 'Suspicious transaction pattern detected';
          }
          break;

        case 'balance_check':
          if (transaction.from_account_id) {
            const account = await Account.findById(transaction.from_account_id);
            if (account && account.balance < transaction.amount * rule.threshold) {
              triggered.triggered = true;
              triggered.score = rule.priority * 5;
              triggered.description = 'Insufficient balance for transaction';
            }
          }
          break;

        case 'night_time':
          const hour = new Date().getHours();
          if (hour >= 0 && hour < 6 && transaction.amount > rule.threshold) {
            triggered.triggered = true;
            triggered.score = rule.priority * 8;
            triggered.description = `Night time transaction (${hour}:00) with amount ${transaction.amount}`;
          }
          break;

        case 'velocity':
          const velocityScore = await this.checkVelocity(transaction);
          if (velocityScore > 0) {
            triggered.triggered = true;
            triggered.score = velocityScore;
            triggered.description = 'High transaction velocity detected';
          }
          break;

        case 'round_amount':
          if (transaction.amount % 10000 === 0 && transaction.amount > rule.threshold) {
            triggered.triggered = true;
            triggered.score = rule.priority * 7;
            triggered.description = `Round amount transaction: ${transaction.amount}`;
          }
          break;

        case 'new_account':
          const accountAge = await this.getAccountAge(transaction.user_id);
          if (accountAge < 7 && transaction.amount > rule.threshold) {
            triggered.triggered = true;
            triggered.score = rule.priority * 10;
            triggered.description = `New account (${accountAge} days) with large transaction: ${transaction.amount}`;
          }
          break;
      }
    } catch (error) {
      console.error(`Error checking rule ${rule.id}:`, error);
    }

    return triggered;
  }

  static async getRecentTransactions(userId, hours) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const result = await get(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND created_at > ? AND status != ?',
      [userId, since, 'blocked']
    );
    return result.count;
  }

  static async detectSuspiciousPattern(transaction) {
    if (transaction.amount > 50000 && transaction.from_currency !== transaction.to_currency) {
      return true;
    }
    
    const recentLargeTransactions = await get(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND amount > ? AND created_at > ?',
      [transaction.user_id, transaction.amount * 0.8, new Date(Date.now() - 3600000).toISOString()]
    );
    
    return recentLargeTransactions.count > 3;
  }

  static async checkVelocity(transaction) {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const recentTotal = await get(
      'SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND created_at > ? AND status != ?',
      [transaction.user_id, oneHourAgo, 'blocked']
    );
    
    if (recentTotal.total && recentTotal.total > 100000) {
      return 25;
    }
    if (recentTotal.total && recentTotal.total > 50000) {
      return 15;
    }
    return 0;
  }

  static async getAccountAge(userId) {
    const user = require('../models/user').findById(userId);
    if (!user) return 0;
    const created = new Date(user.created_at);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
  }

  static async updateAccountRiskLevel(userId) {
    const accounts = await Account.findByUserId(userId);
    const recentRiskScore = await get(
      'SELECT AVG(risk_score) as avg_score FROM transactions WHERE user_id = ? AND created_at > ?',
      [userId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()]
    );
    
    let newRiskLevel = 'low';
    if (recentRiskScore.avg_score >= 60) {
      newRiskLevel = 'high';
    } else if (recentRiskScore.avg_score >= 30) {
      newRiskLevel = 'medium';
    }
    
    for (const account of accounts) {
      await Account.updateRiskLevel(account.id, newRiskLevel);
    }
  }
}

module.exports = RiskControlService;
