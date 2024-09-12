import { FindCursor, ObjectId } from 'mongodb';
import Income from './Income';
import ReportGateway, { ReportEntity } from '../dataGateways/ReportGateway';
import { IncomeEntity } from '../dataGateways/IncomeGateway';
import { DateTime } from 'luxon';

export type ReportObject = Omit<ReportEntity, '_id'> & {
  id: string;
}

export default class Report {
  private dataGateway: ReportGateway;

  private incomeTableModule: Income;

  constructor(dataGateway: ReportGateway, incomeTableModule: Income) {
    this.dataGateway = dataGateway;
    this.incomeTableModule = incomeTableModule;
  }

  private static transform(report: ReportEntity): ReportObject {
    return {
      id: report._id.toString(),
      date: report.date,
      netAmount: report.netAmount,
      grossAmount: report.grossAmount,
      taxAmount: report.taxAmount,
    };
  }

  private static initEmpty(date: string): ReportEntity {
    return {
      _id: new ObjectId(),
      date,
      netAmount: 0,
      grossAmount: 0,
      taxAmount: 0,
    };
  }

  public async getById(id: string): Promise<ReportObject | null> {
    const report = await this.dataGateway.find(id);

    return report ? Report.transform(report) : null;
  }

  public async getByDate(date: string): Promise<ReportObject | null> {
    const report = await this.dataGateway.findByDate(date);

    return report ? Report.transform(report) : null;
  }

  private async generate(date: string, incomes: FindCursor<IncomeEntity>): Promise<string> {
    const report = Report.initEmpty(date);

    for await (const income of incomes) {
      const { amount } = income;
      const taxAmount = Income.calculateTaxAmount(income);
      report.grossAmount += amount;
      report.taxAmount += taxAmount;
      report.netAmount += amount - taxAmount;
    }

    const { insertedId } = await this.dataGateway.insert(report);

    return insertedId.toString();
  }

  public async create(): Promise<string> {
    const date = DateTime.now().minus({ day: 1 });
    const reportDate = date.toFormat('yyyy-MM-dd');
    const existingReport = await this.dataGateway.findByDate(reportDate);
    if (existingReport) {
      throw new Error('Report already exists.');
    }
    const incomes = await this.incomeTableModule.getInRange(date.startOf('day').toISODate(), date.endOf('day').toISODate());

    return this.generate(reportDate, incomes);
  }
}
