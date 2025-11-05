import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/shared';

import type { ResponseVariable } from '@qti-components/shared';

export class QtiEqualRounded extends QtiExpression<boolean> {
  @property({ type: String }) roundingMode: 'decimalPlaces' | 'significantFigures' = 'significantFigures';

  get figures() {
    const attr = this.getAttribute('figures');
    if (!attr) {
      console.error('figures attribute is missing');
      return null;
    }
    const figures = parseInt(this.getAttribute('figures') || '0');
    if (isNaN(figures)) {
      console.error('figures attribute is not a number');
      return null;
    }
    if (figures < 0) {
      console.error('figures attribute is negative');
      return null;
    }
    if (figures < 1 && this.roundingMode === 'significantFigures') {
      console.error('figures cannot be smaller than 1 for RoundingMode significantFigures');
      return null;
    }
    return figures;
  }

  public override getResult() {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];
      if (this.roundingMode === null) {
        return null;
      }
      if (
        value1.cardinality !== 'single' ||
        value2.cardinality !== 'single' ||
        Array.isArray(value1.value) ||
        Array.isArray(value2.value)
      ) {
        console.error('unexpected cardinality in qti equal');
        return false;
      }
      switch (values[0].baseType) {
        case 'integer':
        case 'float': {
          const float1 = parseFloat(value1.value as string);
          const float2 = parseFloat(value2.value as string);

          if (!isNaN(float1) && !isNaN(float2)) {
            if (this.roundingMode === 'significantFigures') {
              return float1.toPrecision(this.figures) === float2.toPrecision(this.figures);
            } else {
              return (
                Math.round(float1 * Math.pow(10, this.figures)) / Math.pow(10, this.figures) ===
                Math.round(float2 * Math.pow(10, this.figures)) / Math.pow(10, this.figures)
              );
            }
          } else {
            console.error(`value cannot be casted to numeric value in equalRounded operator: ${float1}, ${float2}`);
          }
          break;
        }
        default: {
          console.error(`values other than float and int cannot be used in equalRounded operator.`);
          break;
        }
      }
      return false;
    }
    console.error('unexpected number of children in qti-equal-rounded');
    return null;
  }
}

customElements.define('qti-equal-rounded', QtiEqualRounded);
