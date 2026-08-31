/** Presentation policy understood by correction-capable elements. */
export type CorrectResponseMode = 'internal' | 'full';

export interface CorrectionConfig {
  correctResponseMode?: CorrectResponseMode;
  fullCorrectResponseOnlyWhenIncorrect?: boolean;
}
