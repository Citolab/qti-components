import { customElement, property } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { OutcomeVariable } from '../qti-utilities/Variables';
import { ResponseVariable } from '../qti-utilities/Variables';
import { watch } from '../../decorators/watch';
import type { ResponseInteraction } from '../qti-utilities/ExpressionResult';
import type { Interaction } from '../qti-interaction/internal/interaction/interaction';
import type { InteractionChangedDetails, OutcomeChangedDetails } from '../qti-utilities/EventTypes';
import type { QtiFeedback } from '../qti-feedback/qti-feedback';
import type { QtiResponseProcessing } from '../qti-responseprocessing';
import type { VariableDeclaration } from '../qti-utilities/Variables';
import type QtiRegisterVariable from '../qti-utilities/events/qti-register-variable';

/**
 * @summary The qti-assessment-item element contains all the other QTI 3 item structures.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.dltnnj87l0yj
 * @status stable
 * @since 4.0
 *
 * @dependency qti-feedback
 * @dependency qti-responseprocessing
 *
 * @slot - The default slot where all the other QTI 3 item structures go.
 *
 * @event qti-interaction-changed - Emitted when an interaction is changed.
 * @event qti-outcome-changed - Emitted when an outcome has changed.
 * @event qti-response-processing - Emitted when response-processing is called.
 *
 */
@customElement('qti-assessment-item')
export class QtiAssessmentItem extends LitElement {
  public variables: VariableDeclaration<string | string[]>[] = []; // made public for tests to access
  private feedbackElements: QtiFeedback[] = [];
  private interactionElements: Interaction[] = [];

  @property({ type: Boolean }) disabled: boolean;
  @property({ type: Boolean }) readonly: boolean;

  @property({ type: String }) title: string;
  @property({ type: String }) identifier: string;

  private _numAttempts = 0;

  override render() {
    return html`<slot></slot>`;
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  _handleDisabledChange = (_: boolean, disabled: boolean) => {
    this.interactionElements.forEach(ch => (ch.disabled = disabled));
  };

  @watch('readonly', { waitUntilFirstUpdate: true })
  _handleReadonlyChange = (_: boolean, readonly: boolean) =>
    this.interactionElements.forEach(ch => (ch.readonly = readonly));

  constructor() {
    super();
    // listen for events.
    this.addEventListener('qti-register-variable', this._registerVariable);
    this.addEventListener('qti-register-feedback', this.registerFeedbackElement);
    this.addEventListener('qti-register-interaction', this.registerInteractionElement);
    this.addEventListener('qti-outcome-changed', this.outcomeChanged);
    this.addEventListener('qti-interaction-response', this.interactionResponse);
  }

  firstUpdated(val): void {
    super.firstUpdated(val);
    this.dispatchEvent(
      new CustomEvent<{ identifier: string }>('qti-item-connected', {
        bubbles: true,
        composed: true,
        detail: this
      })
    );
  }

  public override disconnectedCallback() {
    // remove events listeners.
    this.removeEventListener('qti-register-variable', this._registerVariable);
    this.removeEventListener('qti-register-feedback', this.registerFeedbackElement);
    this.removeEventListener('qti-register-interaction', this.registerInteractionElement);
    this.removeEventListener('qti-outcome-changed', this.outcomeChanged);
    this.removeEventListener('qti-interaction-response', this.interactionResponse);
  }

  private _registerVariable(event: QtiRegisterVariable) {
    this.variables.push(event.detail.variable);
  }

  public showCorrectResponse() {
    const responseVariables = this.variables.filter(
      (vari: ResponseVariable | OutcomeVariable) => 'correctResponse' in vari && vari.correctResponse
    ) as ResponseVariable[];
    this.responses = responseVariables.map(cr => {
      return {
        responseIdentifier: cr.identifier,
        response: cr.correctResponse
      };
    });
  }

  public processResponse(): boolean {
    const responseProcessor = this.querySelector('qti-response-processing') as unknown as QtiResponseProcessing;
    if (!responseProcessor) {
      console.info('Client side response processing template not available');
      return false;
    }

    if (!responseProcessor.process) {
      console.info('Client side response webcomponents not available');
      return false;
    }

    responseProcessor.process();
    this._numAttempts++;
    this.dispatchEvent(new CustomEvent('qti-response-processing'));
    return true;
  }

  // check set response back for interactions
  // We can set the responses as a string or as an object in ResponseFormat
  set responses(myResponses: ResponseInteraction[]) {
    if (myResponses) {
      for (const response of myResponses) {
        const interaction: Interaction | undefined = this.interactionElements.find(
          i => i.getAttribute('response-identifier') === response.responseIdentifier
        );
        // If there is a responseVariable, set the value back into the responseVariable
        const responseVariable = this.getResponse(response.responseIdentifier);
        if (responseVariable) {
          responseVariable.value = response.response;
        }
        // Set the response in the interaction
        if (interaction) {
          interaction.response = response.response;
        }
      }
    }
  }

  resetInteractions() {
    this.interactionElements.forEach(interactionElement => interactionElement.reset());
  }

  // check all interactions contain valid responses
  public validateResponses(): boolean {
    let result = true;
    this.interactionElements.forEach(interactionElement => {
      if (!interactionElement.validate()) {
        result = false;
      }
    });
    return result;
  }

  public getVariable(identifier: string): VariableDeclaration<string | string[] | undefined> {
    switch (identifier) {
      case 'numAttempts':
        return {
          identifier: 'numAttempts',
          cardinality: 'single',
          baseType: 'integer',
          value: this._numAttempts.toString()
        };
        break;

      default:
        {
          const variable = this.variables.find(vr => vr.identifier === identifier);
          if (!variable) {
            console.warn(`Variable with identifier ${identifier} was not found`);
            return null;
          }
          return variable;
        }
        break;
    }
  }

  public getResponse(identifier: string): ResponseVariable | null {
    const variable = this.variables.find(vr => vr.identifier === identifier);
    const responseVariable = variable instanceof ResponseVariable ? variable : null;
    return responseVariable;
  }

  public getOutcome(identifier: string): OutcomeVariable | null {
    const variable = this.variables.find(vr => vr.identifier === identifier);
    if (variable instanceof OutcomeVariable) {
      return variable;
    }
    return null;
  }

  private registerFeedbackElement(e: CustomEvent<QtiFeedback>) {
    e.stopPropagation();
    this.feedbackElements.push(e.detail);
  }

  private registerInteractionElement(e: CustomEvent<null>) {
    e.stopPropagation();
    this.interactionElements.push(e.target as Interaction);
  }

  // interaction has fired an event to save response.
  private interactionResponse(event: CustomEvent<InteractionChangedDetails>) {
    const detail = event.detail;
    // Maybe we do not have a responseVariable declared, no problem should work without
    const responseVariable = this.getResponse(detail.responseIdentifier);
    if (responseVariable) {
      responseVariable.value = detail.response;
    }
    event.stopImmediatePropagation();

    const identifier = this.getAttribute('identifier');
    if (!identifier) {
      console.warn(`qti-assessment-item has no identifier specified`);
    }

    this.dispatchEvent(
      new CustomEvent<InteractionChangedDetails>('qti-interaction-changed', {
        bubbles: true,
        composed: true,
        detail: {
          item: identifier,
          responseIdentifier: detail.responseIdentifier,
          response: detail.response
        }
      })
    );
  }

  // checks the attributes of all feedback elements and shows/hides as appropriate.
  private outcomeChanged(event: CustomEvent<OutcomeChangedDetails>) {
    this.showFeedback(event);
  }

  private showFeedback(event: CustomEvent<OutcomeChangedDetails>) {
    this.feedbackElements.forEach(fe => {
      fe.checkShowFeedback(event.detail.outcomeIdentifier); // , event.detail.value);
    });
  }

  public setOutcomeValue(identifier: string, value: string) {
    let outcomeIdentifier: VariableDeclaration<any>;
    switch (identifier) {
      // https://qti-components.citolab.nl/?path=/docs/qti-tutorial--docs#listing-12-using-numattempts-to-set-the-completion-status
      // PK: let's fake a completionStatus variable for adaptive items
      case 'completionStatus':
        outcomeIdentifier = {
          identifier: 'completionStatus',
          cardinality: 'single',
          baseType: 'string',
          value: value
        };
        break;
      default:
        {
          outcomeIdentifier = this.getOutcome(identifier);
          if (!outcomeIdentifier) {
            console.warn(`Can not set qti-outcome-identifier: ${identifier}, it is not available`);
            return;
          }

          if (outcomeIdentifier.cardinality === 'single') {
            outcomeIdentifier.value = value;
          } else {
            (outcomeIdentifier.value as any[]).push(value);
          }
        }
        break;
    }
    this.dispatchEvent(
      new CustomEvent<OutcomeChangedDetails>('qti-outcome-changed', {
        bubbles: true,
        composed: true,
        detail: {
          item: this.identifier,
          outcomeIdentifier: identifier,
          value: outcomeIdentifier.value
        }
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item': QtiAssessmentItem;
  }
}
