import { Db, ObjectId } from 'mongodb';
import { DateTime } from 'luxon';

export const enum TaxSchema {
  SIMPLIFIED = 'simplified',
  ADVANCED = 'advanced',
}

type Income = {
  _id: ObjectId;
  amount: number;
  date: string;
  taxSchema: TaxSchema;
}

type Report = {
  _id: ObjectId;
  date: string;
  netAmount: number;
  grossAmount: number;
  taxAmount: number;
}

function calculateTaxAmountAdvanced(grossAmount: number): number {
  const pensionFundRate = 10;
  const incomeTaxRate = 15;
  const pensionFundAmount = grossAmount * pensionFundRate / 100;
  const taxBase = grossAmount - pensionFundAmount;
  const incomeTaxAmount = taxBase * incomeTaxRate / 100;

  return pensionFundAmount + incomeTaxAmount;
}

function calculateTaxAmountSimplified(grossAmount: number): number {
  const incomeTaxRate = 10;
  return incomeTaxRate * grossAmount / 100;
}

export default async function reportIncome(db: Db): Promise<string> {
  const reportsCollection = db.collection('reports');
  const incomesCollection = db.collection('incomes');

  const date = DateTime.now().minus({ day: 1 });
  const reportDate = date.toFormat('yyyy-MM-dd');

  const existingReport = await reportsCollection.findOne<Report>({ date: reportDate });

  if (existingReport) {
    throw new Error('Report already exists.');
  }

  const incomes = incomesCollection.find<Income>({
    date: {
      $gte: date.startOf('day').toISODate(),
      $lte: date.endOf('day').toISODate(),
    },
  });

  const report: Report = {
    _id: new ObjectId(),
    date: reportDate,
    netAmount: 0,
    grossAmount: 0,
    taxAmount: 0,
  };

  for await (const income of incomes) {
    const { amount, taxSchema } = income;
    const taxAmount = taxSchema === TaxSchema.ADVANCED ? calculateTaxAmountAdvanced(amount) : calculateTaxAmountSimplified(amount);
    report.grossAmount += amount;
    report.taxAmount += taxAmount;
    report.netAmount += amount - taxAmount;
  }
  const { insertedId } = await reportsCollection.insertOne(report);

  return insertedId.toString();
}
