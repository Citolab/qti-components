import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

export class QtiLcm extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const values = this.#collectIntegerValues(this.getVariables() as ResponseVariable[]);

    if (values.length === 0) {
      console.error('qti-lcm requires at least one integer value');
      return null;
    }

    return values.reduce((accumulator, value) => this.#lcm(accumulator, value));
  }

  #collectIntegerValues(variables: ResponseVariable[]): number[] {
    const values: number[] = [];

    for (const variable of variables) {
      if (variable.baseType !== 'integer') {
        console.error('qti-lcm requires integer base-type');
        return [];
      }
      if (variable.value === null || variable.value === undefined) {
        return [];
      }

      if (variable.cardinality === 'single') {
        if (Array.isArray(variable.value)) {
          console.error('qti-lcm unexpected array value for single cardinality');
          return [];
        }

        const value = Number.parseInt(variable.value as string, 10);
        if (Number.isNaN(value)) {
          console.error('qti-lcm requires integer values');
          return [];
        }
        values.push(value);
        continue;
      }

      if (variable.cardinality !== 'multiple' && variable.cardinality !== 'ordered') {
        console.error('qti-lcm unsupported cardinality');
        return [];
      }

      if (!Array.isArray(variable.value)) {
        console.error('qti-lcm expected array value for container cardinality');
        return [];
      }

      for (const entry of variable.value) {
        const value = Number.parseInt(entry as string, 10);
        if (Number.isNaN(value)) {
          console.error('qti-lcm requires integer values');
          return [];
        }
        values.push(value);
      }
    }

    return values;
  }

  #gcd(a: number, b: number): number {
    let left = Math.abs(a);
    let right = Math.abs(b);

    while (right !== 0) {
      const remainder = left % right;
      left = right;
      right = remainder;
    }

    return left;
  }

  #lcm(a: number, b: number): number {
    if (a === 0 || b === 0) {
      return 0;
    }

    return Math.abs((a * b) / this.#gcd(a, b));
  }
}

customElements.define('qti-lcm', QtiLcm);
