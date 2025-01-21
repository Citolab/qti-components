export interface IInteraction {
  correctResponse: Readonly<string | string[]>;
  value: string | string[];
  responseIdentifier: string;
  disabled: boolean;
  readonly: boolean;
  validate(reportValidity?: boolean): boolean;
  reportValidity(): boolean;
  reset(): void;
  saveResponse(value: string | string[]): void;
}
