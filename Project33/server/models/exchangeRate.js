const { run, get, all } = require('../config/database');

class ExchangeRate {
  static async createOrUpdate(from_currency, to_currency, rate) {
    const existing = await get('SELECT * FROM exchange_rates WHERE from_currency = ? AND to_currency = ?', [from_currency, to_currency]);

    if (existing) {
      return run('UPDATE exchange_rates SET rate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [rate, existing.id]);
    } else {
      return run('INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES (?, ?, ?)', [from_currency, to_currency, rate]);
    }
  }

  static async getRate(from_currency, to_currency) {
    if (from_currency === to_currency) return 1;

    let rate = await get('SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ?', [from_currency, to_currency]);
    if (rate) return rate.rate;

    rate = await get('SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ?', [to_currency, from_currency]);
    if (rate) return 1 / rate.rate;

    return null;
  }

  static async getAll() {
    return all('SELECT * FROM exchange_rates ORDER BY from_currency, to_currency', []);
  }

  static async convert(from_currency, to_currency, amount) {
    const rate = await this.getRate(from_currency, to_currency);
    if (rate === null) return null;
    return amount * rate;
  }
}

module.exports = ExchangeRate;