import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-correct operator retrieves the defined correct response for a variable.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#correct
 *
 * Looks up the declaration for the identified response variable.
 * Returns the associated correctResponse value(s).
 * Special cases: Returns NULL if no correct response was declared.
 */
export class QtiCorrect extends QtiExpression<string | string[]> {
  get interpretation() {
    return this.getAttribute('interpretation') || '';
  }

  override getResult() {
    const identifier = this.getAttribute('identifier') || '';
    const responseVariable: ResponseVariable = this.context.variables.find(v => v.identifier === identifier) || null;
    if (responseVariable.cardinality !== 'single') {
      return responseVariable.correctResponse.length > 0 ? responseVariable.correctResponse[0] : '';
    } else {
      return responseVariable.correctResponse;
    }
  }
}

customElements.define('qti-correct', QtiCorrect);
