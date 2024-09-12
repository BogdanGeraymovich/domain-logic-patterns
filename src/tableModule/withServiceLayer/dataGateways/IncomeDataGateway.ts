import { Collection, Db, FindCursor, ObjectId } from 'mongodb';

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

export default class IncomeDataGateway {
  private collection: Collection<IncomeEntity>;

  constructor(db: Db) {
    this.collection = db.collection<IncomeEntity>('incomes');
  }

  public async findInRange(fromDate: string, toDate: string): Promise<FindCursor<IncomeEntity>> {
    return this.collection.find({ date: { $gte: fromDate, $lte: toDate }});
  }
}
