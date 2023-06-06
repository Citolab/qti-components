export interface IInteraction {
  disabled: boolean;
  readonly: boolean;
  response: string | string[];
  reset();
  validate(): boolean;
}
