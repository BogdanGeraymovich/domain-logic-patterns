import { Collection, Db, ObjectId } from 'mongodb';
import { Income } from '../models/Income';
import TaxCalculationStrategy from '../interfaces/TaxCalculationStrategy';
import AdvancedTaxCalculation from '../strategies/AdvancedTaxCalculation';
import SimplifiedTaxCalculation from '../strategies/SimplifiedTaxCalculation';

export const enum TaxSchema {
  SIMPLIFIED = 'simplified',
  ADVANCED = 'advanced',
}

export type IncomeEntity = {
  _id: ObjectId;
  amount: number;
  date: string;
  taxSchema: TaxSchema;
};

export default class IncomeMapper {
  private collection: Collection<IncomeEntity>;

  constructor(db: Db) {
    this.collection = db.collection<IncomeEntity>('incomes');
  }

  private load(entity: IncomeEntity): Income {
    const { _id, amount, date, taxSchema } = entity;

    const taxCalculationStrategy: TaxCalculationStrategy = taxSchema === TaxSchema.ADVANCED
      ? new AdvancedTaxCalculation() : new SimplifiedTaxCalculation();

    return new Income(_id, amount, date, taxSchema, taxCalculationStrategy);
  }

  public async findInRange(fromDate: string, toDate: string): Promise<Income[]> {
    const incomes: Income[] = [];
    const cursor = this.collection.find({ date: { $gte: fromDate, $lte: toDate }});

    for await (const item of cursor) {
      incomes.push(this.load(item));
    }

    return incomes;
  }
}
