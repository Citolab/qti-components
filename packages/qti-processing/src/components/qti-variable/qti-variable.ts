import { QtiExpression } from '@qti-components/base';

export class QtiVariable extends QtiExpression<string | string[]> {
  public override getResult() {
    const identifier = this.getAttribute('identifier') || '';
    // Resolve item-scope first, then test-level outcomes (e.g. when used in an
    // assessmentTest's outcome processing), and tolerate an unknown identifier
    // instead of throwing.
    return (this.resolveVariable(identifier)?.value ?? null) as string | string[];
  }
}
