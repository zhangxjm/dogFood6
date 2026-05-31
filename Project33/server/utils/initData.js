const initDatabase = require('../models/init');
const User = require('../models/user');
const Account = require('../models/account');
const ExchangeRate = require('../models/exchangeRate');
const RiskRule = require('../models/riskRule');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/transaction');
const { get } = require('../config/database');

const initData = async () => {
  console.log('Starting database initialization...\n');

  await initDatabase();
  console.log('Database tables initialized');

  const existingUsers = await get('SELECT COUNT(*) as count FROM users');
  if (existingUsers.count > 0) {
    console.log('Data already exists, skipping initialization\n');
    console.log('Initialization completed!\n');
    return;
  }

  console.log('Creating users...');
  const users = [
    { username: 'admin', password: 'admin123', real_name: 'System Admin', phone: '13800138000', email: 'admin@system.com', status: 'active' },
    { username: 'zhangsan', password: '123456', real_name: 'Zhang San', phone: '13900139000', email: 'zhangsan@email.com', status: 'active' },
    { username: 'lisi', password: '123456', real_name: 'Li Si', phone: '13700137000', email: 'lisi@email.com', status: 'active' },
    { username: 'wangwu', password: '123456', real_name: 'Wang Wu', phone: '13600136000', email: 'wangwu@email.com', status: 'active' },
    { username: 'zhaoliu', password: '123456', real_name: 'Zhao Liu', phone: '13500135000', email: 'zhaoliu@email.com', status: 'active' },
    { username: 'qianqi', password: '123456', real_name: 'Qian Qi', phone: '13400134000', email: 'qianqi@email.com', status: 'active' },
    { username: 'riskuser', password: '123456', real_name: 'Risk User', phone: '13300133000', email: 'risk@email.com', status: 'active' }
  ];

  const userIds = [];
  for (const user of users) {
    const result = await User.create(user);
    userIds.push(result.lastID);
  }
  console.log(`Created ${userIds.length} users`);

  console.log('Creating accounts...');
  const accountData = [
    { userId: 1, currency: 'CNY', balance: 1000000, account_type: 'admin' },
    { userId: 2, currency: 'CNY', balance: 50000, account_type: 'normal' },
    { userId: 2, currency: 'USD', balance: 10000, account_type: 'normal' },
    { userId: 2, currency: 'EUR', balance: 5000, account_type: 'normal' },
    { userId: 3, currency: 'CNY', balance: 80000, account_type: 'normal' },
    { userId: 3, currency: 'USD', balance: 15000, account_type: 'normal' },
    { userId: 3, currency: 'GBP', balance: 3034, account_type: 'normal' },
    { userId: 4, currency: 'CNY', balance: 120000, account_type: 'normal' },
    { userId: 4, currency: 'JPY', balance: 500000, account_type: 'normal' },
    { userId: 5, currency: 'CNY', balance: 200000, account_type: 'vip' },
    { userId: 5, currency: 'USD', balance: 25000, account_type: 'vip' },
    { userId: 5, currency: 'HKD', balance: 100000, account_type: 'vip' },
    { userId: 6, currency: 'CNY', balance: 30000, account_type: 'normal' },
    { userId: 6, currency: 'EUR', balance: 8000, account_type: 'normal' },
    { userId: 7, currency: 'CNY', balance: 1500000, account_type: 'high_risk' }
  ];

  for (const acc of accountData) {
    await Account.create({
      user_id: acc.userId,
      currency: acc.currency,
      balance: acc.balance,
      account_type: acc.account_type,
      risk_level: acc.account_type === 'high_risk' ? 'high' : 'low'
    });
  }
  console.log(`Created ${accountData.length} accounts`);

  console.log('Creating exchange rates...');
  const exchangeRates = [
    { from: 'USD', to: 'CNY', rate: 7.25 },
    { from: 'EUR', to: 'CNY', rate: 7.85 },
    { from: 'GBP', to: 'CNY', rate: 9.15 },
    { from: 'JPY', to: 'CNY', rate: 0.048 },
    { from: 'HKD', to: 'CNY', rate: 0.93 },
    { from: 'EUR', to: 'USD', rate: 1.08 },
    { from: 'GBP', to: 'USD', rate: 1.26 },
    { from: 'USD', to: 'JPY', rate: 151.50 },
    { from: 'USD', to: 'HKD', rate: 7.80 },
    { from: 'EUR', to: 'GBP', rate: 0.86 }
  ];

  for (const rate of exchangeRates) {
    await ExchangeRate.createOrUpdate(rate.from, rate.to, rate.rate);
  }
  console.log(`Created ${exchangeRates.length} exchange rates`);

  console.log('Creating risk rules...');
  const riskRules = [
    { rule_name: 'Large Transaction Monitor', rule_type: 'amount_threshold', condition: 'amount > threshold', threshold: 100000, action: 'alert', priority: 5, description: 'Monitor transactions over 100K' },
    { rule_name: 'Huge Transaction Block', rule_type: 'amount_threshold', condition: 'amount > threshold', threshold: 500000, action: 'block', priority: 10, description: 'Block transactions over 500K' },
    { rule_name: 'Frequency Detection', rule_type: 'frequency', condition: 'count > threshold', threshold: 50, action: 'alert', priority: 3, description: 'More than 50 transactions in 24h' },
    { rule_name: 'Night Transaction Monitor', rule_type: 'night_time', condition: 'hour >= 0 AND hour < 6', threshold: 10000, action: 'alert', priority: 4, description: 'Large transactions at night' },
    { rule_name: 'Round Amount Detection', rule_type: 'round_amount', condition: 'amount % 10000 = 0', threshold: 50000, action: 'alert', priority: 3, description: 'Large round amount transactions' },
    { rule_name: 'New Account Large Transaction', rule_type: 'new_account', condition: 'account_age < 7', threshold: 50000, action: 'block', priority: 6, description: 'New account large transactions' },
    { rule_name: 'Transaction Velocity Monitor', rule_type: 'velocity', condition: 'velocity > threshold', threshold: 100000, action: 'alert', priority: 4, description: 'High transaction velocity' }
  ];

  for (const rule of riskRules) {
    await RiskRule.create(rule);
  }
  console.log(`Created ${riskRules.length} risk rules`);

  console.log('Creating transactions...');
  const transactions = [
    { userId: 2, fromCurrency: 'CNY', toCurrency: 'USD', amount: 10000, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 2, fromCurrency: 'USD', toCurrency: 'EUR', amount: 5000, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 3, fromCurrency: 'CNY', toCurrency: 'GBP', amount: 8000, type: 'cross_border', paymentMethod: 'swift' },
    { userId: 3, fromCurrency: 'USD', toCurrency: 'CNY', amount: 3034, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 4, fromCurrency: 'CNY', toCurrency: 'JPY', amount: 50000, type: 'cross_border', paymentMethod: 'swift' },
    { userId: 5, fromCurrency: 'USD', toCurrency: 'CNY', amount: 20000, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 5, fromCurrency: 'HKD', toCurrency: 'CNY', amount: 50000, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 6, fromCurrency: 'EUR', toCurrency: 'CNY', amount: 2000, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 2, fromCurrency: 'CNY', toCurrency: 'USD', amount: 25000, type: 'cross_border', paymentMethod: 'swift' },
    { userId: 4, fromCurrency: 'JPY', toCurrency: 'CNY', amount: 100000, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 3, fromCurrency: 'GBP', toCurrency: 'USD', amount: 1500, type: 'exchange', paymentMethod: 'bank_transfer' },
    { userId: 5, fromCurrency: 'CNY', toCurrency: 'HKD', amount: 80000, type: 'cross_border', paymentMethod: 'swift' },
    { userId: 7, fromCurrency: 'CNY', toCurrency: 'USD', amount: 200000, type: 'cross_border', paymentMethod: 'swift' },
    { userId: 7, fromCurrency: 'CNY', toCurrency: 'USD', amount: 300000, type: 'cross_border', paymentMethod: 'swift' },
    { userId: 7, fromCurrency: 'CNY', toCurrency: 'EUR', amount: 150000, type: 'exchange', paymentMethod: 'bank_transfer' }
  ];

  for (const tx of transactions) {
    const transactionId = uuidv4();
    let exchangeRate = 1;
    if (tx.fromCurrency !== tx.toCurrency) {
      exchangeRate = await ExchangeRate.getRate(tx.fromCurrency, tx.toCurrency) || 1;
    }
    
    await Transaction.create({
      id: transactionId,
      user_id: tx.userId,
      from_currency: tx.fromCurrency,
      to_currency: tx.toCurrency,
      amount: tx.amount,
      converted_amount: tx.amount * exchangeRate,
      exchange_rate: exchangeRate,
      fee: tx.amount * 0.002,
      status: 'completed',
      transaction_type: tx.type,
      payment_method: tx.paymentMethod
    });
  }
  console.log(`Created ${transactions.length} transactions`);

  console.log('\n========================================');
  console.log('  Data initialization completed!');
  console.log('  Default account: admin / admin123');
  console.log('========================================\n');
};

initData().catch(console.error);
