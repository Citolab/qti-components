import type { ResponseVariable } from './variables';

export interface IInteraction {
  correctResponse: Readonly<string | string[]>;
  value: string | string[];
  responseIdentifier: string;
  disabled: boolean;
  readonly: boolean;
  get responseVariable(): ResponseVariable | undefined;
  validate(): boolean;
  reportValidity(): boolean;
  reset(): void;
  saveResponse(value: string | string[]): void;
}
