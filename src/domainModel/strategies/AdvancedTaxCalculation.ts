import TaxCalculationStrategy from '../interfaces/TaxCalculationStrategy';

export default class AdvancedTaxCalculation implements TaxCalculationStrategy {
  private static INCOME_TAX_RATE = 15;

  private static PENSION_FUND_RATE = 10;

  calculateTaxAmount(amount: number): number {
    const pensionFundAmount = amount * AdvancedTaxCalculation.PENSION_FUND_RATE / 100;
    const taxBase = amount - pensionFundAmount;
    const incomeTaxAmount = taxBase * AdvancedTaxCalculation.INCOME_TAX_RATE / 100;

    return pensionFundAmount + incomeTaxAmount;
  }
}
