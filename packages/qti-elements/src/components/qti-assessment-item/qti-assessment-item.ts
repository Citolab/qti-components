import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { itemContext, itemContextVariables } from '@qti-components/base';
import { watch } from '@qti-components/utilities';

import type { QtiTemplateProcessing } from '../qti-template-processing/qti-template-processing.js';
import type { InteractionChangedDetails, OutcomeChangedDetails } from '../../internal/event-types.ts';
import type { QtiFeedback, ResponseInteraction } from '@qti-components/base';
import type { VariableDeclaration, VariableValue } from '@qti-components/base';
import type { OutcomeVariable, ResponseVariable } from '@qti-components/base';
import type { QtiResponseProcessing } from '../qti-response-processing/qti-response-processing.ts';
import type QtiRegisterVariable from '../../internal/events/qti-register-variable.ts';
import type { ItemContext } from '@qti-components/base';
import type { Interaction } from '@qti-components/base';
// import type { ItemShowCandidateCorrection } from '../../qti-item/components/item-show-candidate-correction.ts';
// import type { ItemShowCorrectResponse } from '../../qti-item/components/item-show-correct-response.ts';

/**
 * @summary The qti-assessment-item element contains all the other QTI 3 item structures.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.dltnnj87l0yj
 *
 * @dependency qti-feedback
 * @dependency qti-responseprocessing
 *
 * @event qti-item-context-updated - Emitted when through a user action the itemContext is updated,
 * typically on interaction with the interactions, or calling response processing.
 */
@customElement('qti-assessment-item')
export class QtiAssessmentItem extends LitElement {
  #itemTitle: string | undefined;
  #templateProcessing: QtiTemplateProcessing | null = null;

  @property({ type: String }) identifier: string = '';
  @property({ type: String }) adaptive: 'true' | 'false' = 'false';
  @property({ type: String }) timeDependent: 'true' | 'false' | null = null;

  @property({ type: String })
  override get title(): string {
    return this.#itemTitle;
  }
  override set title(value: string) {
    this.#itemTitle = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }

  @property({ type: Boolean }) disabled: boolean;
  @watch('disabled', { waitUntilFirstUpdate: true })
  protected _handleDisabledChange = (_: boolean, disabled: boolean) => {
    this.#interactionElements.forEach(ch => (ch.disabled = disabled));
  };

  @property({ type: Boolean }) readonly: boolean;
  @watch('readonly', { waitUntilFirstUpdate: true })
  protected _handleReadonlyChange = (_: boolean, readonly: boolean) =>
    this.#interactionElements.forEach(ch => (ch.readonly = readonly));

  @provide({ context: itemContext })
  private _context: ItemContext = {
    variables: itemContextVariables
  };

  /**
   * Sets the identifier for the assessment item reference if this item is in a test.
   *
   * @param identifier - The identifier for the assessment item reference.
   */
  public set assessmentItemRefId(identifier: string) {
    this._context = { ...this._context, identifier };
  }

  public get assessmentItemRefId(): string {
    return this._context.identifier;
  }

  public get variables(): VariableValue<string | string[] | null>[] {
    return this._context.variables.map(v => ({
      identifier: v.identifier,
      value: v.value,
      type: v.type,
      // add externalscored, a fixed prop to the test, so the testcontext can read and decide how to score this item
      ...(v.type === 'outcome' && v.identifier === 'SCORE'
        ? { externalScored: (v as OutcomeVariable).externalScored }
        : {})
    }));
  }

  public set variables(value: VariableValue<string | string[] | null>[]) {
    if (!Array.isArray(value) || value.some(v => !('identifier' in v))) {
      console.warn('variables property should be an array of VariableDeclaration');
      return;
    }
    this._context = {
      ...this._context,
      variables: this._context.variables.map(variable => {
        const matchingValue = value.find(v => v.identifier === variable.identifier);
        if (matchingValue) {
          return {
            ...variable,
            ...matchingValue,
            interpolationTable: (variable as OutcomeVariable).interpolationTable
          };
        }
        return variable;
      })
    };

    this._context.variables.forEach(variable => {
      if (variable.type === 'response') {
        const interactionElement = this.#interactionElements.find(
          (el: Interaction) => el.responseIdentifier === variable.identifier
        );
        if (interactionElement) {
          interactionElement.response = variable.value as string | string[];
        }
      }
    });

    this.variables.forEach(variable => {
      if (variable.type === 'outcome') {
        this.#feedbackElements.forEach(fe => fe.checkShowFeedback(variable.identifier));
      }
    });
  }

  public get state(): ItemContext['state'] {
    return this._context.state;
  }

  public set state(value: ItemContext['state']) {
    this._context = {
      ...this._context,
      state: value ? { ...value } : undefined
    };
  }

  #initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };
  #feedbackElements: QtiFeedback[] = [];
  #interactionElements: Interaction[] = [];

  /** @deprecated use variables property instead */
  set responses(myResponses: ResponseInteraction[]) {
    if (myResponses) {
      for (const response of myResponses) {
        const responseVariable = this.getResponse(response.responseIdentifier);
        if (responseVariable) {
          this.updateResponseVariable(response.responseIdentifier, response.response);
        }

        const interaction: Interaction | undefined = this.#interactionElements.find(
          i => i.getAttribute('response-identifier') === response.responseIdentifier
        );
        if (interaction) {
          interaction.response = response.response;
        }
      }
    }
  }

  override render() {
    return html`<slot></slot>`;
  }

  override connectedCallback(): void {
    this.#attachEventListeners();
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.dispatchEvent(
        new CustomEvent<QtiAssessmentItem>('qti-assessment-item-connected', {
          bubbles: true,
          composed: true,
          detail: this
        })
      );
      this.#processTemplates();
    });
  }

  override disconnectedCallback(): void {
    this.#removeEventListeners();
    super.disconnectedCallback();
  }

  #attachEventListeners() {
    this.addEventListener('qti-register-variable', this.#handleRegisterVariable);
    this.addEventListener('qti-register-feedback', this.#handleRegisterFeedback);
    this.addEventListener('qti-register-interaction', this.#handleRegisterInteraction);
    this.addEventListener('end-attempt', this.#handleEndAttempt);
    this.addEventListener('qti-set-outcome-value', this.#handleSetOutcomeValue);
    this.addEventListener('qti-interaction-response', this.#handleUpdateResponseVariable);
  }

  #removeEventListeners() {
    this.removeEventListener('qti-register-variable', this.#handleRegisterVariable);
    this.removeEventListener('qti-register-feedback', this.#handleRegisterFeedback);
    this.removeEventListener('qti-register-interaction', this.#handleRegisterInteraction);
    this.removeEventListener('end-attempt', this.#handleEndAttempt);
    this.removeEventListener('qti-set-outcome-value', this.#handleSetOutcomeValue);
    this.removeEventListener('qti-interaction-response', this.#handleUpdateResponseVariable);
  }

  #handleRegisterVariable = (e: QtiRegisterVariable) => {
    e.stopImmediatePropagation();
    this._context = { ...this._context, variables: [...this._context.variables, e.detail.variable] };
    this.#initialContext = this._context;
    e.stopPropagation();
  };

  #handleRegisterFeedback = (e: CustomEvent<QtiFeedback>) => {
    e.stopImmediatePropagation();
    const feedbackElement = e.detail;
    this.#feedbackElements.push(feedbackElement);
    const numAttempts = Number(this._context.variables.find(v => v.identifier === 'numAttempts')?.value) || 0;
    if (numAttempts > 0) {
      feedbackElement.checkShowFeedback(feedbackElement.outcomeIdentifier);
    }
  };

  #handleRegisterInteraction = (e: CustomEvent<{ interaction: string; interactionElement: Interaction }>) => {
    e.stopImmediatePropagation();
    this.#interactionElements.push(e.detail.interactionElement);
  };

  #handleEndAttempt = (e: CustomEvent<{ responseIdentifier: string; countAttempt: boolean }>) => {
    e.stopImmediatePropagation();
    const { responseIdentifier, countAttempt } = e.detail;
    this.validate();
    this.updateResponseVariable(responseIdentifier, 'true');
    this.processResponse(countAttempt);
  };

  #handleSetOutcomeValue = (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
    e.stopImmediatePropagation();
    const { outcomeIdentifier, value } = e.detail;
    this.updateOutcomeVariable(outcomeIdentifier, value);
    e.stopPropagation();
  };

  #handleUpdateResponseVariable = (e: CustomEvent<ResponseInteraction>) => {
    e.stopImmediatePropagation();

    const { responseIdentifier, response, state } = e.detail;
    this.updateResponseVariable(responseIdentifier, response);
    if (state !== undefined) {
      this._context = {
        ...this._context,
        state: {
          ...(this._context.state || {}),
          [responseIdentifier]: state
        }
      };
    }

    this.dispatchEvent(
      new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: { itemContext: this._context }
      })
    );
  };

  /**
   * Toggles the display of correct responses for all interactions.
   * @param show - A boolean indicating whether to show or hide correct responses.
   */
  public showCorrectResponse(show: boolean): void {
    // Iterate through all interaction elements
    for (const interaction of this.#interactionElements) {
      interaction.toggleCorrectResponse(show);
    }

    // Update one or more toggle component states // ItemShowCorrectResponse
    document.querySelectorAll('item-show-correct-response').forEach((el: HTMLElement & { shown: boolean }) => {
      el.shown = show;
    });
  }

  /**
   * Toggles the display of the candidate correction for all interactions.
   * @param show - A boolean indicating whether to show or hide candidate correction.
   */
  public showCandidateCorrection(show: boolean): void {
    // Iterate through all interaction elements
    for (const interaction of this.#interactionElements) {
      interaction.toggleCandidateCorrection(show);
    }

    // Update one or more toggle component states // ItemShowCandidateCorrection
    document.querySelectorAll('item-show-candidate-correction').forEach((el: HTMLElement & { shown: boolean }) => {
      el.shown = show;
    });
  }

  #processTemplates(): void {
    this.#templateProcessing = this.querySelector<QtiTemplateProcessing>('qti-template-processing');
    if (this.#templateProcessing) {
      // Run template processing before first presentation
      this.#templateProcessing.process();
    }
  }

  public processResponse(countNumAttempts = true, reportValidityAfterScoring = true): boolean {
    this.validate(reportValidityAfterScoring);

    if (countNumAttempts) {
      this.updateOutcomeVariable(
        'numAttempts',
        (+this._context.variables.find(v => v.identifier === 'numAttempts')?.value + 1).toString()
      );
    }

    const responseProcessor = this.querySelector<QtiResponseProcessing>('qti-response-processing');
    const canProcess = !!(responseProcessor && typeof responseProcessor.process === 'function');
    if (canProcess) {
      responseProcessor.process();
    }
    if (this.adaptive === 'false') {
      // if adaptive, completionStatus is set by the processing template
      this.updateOutcomeVariable('completionStatus', this.#getCompletionStatus());
    }

    this.dispatchEvent(
      new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: { itemContext: this._context }
      })
    );

    return canProcess;
  }

  public resetResponses() {
    this._context = this.#initialContext;
  }

  protected getResponse(identifier: string): Readonly<ResponseVariable> {
    return this.getVariable(identifier) as ResponseVariable;
  }

  public getOutcome(identifier: string): Readonly<OutcomeVariable> {
    return this.getVariable(identifier) as OutcomeVariable;
  }

  protected getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>> {
    return this._context.variables.find(v => v.identifier === identifier) || null;
  }

  // saving privates here: ------------------------------------------------------------------------------

  /**
   * Updates the response variable with the specified identifier to the given value.
   *
   * @protected
   *
   * This method is intended for internal use within the class and subclasses.
   * It should not be called externally by third parties.
   *
   * @param identifier - The identifier of the response variable to update.
   * @param value - The new value for the response variable.
   */
  public updateResponseVariable(identifier: string, value: string | string[] | undefined) {
    this._context = {
      ...this._context,
      variables: this._context.variables.map(v => (v.identifier !== identifier ? v : { ...v, value: value }))
    };

    // Turn off candidate correction after change of response variable
    this.showCandidateCorrection(false);

    this.dispatchEvent(
      new CustomEvent<InteractionChangedDetails>('qti-interaction-changed', {
        bubbles: true,
        composed: true,
        detail: {
          item: this.identifier,
          responseIdentifier: identifier,
          response: Array.isArray(value) ? [...value] : value
        }
      })
    );

    if (this.adaptive === 'false') {
      // if adaptive, completionStatus is set by the processing template
      this.updateOutcomeVariable('completionStatus', this.#getCompletionStatus());
    }
  }

  public setOutcomeVariable(identifier: string, value: string | string[] | undefined) {
    this.updateOutcomeVariable(identifier, value);
    this.dispatchEvent(
      new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: { itemContext: this._context }
      })
    );
  }

  /**
   * Updates the outcome variable with the specified identifier to the given value.
   *
   * @protected
   *
   * This method is intended for internal use within the class and subclasses.
   * It should not be called externally by third parties.
   *
   * @param identifier - The identifier of the response variable to update.
   * @param value - The new value for the response variable.
   */
  public updateOutcomeVariable(identifier: string, value: string | string[] | undefined) {
    const outcomeVariable = this.getOutcome(identifier);

    if (!outcomeVariable) {
      console.warn(`Can not set qti-outcome-identifier: ${identifier}, it is not available`);
      return;
    }

    this._context = {
      ...this._context,
      variables: this._context.variables.map(v => {
        if (v.identifier !== identifier) {
          return v;
        }
        return {
          ...v,
          value: outcomeVariable.cardinality === 'single' ? value : Array.isArray(value) ? value : [value]
        };
      })
    };
    this.#feedbackElements.forEach(fe => fe.checkShowFeedback(identifier));

    this.dispatchEvent(
      new CustomEvent<OutcomeChangedDetails>('qti-outcome-changed', {
        bubbles: true,
        composed: true,
        detail: {
          item: this.identifier,
          outcomeIdentifier: identifier,
          value: this._context.variables.find(v => v.identifier === identifier)?.value
        }
      })
    );
  }

  public validate(reportValidity = true): boolean {
    const isValid = this.#interactionElements.every(interactionElement => interactionElement.validate());

    if (reportValidity) {
      this.reportValidity();
    }

    return isValid;
  }

  public reportValidity() {
    for (const interactionElement of this.#interactionElements) {
      interactionElement.reportValidity();
    }
  }

  #getCompletionStatus(): 'completed' | 'incomplete' | 'not_attempted' | 'unknown' {
    const valid = this.validate(false);
    if (valid === true) return 'completed';
    if (valid === false) return 'incomplete';
    return 'not_attempted';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item': QtiAssessmentItem;
  }
}
