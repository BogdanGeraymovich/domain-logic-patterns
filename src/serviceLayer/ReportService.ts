import { FindCursor, ObjectId } from 'mongodb';
import { DateTime } from 'luxon';
import DataGateway, { IncomeEntity, ReportEntity, TaxSchema } from './DataGateway';

type IdResponse = {
  id: string;
}

export type ReportObject = Omit<ReportEntity, '_id'> & {
  id: string;
}

export class ReportService {
  private dataGateway: DataGateway;

  constructor(dataGateway: DataGateway) {
    this.dataGateway = dataGateway;
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

  private async formatReport(date: string, incomes: FindCursor<IncomeEntity>): Promise<ReportEntity> {
    const report: ReportEntity = {
      _id: new ObjectId(),
      date,
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

    return report;
  }

  public async getReport(reportId: string): Promise<ReportObject | null> {
    const report = await this.dataGateway.findReport(reportId);

    if (!report) {
      throw new Error('Report not found');
    }

    return ReportService.transformReport(report);
  }

  public async reportIncome(): Promise<IdResponse> {
    const date = DateTime.now().minus({ day: 1 });
    const reportDate = date.toFormat('yyyy-MM-dd');
    const existingReport = await this.dataGateway.findReportByDate(reportDate);

    if (existingReport) {
      throw new Error('Report already exists.');
    }

    const incomes = await this.dataGateway.findIncomes(date.startOf('day').toISODate(), date.endOf('day').toISODate());
    const report = await this.formatReport(reportDate, incomes);
    const { insertedId } = await this.dataGateway.insertReport(report);

    return {
      id: insertedId.toString(),
    };
  }
}
