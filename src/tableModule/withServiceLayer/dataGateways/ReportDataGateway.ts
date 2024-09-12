import { Collection, Db, InsertOneResult, ObjectId } from 'mongodb';

export type ReportEntity = {
  _id: ObjectId;
  date: string;
  netAmount: number;
  grossAmount: number;
  taxAmount: number;
}

export default class ReportDataGateway {
  private collection: Collection<ReportEntity>;

  constructor(db: Db) {
    this.collection = db.collection<ReportEntity>('reports');
  }

  public async insert(report: ReportEntity): Promise<InsertOneResult> {
    return this.collection.insertOne(report);
  }

  public async find(id: string): Promise<ReportEntity | null> {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  public async findByDate(date: string): Promise<ReportEntity | null> {
    return this.collection.findOne({ date });
  }
}
