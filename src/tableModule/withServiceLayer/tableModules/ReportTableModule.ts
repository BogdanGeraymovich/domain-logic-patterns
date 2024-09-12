import { ObjectId } from 'mongodb';
import { IncomeWithTaxes } from './IncomeTableModule';
import ReportDataGateway, { ReportEntity } from '../dataGateways/ReportDataGateway';

export type ReportObject = Omit<ReportEntity, '_id'> & {
  id: string;
}

export default class ReportTableModule {
  private dataGateway: ReportDataGateway;

  constructor(dataGateway: ReportDataGateway) {
    this.dataGateway = dataGateway;
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

    return report ? ReportTableModule.transform(report) : null;
  }

  public async getByDate(date: string): Promise<ReportObject | null> {
    const report = await this.dataGateway.findByDate(date);

    return report ? ReportTableModule.transform(report) : null;
  }

  public async create(date: string, incomes: IncomeWithTaxes[]): Promise<string> {
    const report = ReportTableModule.initEmpty(date);

    for (const income of incomes) {
      const { amount, taxAmount } = income;
      report.grossAmount += amount;
      report.taxAmount += taxAmount;
      report.netAmount += amount - taxAmount;
    }

    const { insertedId } = await this.dataGateway.insert(report);

    return insertedId.toString();
  }
}
