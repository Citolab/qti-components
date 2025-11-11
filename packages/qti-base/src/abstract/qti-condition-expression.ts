import { QtiExpression } from './qti-expression';

export abstract class QtiConditionExpression extends QtiExpression<boolean> {
  public override calculate(): Readonly<boolean> {
    this.result = this.getResult();
    return this.result;
  }

  public override getResult(): Readonly<boolean> {
    throw new Error('Not implemented');
  }
}
