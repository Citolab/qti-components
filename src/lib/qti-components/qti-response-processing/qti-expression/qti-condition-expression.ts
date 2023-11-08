import { QtiExpression } from './qti-expression';

export abstract class QtiConditionExpression extends QtiExpression<boolean> {
  public calculate(): Readonly<boolean> {
    this.result = this.getResult();
    return this.result;
  }

  public getResult(): Readonly<boolean> {
    throw new Error('Not implemented');
  }
}
