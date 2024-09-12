import IncomeGateway, { IncomeEntity, TaxSchema } from '../dataGateways/IncomeGateway';
import { FindCursor } from 'mongodb';

type IncomeObject = Omit<IncomeEntity, '_id'> & {
  id: string;
}

export default class Income {
  private dataGateway: IncomeGateway;

  constructor(dataGateway: IncomeGateway) {
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

  public async getInRange(fromDate: string, toDate: string): Promise<FindCursor<IncomeEntity>> {
    return this.dataGateway.findInRange(fromDate, toDate);
  }
}
