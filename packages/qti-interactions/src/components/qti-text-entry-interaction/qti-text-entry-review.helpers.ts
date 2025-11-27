import { CorrectnessStates } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

interface TextEntryCorrectResponseHost {
  readonly responseVariable?: ResponseVariable;
  setCorrectResponseDisplay(value: string | null): void;
}

export function toggleTextEntryInternalCorrectResponse(host: TextEntryCorrectResponseHost, show: boolean): void {
  const responseVariable = host.responseVariable;

  if (show && responseVariable?.correctResponse) {
    host.setCorrectResponseDisplay(responseVariable.correctResponse.toString());
    return;
  }

  host.setCorrectResponseDisplay(null);
}

export function evaluateTextEntryCorrectness(responseVariable?: ResponseVariable): CorrectnessStates | null {
  if (!responseVariable) {
    return null;
  }

  if (responseVariable.value === null) {
    return CorrectnessStates.Incorrect;
  }

  if (responseVariable.mapping) {
    const maxScore = responseVariable.mapping.mapEntries.reduce<number>(
      (currentMax, mapEntry) => Math.max(mapEntry.mappedValue, currentMax),
      0
    );
    for (const mapEntry of responseVariable.mapping.mapEntries) {
      let mapAnswer = mapEntry.mapKey;
      let responseAnswer = responseVariable.value as string;
      if (!mapEntry.caseSensitive) {
        mapAnswer = mapAnswer.toLowerCase();
        responseAnswer = responseAnswer.toLowerCase();
      }
      if (mapAnswer === responseAnswer) {
        if (mapEntry.mappedValue === maxScore) {
          return CorrectnessStates.Correct;
        }
        if (mapEntry.mappedValue <= (responseVariable.mapping.defaultValue || 0)) {
          return CorrectnessStates.Incorrect;
        }
        return CorrectnessStates.PartiallyCorrect;
      }
    }
  }

  return responseVariable.correctResponse === responseVariable.value
    ? CorrectnessStates.Correct
    : CorrectnessStates.Incorrect;
}
