import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-duration-lt operator compares two time durations.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#durationLT
 *
 * Takes 2 sub-expressions with base-type duration and single cardinality.
 * Returns true if the first duration is shorter than the second.
 * Special cases: Returns NULL if either argument is NULL; handles variable precision.
 */
export class QtiDurationLt extends QtiExpression<boolean | null> {
  public override getResult(): boolean | null {
    const values = this.#getDurationValues();
    if (!values) {
      return null;
    }

    return values[0] < values[1];
  }

  #getDurationValues(): [number, number] | null {
    const variables = this.getVariables() as ResponseVariable[];

    if (variables.length !== 2) {
      console.error('qti-duration-lt requires exactly 2 duration expressions');
      return null;
    }

    // TODO: Register the built-in duration variables (`duration` and `sectionId.duration`)
    // from tracked candidate/session time-spent so these operators can resolve them implicitly.
    const values = variables.map(variable => this.#parseDuration(variable));
    if (values.some(value => value === null)) {
      return null;
    }

    return values as [number, number];
  }

  #parseDuration(variable: ResponseVariable): number | null {
    if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
      console.error('qti-duration-lt requires single cardinality');
      return null;
    }
    if (variable.baseType !== 'duration') {
      console.error('qti-duration-lt requires duration base-type');
      return null;
    }
    if (variable.value === null || variable.value === undefined) {
      return null;
    }

    const value = Number.parseFloat(variable.value.toString());
    if (Number.isNaN(value)) {
      console.error(`qti-duration-lt requires duration values expressed in seconds, got "${variable.value.toString()}"`);
      return null;
    }

    return value;
  }
}

customElements.define('qti-duration-lt', QtiDurationLt);
