const db = require('../config/database');

class TaxCalculator {
  static async getCategoryRates(hsCode) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT tax_rate, consumption_tax_rate, vat_rate, is_restricted, required_documents FROM product_categories WHERE hs_code = ?',
        [hsCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || {
            tax_rate: 0.0000,
            consumption_tax_rate: 0.0000,
            vat_rate: 0.1300,
            is_restricted: 0,
            required_documents: null
          });
        }
      );
    });
  }

  static calculateItemTaxes(amount, rates) {
    const customsDuty = amount * rates.tax_rate;
    const taxableAmount = amount + customsDuty;
    const consumptionTax = rates.consumption_tax_rate > 0 
      ? (taxableAmount / (1 - rates.consumption_tax_rate)) * rates.consumption_tax_rate 
      : 0;
    const vatAmount = (taxableAmount + consumptionTax) * rates.vat_rate;
    const totalTax = customsDuty + consumptionTax + vatAmount;

    return {
      customsDutyRate: rates.tax_rate,
      consumptionTaxRate: rates.consumption_tax_rate,
      vatRate: rates.vat_rate,
      customsDutyAmount: Math.round(customsDuty * 100) / 100,
      consumptionTaxAmount: Math.round(consumptionTax * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalTaxAmount: Math.round(totalTax * 100) / 100,
      isRestricted: rates.is_restricted === 1,
      requiredDocuments: rates.required_documents
    };
  }

  static async calculateDeclarationItems(items) {
    const results = [];
    let totalCustomsDuty = 0;
    let totalConsumptionTax = 0;
    let totalVat = 0;
    let totalTax = 0;
    let totalValue = 0;
    let totalWeight = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rates = await this.getCategoryRates(item.hs_code);
      const taxes = this.calculateItemTaxes(item.total_amount, rates);
      
      const itemResult = {
        ...item,
        item_no: i + 1,
        customs_duty_rate: taxes.customsDutyRate,
        consumption_tax_rate: taxes.consumptionTaxRate,
        vat_rate: taxes.vatRate,
        customs_duty_amount: taxes.customsDutyAmount,
        consumption_tax_amount: taxes.consumptionTaxAmount,
        vat_amount: taxes.vatAmount,
        total_tax_amount: taxes.totalTaxAmount,
        verification_status: taxes.isRestricted ? 'NEEDS_REVIEW' : 'VERIFIED',
        verification_message: taxes.isRestricted 
          ? `该商品属于管制类商品，需要以下文件: ${taxes.requiredDocuments || '相关进口许可'}` 
          : '商品分类核验通过'
      };

      results.push(itemResult);
      totalCustomsDuty += taxes.customsDutyAmount;
      totalConsumptionTax += taxes.consumptionTaxAmount;
      totalVat += taxes.vatAmount;
      totalTax += taxes.totalTaxAmount;
      totalValue += item.total_amount;
      if (item.total_weight) totalWeight += item.total_weight;
    }

    return {
      items: results,
      totals: {
        total_value: Math.round(totalValue * 100) / 100,
        total_weight: Math.round(totalWeight * 1000) / 1000,
        customs_duty: Math.round(totalCustomsDuty * 100) / 100,
        consumption_tax: Math.round(totalConsumptionTax * 100) / 100,
        vat_amount: Math.round(totalVat * 100) / 100,
        total_tax: Math.round(totalTax * 100) / 100
      }
    };
  }
}

module.exports = TaxCalculator;
