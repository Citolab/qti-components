import { html } from 'lit';
import { QtiExpression } from './qti-expression';

export abstract class QtiConditionExpression extends QtiExpression<boolean> {
  public calculate(): boolean {
    // eslint-disable-next-line no-throw-literal
    throw new Error('Not implemented');
  }
}
