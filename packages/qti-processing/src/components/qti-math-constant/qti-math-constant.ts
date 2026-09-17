import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

/**
 * @summary The qti-math-constant expression returns a mathematical constant.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.math-constant
 *
 * Takes no sub-expressions. The 'name' attribute selects the constant.
 * Returns a single float.
 * Special cases: Returns NULL for a name outside the vocabulary.
 */
export class QtiMathConstant extends QtiExpression<number | null> {
  @property({ type: String }) name: string = '';

  public override getResult(): number | null {
    switch (this.name.toLowerCase()) {
      case 'pi':
        return Math.PI;
      case 'e':
        return Math.E;
      default:
        console.error(`qti-math-constant: unknown constant "${this.name}"`);
        return null;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-math-constant': QtiMathConstant;
  }
}
