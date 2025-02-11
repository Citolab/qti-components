import { property } from 'lit/decorators.js';

import { QtiExpression } from '../../../internal/qti-expression';
import { ScoringHelper } from '../../utilities/scoring-helper';

import type { ResponseVariable } from '../../../../exports/variables';
import type { QtiAreaMapping } from '../qti-area-mapping/qti-area-mapping';

export class QtiMapResponsePoint extends QtiExpression<number> {
  @property({ type: String }) identifier: string;

  public override getResult(): number {
    const response: ResponseVariable = this.context.variables.find(r => r.identifier === this.identifier);
    if (!response) {
      console.warn(`Response ${this.identifier} cannot be found`);
      return null;
    }

    const areaMapping: QtiAreaMapping = response.areaMapping;
    if (!areaMapping) {
      console.warn(`Area mapping not found for response ${this.identifier}`);
      return null;
    }

    const candidateResponses = !Array.isArray(response.value) ? [response.value] : response.value;
    if (!candidateResponses || candidateResponses.length === 0) {
      console.warn(`No candidate responses for response ${this.identifier}`);
      return null;
    }

    let result = 0;

    // Keep track of areas that have already been matched
    const mappedAreas = new Set<string>();

    for (const candidateResponse of candidateResponses) {
      for (const entry of areaMapping.areaMapEntries) {
        if (mappedAreas.has(entry.coords)) {
          continue; // Skip areas that have already been mapped
        }
        const isPointInArea = ScoringHelper.isPointInArea(
          candidateResponse,
          `${entry.shape},${entry.coords}`,
          response.baseType
        );
        if (isPointInArea) {
          result += entry.mappedValue ?? 0;
          mappedAreas.add(entry.coords);
        }
      }
    }

    // Add default value for unmatched candidate responses
    if (mappedAreas.size < candidateResponses.length) {
      result += areaMapping.defaultValue;
    }

    // Apply bounds if defined
    if (areaMapping.lowerBound != null) {
      result = Math.max(areaMapping.lowerBound, result);
    }
    if (areaMapping.upperBound != null) {
      result = Math.min(areaMapping.upperBound, result);
    }

    return result;
  }
}

customElements.define('qti-map-response-point', QtiMapResponsePoint);
