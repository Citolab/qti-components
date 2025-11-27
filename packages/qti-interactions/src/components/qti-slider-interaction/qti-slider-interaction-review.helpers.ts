import type { ResponseVariable } from '@qti-components/base';

export interface SliderCorrectResponseContext {
  show: boolean;
  responseVariable?: ResponseVariable;
  min: number;
  max: number;
}

export interface SliderCorrectResponseState {
  correctResponseText: string | null;
  numericValue: number | null;
  percentage: number | null;
}

export function getSliderCorrectResponseState(context: SliderCorrectResponseContext): SliderCorrectResponseState {
  const { show, responseVariable, min, max } = context;
  if (!show || !responseVariable?.correctResponse) {
    return { correctResponseText: null, numericValue: null, percentage: null };
  }

  const text = responseVariable.correctResponse.toString();
  const parsed = parseFloat(text);
  if (isNaN(parsed)) {
    return { correctResponseText: text, numericValue: null, percentage: null };
  }

  const percentage = ((parsed - min) / (max - min)) * 100;
  return { correctResponseText: text, numericValue: parsed, percentage };
}
