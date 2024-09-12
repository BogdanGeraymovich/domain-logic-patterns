import { Db, FindCursor, InsertOneResult, ObjectId } from 'mongodb';

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

export type ReportEntity = {
  _id: ObjectId;
  date: string;
  netAmount: number;
  grossAmount: number;
  taxAmount: number;
}

export default class DataGateway {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  public async findIncome(id: string): Promise<IncomeEntity | null> {
    return this.db.collection<IncomeEntity>('incomes').findOne({ _id: new ObjectId(id) });
  }

  public async findIncomes(fromDate: string, toDate: string): Promise<FindCursor<IncomeEntity>> {
    return this.db.collection<IncomeEntity>('incomes').find({ date: { $gte: fromDate, $lte: toDate }});
  }

  public async insertReport(report: ReportEntity): Promise<InsertOneResult> {
    return this.db.collection<ReportEntity>('reports').insertOne(report);
  }

  public async findReport(id: string): Promise<ReportEntity | null> {
    return this.db.collection<ReportEntity>('reports').findOne({ _id: new ObjectId(id) });
  }

  public async findReportByDate(date: string): Promise<ReportEntity | null> {
    return this.db.collection<ReportEntity>('reports').findOne({ date });
  }
}
