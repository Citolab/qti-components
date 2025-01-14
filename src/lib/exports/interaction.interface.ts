export interface IInteraction {
  correctResponse: Readonly<string | string[]>;
  value: string | string[];
  responseIdentifier: string;
  disabled: boolean;
  readonly: boolean;
  validate(): boolean;
  reportValidity(): boolean;
  reset(): void;
  saveResponse(value: string | string[]): void;
}
