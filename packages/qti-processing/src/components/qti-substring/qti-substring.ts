import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

export class QtiSubstring extends QtiExpression<boolean | null> {
  @property({ type: String, attribute: 'case-sensitive' }) caseSensitive = 'true';

  public override getResult(): boolean | null {
    const variables = this.getVariables() as ResponseVariable[];

    if (variables.length !== 2) {
      console.error('qti-substring requires exactly 2 child expressions');
      return null;
    }

    const [needle, haystack] = variables;
    if (
      needle.cardinality !== 'single' ||
      haystack.cardinality !== 'single' ||
      Array.isArray(needle.value) ||
      Array.isArray(haystack.value)
    ) {
      console.error('qti-substring requires single cardinality');
      return null;
    }
    if (needle.value === null || haystack.value === null || needle.value === undefined || haystack.value === undefined) {
      return null;
    }

    const left = needle.value.toString();
    const right = haystack.value.toString();
    if (this.caseSensitive !== 'true') {
      return right.toLowerCase().includes(left.toLowerCase());
    }

    return right.includes(left);
  }
}

customElements.define('qti-substring', QtiSubstring);
