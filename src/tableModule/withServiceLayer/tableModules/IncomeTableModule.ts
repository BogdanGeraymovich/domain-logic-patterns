import IncomeDataGateway, { IncomeEntity, TaxSchema } from '../dataGateways/IncomeDataGateway';

type IncomeObject = Omit<IncomeEntity, '_id'> & {
  id: string;
}

export type IncomeWithTaxes = IncomeObject & {
  taxAmount: number;
}

export default class IncomeTableModule {
  private dataGateway: IncomeDataGateway;

  constructor(dataGateway: IncomeDataGateway) {
    this.dataGateway = dataGateway;
  }

  private static transform(income: IncomeEntity): IncomeObject {
    return {
      id: income._id.toString(),
      amount: income.amount,
      date: income.date,
      taxSchema: income.taxSchema,
    };
  }

  private static calculateTaxAmountAdvanced(grossAmount: number): number {
    const pensionFundRate = 10;
    const incomeTaxRate = 15;
    const pensionFundAmount = grossAmount * pensionFundRate / 100;
    const taxBase = grossAmount - pensionFundAmount;
    const incomeTaxAmount = taxBase * incomeTaxRate / 100;

    return pensionFundAmount + incomeTaxAmount;
  }

  private static calculateTaxAmountSimplified(grossAmount: number): number {
    const incomeTaxRate = 10;
    return incomeTaxRate * grossAmount / 100;
  }

  public static calculateTaxAmount(income: IncomeEntity): number {
    const { amount, taxSchema } = income;
    return taxSchema === TaxSchema.ADVANCED ? this.calculateTaxAmountAdvanced(amount) : this.calculateTaxAmountSimplified(amount);
  }

  public async getInRange(fromDate: string, toDate: string): Promise<IncomeWithTaxes[]> {
    const incomes: IncomeWithTaxes[] = [];
    const cursor = await this.dataGateway.findInRange(fromDate, toDate);

    for await (const income of cursor) {
      incomes.push({
        ...IncomeTableModule.transform(income),
        taxAmount: IncomeTableModule.calculateTaxAmount(income),
      });
    }

    return incomes;
  }
}
