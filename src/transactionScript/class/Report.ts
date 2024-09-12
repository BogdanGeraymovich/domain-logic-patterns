import { Db, ObjectId } from 'mongodb';
import { DateTime } from 'luxon';

export const enum TaxSchema {
  SIMPLIFIED = 'simplified',
  ADVANCED = 'advanced',
}

type IncomeEntity = {
  _id: ObjectId;
  amount: number;
  date: string;
  taxSchema: TaxSchema;
}

type ReportEntity = {
  _id: ObjectId;
  date: string;
  netAmount: number;
  grossAmount: number;
  taxAmount: number;
}

export type ReportObject = Omit<ReportEntity, '_id'> & {
  id: string;
}

export class Report {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  private static transformReport(report: ReportEntity): ReportObject {
    return {
      id: report._id.toString(),
      date: report.date,
      netAmount: report.netAmount,
      grossAmount: report.grossAmount,
      taxAmount: report.taxAmount,
    };
  }

  private calculateTaxAmountAdvanced(grossAmount: number): number {
    const pensionFundRate = 10;
    const incomeTaxRate = 15;
    const pensionFundAmount = grossAmount * pensionFundRate / 100;
    const taxBase = grossAmount - pensionFundAmount;
    const incomeTaxAmount = taxBase * incomeTaxRate / 100;

    return pensionFundAmount + incomeTaxAmount;
  }

  private calculateTaxAmountSimplified(grossAmount: number): number {
    const incomeTaxRate = 10;
    return incomeTaxRate * grossAmount / 100;
  }

  public async getReport(reportId: string): Promise<ReportObject | null> {
    const collection = this.db.collection('reports');
    const report = await collection.findOne<ReportEntity>({ _id: new ObjectId(reportId) });

    if (!report) {
      throw new Error('Report not found');
    }

    return Report.transformReport(report);
  }

  public async createReport(): Promise<string> {
    const reportsCollection = this.db.collection('reports');
    const incomesCollection = this.db.collection('incomes');

    const date = DateTime.now().minus({ day: 1 });
    const reportDate = date.toFormat('yyyy-MM-dd');

    const existingReport = await reportsCollection.findOne<ReportEntity>({ date: reportDate });

    if (existingReport) {
      throw new Error('Report already exists.');
    }

    const incomes = incomesCollection.find<IncomeEntity>({
      date: {
        $gte: date.startOf('day').toISODate(),
        $lte: date.endOf('day').toISODate(),
      },
    });

    const report: ReportEntity = {
      _id: new ObjectId(),
      date: reportDate,
      netAmount: 0,
      grossAmount: 0,
      taxAmount: 0,
    };

    for await (const income of incomes) {
      const { amount, taxSchema } = income;
      const taxAmount = taxSchema === TaxSchema.ADVANCED ? this.calculateTaxAmountAdvanced(amount) : this.calculateTaxAmountSimplified(amount);
      report.grossAmount += amount;
      report.taxAmount += taxAmount;
      report.netAmount += amount - taxAmount;
    }
    const { insertedId } = await reportsCollection.insertOne(report);

    return insertedId.toString();
  }
}
