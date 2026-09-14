import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';
import { ScoringHelper } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';
import type { QtiAreaMapping } from '@qti-components/base';

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
          // First match wins: "each area is tested in turn, with those listed first taking priority
          // in the case where areas overlap and a point falls in the intersection" (QTI 3.0 §7.4).
          // Without this the point would also score every later area it happens to fall in — which
          // only became reachable once `shape="default"`, an area covering the whole image, started
          // matching (Citolab/qti-components#83).
          break;
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
