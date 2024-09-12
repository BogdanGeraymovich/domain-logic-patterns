import { ObjectId } from 'mongodb';
import TaxCalculationStrategy from '../interfaces/TaxCalculationStrategy';
import { IncomeEntity, TaxSchema } from '../dataMappers/IncomeMapper';

type IncomeObject = Omit<IncomeEntity, '_id'> & {
  id: string;
}

export class Income {
  private _id: ObjectId;

  private amount: number;

  private date: string;

  private taxSchema: TaxSchema;

  private taxCalculationStrategy: TaxCalculationStrategy;

  constructor(id: ObjectId, amount: number, date: string, taxSchema: TaxSchema, taxCalculationStrategy: TaxCalculationStrategy) {
    this._id = id;
    this.amount = amount;
    this.date = date;
    this.taxSchema = taxSchema;
    this.taxCalculationStrategy = taxCalculationStrategy;
  }

  public getId(): ObjectId {
    return this._id;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getDate(): string {
    return this.date;
  }

  public getTaxSchema(): TaxSchema {
    return this.taxSchema;
  }

  public toObject(): IncomeObject {
    return {
      id: this._id.toString(),
      amount: this.amount,
      date: this.date,
      taxSchema: this.taxSchema,
    };
  }

  public calculateTaxAmount(): number {
    return this.taxCalculationStrategy.calculateTaxAmount(this.amount);
  }
}
