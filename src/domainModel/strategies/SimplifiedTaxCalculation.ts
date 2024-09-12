import TaxCalculationStrategy from '../interfaces/TaxCalculationStrategy';

export default class SimplifiedTaxCalculation implements TaxCalculationStrategy {
  private static INCOME_TAX_RATE = 10;

  calculateTaxAmount(amount: number): number {
    return SimplifiedTaxCalculation.INCOME_TAX_RATE * amount / 100;
  }
}
