import { ScoringHelper } from '@qti-components/base';

import type { QtiAreaMapping, ResponseVariable } from '@qti-components/base';

export interface SelectPointCandidateContext {
  show: boolean;
  responseVariable?: ResponseVariable;
  responsePoints: { x: number; y: number }[];
}

export interface SelectPointCorrectResponseContext {
  show: boolean;
  responseVariable?: ResponseVariable;
}

export function getSelectPointCandidateCorrection(context: SelectPointCandidateContext): boolean[] {
  const { show, responseVariable, responsePoints } = context;
  if (!show || !responseVariable?.areaMapping) {
    return [];
  }

  const areaMapping = responseVariable.areaMapping as QtiAreaMapping;
  const entries = areaMapping?.areaMapEntries ?? [];
  if (entries.length === 0) {
    return [];
  }

  return responsePoints.map(point =>
    entries.some(correctArea =>
      ScoringHelper.isPointInArea(
        `${point.x} ${point.y}`,
        `${correctArea.shape},${correctArea.coords}`,
        responseVariable.baseType
      )
    )
  );
}

export function getSelectPointCorrectAreas(context: SelectPointCorrectResponseContext): { shape: string; coords: string }[] {
  const { show, responseVariable } = context;
  if (!show || !responseVariable) {
    return [];
  }

  const areaMapping = responseVariable.areaMapping as QtiAreaMapping;
  if (areaMapping && areaMapping.areaMapEntries.length > 0) {
    return areaMapping.areaMapEntries.map(mapEntry => ({ shape: mapEntry.shape, coords: mapEntry.coords }));
  }

  if (!responseVariable.correctResponse) {
    return [];
  }

  const correctResponses = Array.isArray(responseVariable.correctResponse)
    ? responseVariable.correctResponse
    : [responseVariable.correctResponse];

  if (correctResponses.length === 0 || correctResponses.some(r => r.split(' ').length < 2)) {
    console.error('No valid correct responses found for the response variable.');
    return [];
  }

  console.warn(
    `No area mapping found for the response variable. Using the correct responses to display the correct response but it probably won't score correct.`
  );

  return correctResponses.map(r => {
    const coords = r.split(' ').join(',').concat(',10');
    return { shape: 'circle', coords };
  });
}
