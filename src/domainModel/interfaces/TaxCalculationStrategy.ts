interface TaxCalculationStrategy {
  calculateTaxAmount(amount: number): number;
}

export default TaxCalculationStrategy;
