import { ObjectId } from 'mongodb';
import { Income } from './Income';
import { ReportEntity } from '../dataMappers/ReportMapper';

export type ReportObject = Omit<ReportEntity, '_id'> & {
  id: string;
}

export default class Report {
  private _id: ObjectId;

  private date: string;

  private netAmount: number;

  private grossAmount: number;

  private taxAmount: number;

  constructor(id: ObjectId, date: string, netAmount: number, grossAmount: number, taxAmount: number) {
    this._id = id;
    this.date = date;
    this.netAmount = netAmount;
    this.grossAmount = grossAmount;
    this.taxAmount = taxAmount;
  }

  public getId(): ObjectId {
    return this._id;
  }

  public getDate(): string {
    return this.date;
  }

  public getNetAmount(): number {
    return this.netAmount;
  }

  public getGrossAmount(): number {
    return this.grossAmount;
  }

  public getTaxAmount(): number {
    return this.taxAmount;
  }

  public toObject(): ReportObject {
    return {
      id: this._id.toString(),
      date: this.date,
      netAmount: this.netAmount,
      grossAmount: this.grossAmount,
      taxAmount: this.taxAmount,
    };
  }

  public static generateFromIncomes(date: string, incomes: Income[]): Report {
    const report = Report.initEmpty(date);

    for (const income of incomes) {
      const amount = income.getAmount();
      const taxAmount = income.calculateTaxAmount();
      report.grossAmount += amount;
      report.taxAmount += taxAmount;
      report.netAmount += amount - taxAmount;
    }

    return report;
  }

  public static initEmpty(date: string): Report {
    return new Report(new ObjectId(), date, 0, 0, 0);
  }
}
