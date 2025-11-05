import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { itemContext, itemContextVariables } from '@qti-components/shared';
import { watch } from '@qti-components/utilities';

import type { QtiTemplateProcessing } from '../qti-template-processing/qti-template-declaration/qti-template-processing.ts';
import type { InteractionChangedDetails, OutcomeChangedDetails } from '../../internal/event-types.ts';
import type { ResponseInteraction } from '@qti-components/shared';
import type { VariableDeclaration, VariableValue } from '@qti-components/shared';
import type { OutcomeVariable, ResponseVariable } from '@qti-components/shared';
import type { QtiFeedback } from '../qti-feedback/qti-feedback.ts';
import type { QtiResponseProcessing } from '../qti-response-processing/qti-response-processing.ts';
import type QtiRegisterVariable from '../../internal/events/qti-register-variable.ts';
import type { ItemContext } from '@qti-components/shared';
import type { Interaction } from '@qti-components/shared';
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
  private _itemTitle: string | undefined;
  private _templateProcessing: QtiTemplateProcessing | null = null;

  @property({ type: String }) identifier: string = '';
  @property({ type: String }) adaptive: 'true' | 'false' = 'false';
  @property({ type: String }) timeDependent: 'true' | 'false' | null = null;

  @property({ type: String })
  override get title(): string {
    return this._itemTitle;
  }
  override set title(value: string) {
    this._itemTitle = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }

  @property({ type: Boolean }) disabled: boolean;
  @watch('disabled', { waitUntilFirstUpdate: true })
  protected _handleDisabledChange = (_: boolean, disabled: boolean) => {
    this._interactionElements.forEach(ch => (ch.disabled = disabled));
  };

  @property({ type: Boolean }) readonly: boolean;
  @watch('readonly', { waitUntilFirstUpdate: true })
  protected _handleReadonlyChange = (_: boolean, readonly: boolean) =>
    this._interactionElements.forEach(ch => (ch.readonly = readonly));

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
        const interactionElement = this._interactionElements.find(
          (el: Interaction) => el.responseIdentifier === variable.identifier
        );
        if (interactionElement) {
          interactionElement.response = variable.value as string | string[];
        }
      }
    });

    this.variables.forEach(variable => {
      if (variable.type === 'outcome') {
        this._feedbackElements.forEach(fe => fe.checkShowFeedback(variable.identifier));
      }
    });
  }

  private _initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };
  private _feedbackElements: QtiFeedback[] = [];
  private _interactionElements: Interaction[] = [];

  /** @deprecated use variables property instead */
  set responses(myResponses: ResponseInteraction[]) {
    if (myResponses) {
      for (const response of myResponses) {
        const responseVariable = this.getResponse(response.responseIdentifier);
        if (responseVariable) {
          this.updateResponseVariable(response.responseIdentifier, response.response);
        }

        const interaction: Interaction | undefined = this._interactionElements.find(
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
    this._attachEventListeners();
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.dispatchEvent(
        new CustomEvent<QtiAssessmentItem>('qti-assessment-item-connected', {
          bubbles: true,
          composed: true,
          detail: this
        })
      );
      this._processTemplates();
    });
  }

  override disconnectedCallback(): void {
    this._removeEventListeners();
    super.disconnectedCallback();
  }

  private _attachEventListeners() {
    this.addEventListener('qti-register-variable', this._handleRegisterVariable);
    this.addEventListener('qti-register-feedback', this._handleRegisterFeedback);
    this.addEventListener('qti-register-interaction', this._handleRegisterInteraction);
    this.addEventListener('end-attempt', this._handleEndAttempt);
    this.addEventListener('qti-set-outcome-value', this._handleSetOutcomeValue);
    this.addEventListener('qti-interaction-response', this._handleUpdateResponseVariable);
  }

  private _removeEventListeners() {
    this.removeEventListener('qti-register-variable', this._handleRegisterVariable);
    this.removeEventListener('qti-register-feedback', this._handleRegisterFeedback);
    this.removeEventListener('qti-register-interaction', this._handleRegisterInteraction);
    this.removeEventListener('end-attempt', this._handleEndAttempt);
    this.removeEventListener('qti-set-outcome-value', this._handleSetOutcomeValue);
    this.removeEventListener('qti-interaction-response', this._handleUpdateResponseVariable);
  }

  private _handleRegisterVariable = (e: QtiRegisterVariable) => {
    e.stopImmediatePropagation();
    this._context = { ...this._context, variables: [...this._context.variables, e.detail.variable] };
    this._initialContext = this._context;
    e.stopPropagation();
  };

  private _handleRegisterFeedback = (e: CustomEvent<QtiFeedback>) => {
    e.stopImmediatePropagation();
    const feedbackElement = e.detail;
    this._feedbackElements.push(feedbackElement);
    const numAttempts = Number(this._context.variables.find(v => v.identifier === 'numAttempts')?.value) || 0;
    if (numAttempts > 0) {
      feedbackElement.checkShowFeedback(feedbackElement.outcomeIdentifier);
    }
  };

  private _handleRegisterInteraction = (e: CustomEvent<{ interaction: string; interactionElement: Interaction }>) => {
    e.stopImmediatePropagation();
    this._interactionElements.push(e.detail.interactionElement);
  };

  private _handleEndAttempt = (e: CustomEvent<{ responseIdentifier: string; countAttempt: boolean }>) => {
    e.stopImmediatePropagation();
    const { responseIdentifier, countAttempt } = e.detail;
    this.validate();
    this.updateResponseVariable(responseIdentifier, 'true');
    this.processResponse(countAttempt);
  };

  private _handleSetOutcomeValue = (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
    e.stopImmediatePropagation();
    const { outcomeIdentifier, value } = e.detail;
    this.updateOutcomeVariable(outcomeIdentifier, value);
    e.stopPropagation();
  };

  private _handleUpdateResponseVariable = (e: CustomEvent<ResponseInteraction>) => {
    e.stopImmediatePropagation();

    const { responseIdentifier, response } = e.detail;
    this.updateResponseVariable(responseIdentifier, response);

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
    for (const interaction of this._interactionElements) {
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
    for (const interaction of this._interactionElements) {
      interaction.toggleCandidateCorrection(show);
    }

    // Update one or more toggle component states // ItemShowCandidateCorrection
    document.querySelectorAll('item-show-candidate-correction').forEach((el: HTMLElement & { shown: boolean }) => {
      el.shown = show;
    });
  }

  private _processTemplates(): void {
    this._templateProcessing = this.querySelector<QtiTemplateProcessing>('qti-template-processing');
    if (this._templateProcessing) {
      // Run template processing before first presentation
      this._templateProcessing.process();
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
    if (!responseProcessor) {
      // console.info('Client side response processing template not available');
      return false;
    }

    if (!responseProcessor.process) {
      // console.info('Client side response webcomponents not available');
      return false;
    }

    responseProcessor.process();

    if (this.adaptive === 'false') {
      // if adaptive, completionStatus is set by the processing template
      this.updateOutcomeVariable('completionStatus', this._getCompletionStatus());
    }

    this.dispatchEvent(
      new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: { itemContext: this._context }
      })
    );

    return true;
  }

  public resetResponses() {
    this._context = this._initialContext;
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
      this.updateOutcomeVariable('completionStatus', this._getCompletionStatus());
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
    this._feedbackElements.forEach(fe => fe.checkShowFeedback(identifier));

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
    const isValid = this._interactionElements.every(interactionElement => interactionElement.validate());

    if (reportValidity) {
      this.reportValidity();
    }

    return isValid;
  }

  public reportValidity() {
    for (const interactionElement of this._interactionElements) {
      interactionElement.reportValidity();
    }
  }

  private _getCompletionStatus(): 'completed' | 'incomplete' | 'not_attempted' | 'unknown' {
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
