import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/shared';
import { ScoringHelper } from '@qti-components/shared';

import type { ResponseVariable } from '@qti-components/shared';

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
        (prev, current) => (prev.mappedValue > current.mappedValue ? prev : current),
        mappedValues.length > 0 ? mappedValues[0] : { mapKey: null, mappedValue: null } // Use the first element instead of a manual initial value
      );
      if (!(mappedValue === null || mappedValue.mappedValue == undefined)) {
        result += mappedValue.mappedValue;
      } else {
        result += mapping.defaultValue;
      }
    }
    if (mapping?.lowerBound !== null && mapping?.lowerBound !== undefined) {
      result = Math.max(mapping.lowerBound, result);
    }
    if (mapping?.upperBound !== null && mapping?.upperBound !== undefined) {
      result = Math.min(mapping.upperBound, result);
    }
    return result;
  }
}

customElements.define('qti-map-response', QtiMapResponse);
