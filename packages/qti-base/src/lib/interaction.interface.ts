export interface IInteraction {
  /** The correct response for this interaction */
  correctResponse: Readonly<string | string[] | null>;
  /** Shows which choices are correct with inline indicators */
  showCorrectResponse: boolean;
  /** Shows a cloned interaction with the correct answers filled in */
  showFullCorrectResponse: boolean;
  /** Shows feedback on candidate's selections compared to correct response */
  showCandidateCorrection: boolean;
  // value: string;
  response: string | string[];
  responseIdentifier: string;
  disabled: boolean;
  readonly: boolean;
  validate(): boolean;
  reportValidity(): boolean;
  reset(): void;
  saveResponse(value: string | string[]): void;
  toggleCorrectResponse(show: boolean): void;
  toggleCandidateCorrection(show: boolean): void;
}
