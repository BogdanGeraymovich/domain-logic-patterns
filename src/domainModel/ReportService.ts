import IncomeMapper from './dataMappers/IncomeMapper';
import ReportMapper from './dataMappers/ReportMapper';
import { DateTime } from 'luxon';
import Report, { ReportObject } from './models/Report';

type IdResponse = {
  id: string;
}

export default class ReportService {
  private incomeDataMapper: IncomeMapper;

  private reportDataMapper: ReportMapper;

  constructor(incomeDataMapper: IncomeMapper, reportDataMapper: ReportMapper) {
    this.incomeDataMapper = incomeDataMapper;
    this.reportDataMapper = reportDataMapper;
  }

  public async get(reportId: string): Promise<ReportObject | undefined> {
    const report = await this.reportDataMapper.findOneById(reportId);

    return report?.toObject();
  }

  public async create(): Promise<IdResponse> {
    const date = DateTime.now().minus({ day: 1 });
    const reportDate = date.toFormat('yyyy-MM-dd');
    const existingReport = await this.reportDataMapper.findOneByDate(reportDate);
    if (existingReport) {
      throw new Error('Report already exists.');
    }
    const incomes = await this.incomeDataMapper.findInRange(date.startOf('day').toISODate(), date.endOf('day').toISODate());
    const report = Report.generateFromIncomes(date.toFormat('yyyy-MM-dd'), incomes);

    await this.reportDataMapper.insert(report);

    return {
      id: report.getId().toString(),
    };
  }
}
