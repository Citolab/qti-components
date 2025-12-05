export interface IInteraction {
  correctResponse: Readonly<string | string[]>;
  // value: string;
  response: string | string[];
  responseIdentifier: string;
  disabled: boolean;
  readonly: boolean;
  validationDisplay?: 'native' | 'custom' | 'both' | 'none';
  /**
   * @deprecated Use checkValidity() instead.
   */
  validate(): boolean;

  /**
   * @deprecated Use formResetCallback() instead.
   */
  reset(): void;
  /**
   * Save the response value to the interaction.
   * @param value The response value to save.
   */
  saveResponse(value: string | string[]): void;
  /** Real form validation: https://html.spec.whatwg.org/dev/custom-elements.html */
  checkValidity?(): boolean;
  reportValidity?(): boolean;
  formResetCallback?(form: HTMLFormElement): void;
  formDisabledCallback?(disabled: boolean): void;
  formStateRestoreCallback?(state: string): void;
}
