import { Collection, Db, Filter, ObjectId } from 'mongodb';
import Report from '../models/Report';

export type ReportEntity = {
  _id: ObjectId;
  date: string;
  netAmount: number;
  grossAmount: number;
  taxAmount: number;
}

export default class ReportMapper {
  private collection: Collection<ReportEntity>;

  constructor(db: Db) {
    this.collection = db.collection<ReportEntity>('reports');
  }

  private load(entity: ReportEntity): Report {
    const { _id, date, netAmount, grossAmount, taxAmount } = entity;

    return new Report(_id, date, netAmount, grossAmount, taxAmount);
  }

  public async insert(report: Report) {
    return this.collection.insertOne({
      _id: report.getId(),
      date: report.getDate(),
      netAmount: report.getNetAmount(),
      grossAmount: report.getGrossAmount(),
      taxAmount: report.getTaxAmount(),
    });
  }

  private async findOne(filter: Filter<ReportEntity>): Promise<Report | null> {
    const entity = await this.collection.findOne<ReportEntity>(filter);

    return entity ? this.load(entity) : null;
  }

  public async findOneById(id: string): Promise<Report | null> {
    return this.findOne({ _id: new ObjectId(id) });
  }

  public async findOneByDate(date: string): Promise<Report | null> {
    return this.findOne({ date });
  }
}
