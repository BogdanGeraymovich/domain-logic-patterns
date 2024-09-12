import { DateTime } from 'luxon';
import IncomeTableModule from './tableModules/IncomeTableModule';
import ReportTableModule, { ReportObject } from './tableModules/ReportTableModule';

type IdResponse = {
  id: string;
}

export class ReportService {
  private incomeTableModule: IncomeTableModule;

  private reportTableModule: ReportTableModule;

  constructor(incomeTableModule: IncomeTableModule, reportTableModule: ReportTableModule) {
    this.incomeTableModule = incomeTableModule;
    this.reportTableModule = reportTableModule;
  }

  public async getReport(id: string): Promise<ReportObject | null> {
    return this.reportTableModule.getById(id);
  }

  public async createReport(): Promise<IdResponse> {
    const date = DateTime.now().minus({ day: 1 });
    const reportDate = date.toFormat('yyyy-MM-dd');
    const existingReport = await this.reportTableModule.getByDate(reportDate);
    if (existingReport) {
      throw new Error('Report already exists.');
    }
    const incomes = await this.incomeTableModule.getInRange(date.startOf('day').toISODate(), date.endOf('day').toISODate());

    const reportId = await this.reportTableModule.create(reportDate, incomes);

    return {
      id: reportId,
    };
  }
}
