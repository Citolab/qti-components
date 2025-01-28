import { property } from 'lit/decorators.js';

import { ScoringHelper } from '../../utilities/scoring-helper';
import { QtiExpression } from '../../../../exports/qti-expression';

import type { ResponseVariable } from '../../../../exports/variables';

export class QtiMapResponse extends QtiExpression<number> {
  @property({ type: String }) identifier: string;

  public override getResult(): number {
    const response: ResponseVariable = this.context.variables.find(r => r.identifier === this.identifier);
    if (!response || !response.mapping) {
      console.error(`Response ${this.identifier} can not be found`);
      return null;
    }
    const mapping = response.mapping;
    const candidateResponses = !Array.isArray(response.value) ? [response.value] : response.value;
    let result = 0;
    for (const candidateResponse of candidateResponses) {
      const mappedValues = mapping.mapEntries.filter(entry => {
        if (response.baseType === 'string' && !entry.caseSensitive) {
          return ScoringHelper.compareSingleValues(
            entry.mapKey.toLowerCase(),
            candidateResponse.toLowerCase(),
            response.baseType
          );
        } else {
          return ScoringHelper.compareSingleValues(entry.mapKey, candidateResponse, response.baseType);
        }
      });
      // now find the mapped value with the highest value (if there are multiple)
      const mappedValue = mappedValues.reduce(
        (prev, current) => {
          return prev.mappedValue > current.mappedValue ? prev : current;
        },
        { mapKey: null, mappedValue: null }
      );
      if (!(mappedValue == null || mappedValue.mappedValue == undefined)) {
        result += mappedValue.mappedValue;
      } else {
        result += mapping.defaultValue;
      }
    }
    if (mapping.lowerBound != null) {
      result = Math.max(mapping.lowerBound, result);
    }
    if (mapping.upperBound != null) {
      result = Math.min(mapping.upperBound, result);
    }
    return result;
  }
}

customElements.define('qti-map-response', QtiMapResponse);
