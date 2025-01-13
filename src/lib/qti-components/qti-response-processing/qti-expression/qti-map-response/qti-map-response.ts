import { property } from 'lit/decorators.js';
import { ScoringHelper } from '../../utilities/scoring-helper';
import { QtiExpression } from '../qti-expression';
import type { ResponseVariable } from '../../../internal/variables';

export class QtiMapResponse extends QtiExpression<number> {
  @property({ type: String }) identifier: string;

  public override getResult(): number {
    const response: ResponseVariable = this.context.variables.find(r => r.identifier === this.identifier);
    if (!response) {
      console.warn(`Response ${this.identifier} can not be found`);
      return null;
    }
    const mapping = response.mapping;
    const candidateResponses = !Array.isArray(response.value) ? [response.value] : response.value;
    let result = 0;
    for (const candidateResponse of candidateResponses) {
      const mappedValue = mapping.mapEntries.find(entry => {
        return ScoringHelper.compareSingleValues(entry.mapKey, candidateResponse, response.baseType);
      });
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
