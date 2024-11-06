// export interface IInteraction {
//   disabled: boolean;
//   readonly: boolean;
//   response: string | string[];
//   reset();
//   validate(): boolean;
// }

export interface IInteraction {
  correctResponse: Readonly<string | string[]>;
  value: string | string[];
  responseIdentifier: string;
  validate(): boolean;
  reportValidity(): boolean;
  reset(): void;
  saveResponse(value: string | string[]): void;
}
