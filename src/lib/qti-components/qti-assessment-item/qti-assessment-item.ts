import { customElement, property, state } from 'lit/decorators.js';
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
import { Item, itemContext } from './qti-assessment-item.context';
import { provide } from '@lit-labs/context';

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
  @property({ type: String }) title: string;
  @property({ type: String }) identifier: string | undefined = undefined;
  @property({ type: String }) adaptive: 'true' | 'false' = 'false';
  @property({ type: String }) timeDependent: 'true' | 'false' = 'false';

  @property({ type: Boolean }) disabled: boolean;
  @watch('disabled', { waitUntilFirstUpdate: true })
  _handleDisabledChange = (_: boolean, disabled: boolean) => {
    this._interactionElements.forEach(ch => (ch.disabled = disabled));
  };

  @property({ type: Boolean }) readonly: boolean;
  @watch('readonly', { waitUntilFirstUpdate: true })
  _handleReadonlyChange = (_: boolean, readonly: boolean) =>
    this._interactionElements.forEach(ch => (ch.readonly = readonly));

  @provide({ context: itemContext })
  @state()
  private _itemProvider: Readonly<Item> = {
    variables: [
      {
        identifier: 'completionStatus',
        cardinality: 'single',
        baseType: 'string',
        value: 'not_attempted',
        type: 'outcome'
      },
      {
        identifier: 'numAttempts',
        cardinality: 'single',
        baseType: 'integer',
        value: '0',
        type: 'response'
      }
    ]
  };

  private _feedbackElements: QtiFeedback[] = [];
  private _interactionElements: Interaction[] = [];

  override render() {
    return html`<slot></slot>
      <pre>${JSON.stringify(this._itemProvider.variables, null, 2)}</pre>`;
  }

  constructor() {
    super();

    this.addEventListener('qti-register-variable', ({ detail }) => {
      this._itemProvider = { ...this._itemProvider, variables: [...this._itemProvider.variables, detail.variable] };
    });
    this.addEventListener('qti-register-feedback', ({ detail }) => {
      this._feedbackElements.push(detail);
    });
    this.addEventListener('qti-register-interaction', ({ detail }) => {
      this._interactionElements.push(detail);
    });
    this.addEventListener('qti-outcome-changed', this.handleOutcomeChanged);
    this.addEventListener('qti-interaction-response', this.handleResponseChanged);
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

  public showCorrectResponse() {
    const responseVariables = this._itemProvider.variables.filter(
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

    this._setOutcomeValue(
      'numAttempts',
      (+this._itemProvider.variables.find(v => v.identifier === 'numAttempts')?.value + 1).toString()
    );

    if (this.adaptive === 'false') {
      // if adapative, completionStatus is set by the processing template
      this._setOutcomeValue('completionStatus', this._getCompletionStatus());
    }

    this.dispatchEvent(new CustomEvent('qti-response-processing'));
    return true;
  }

  // check set response back for interactions
  // We can set the responses as a string or as an object in ResponseFormat
  set responses(myResponses: ResponseInteraction[]) {
    if (myResponses) {
      for (const response of myResponses) {
        const interaction: Interaction | undefined = this._interactionElements.find(
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

  // FIXME: pk, does this take into account the cardinality of the response variable?
  public resetInteractions() {
    this._interactionElements.forEach(interactionElement => interactionElement.reset());
  }

  public getVariable(identifier: string): VariableDeclaration<string | string[] | undefined> {
    const variable = this._itemProvider.variables.find(vr => vr.identifier === identifier);
    if (!variable) {
      console.warn(`Variable with identifier ${identifier} was not found`);
      return null;
    }
    return variable;
  }

  public getResponse(identifier: string): ResponseVariable | null {
    const variable = this._itemProvider.variables.find(vr => vr.identifier === identifier);
    const responseVariable = variable.type === 'response' ? variable : null;
    return responseVariable as ResponseVariable;
  }

  public getOutcome(identifier: string): OutcomeVariable | null {
    const variable = this._itemProvider.variables.find(vr => vr.identifier === identifier);
    const outcomeVariable = variable.type === 'outcome' ? variable : null;
    return outcomeVariable as OutcomeVariable;
  }

  // saving privates here: ------------------------------------------------------------------------------

  private _setOutcomeValue(outcomeIdentifier: string, outcome: string) {
    const outcomeVariable = this.getOutcome(outcomeIdentifier);
    if (!outcomeVariable) {
      console.warn(`Can not set qti-outcome-identifier: ${outcomeIdentifier}, it is not available`);
      return;
    }

    this._itemProvider = {
      ...this._itemProvider,
      variables: this._itemProvider.variables.map(v => {
        if (v.identifier !== outcomeIdentifier) {
          return v;
        }
        return {
          ...v,
          value: outcomeVariable.cardinality === 'single' ? outcome : [...v.value, outcome]
        };
      })
    };

    this.dispatchEvent(
      new CustomEvent<OutcomeChangedDetails>('qti-outcome-changed', {
        bubbles: true,
        composed: true,
        detail: {
          item: this.identifier,
          outcomeIdentifier,
          value: this._itemProvider.variables.find(v => v.identifier === outcomeIdentifier)?.value
        }
      })
    );
  }

  // interaction has fired an event to save response.
  private handleResponseChanged(event: CustomEvent<InteractionChangedDetails>) {
    event.stopImmediatePropagation();
    const detail = event.detail;

    // change value in an immutable way
    this._itemProvider = {
      ...this._itemProvider,
      variables: this._itemProvider.variables.map(v =>
        v.identifier === detail.responseIdentifier ? { ...v, value: detail.response } : v
      )
    };

    if (!this.identifier) {
      console.warn(`qti-assessment-item has no identifier specified`);
    }

    this.dispatchEvent(
      new CustomEvent<InteractionChangedDetails>('qti-interaction-changed', {
        bubbles: true,
        composed: true,
        detail: {
          item: this.identifier,
          responseIdentifier: detail.responseIdentifier,
          response: detail.response
        }
      })
    );
  }

  private handleOutcomeChanged(event: CustomEvent<OutcomeChangedDetails>) {
    this.showFeedback(event);
  }

  private showFeedback(event: CustomEvent<OutcomeChangedDetails>) {
    this._feedbackElements.forEach(fe => {
      fe.checkShowFeedback(event.detail.outcomeIdentifier); // , event.detail.value);
    });
  }

  private _getCompletionStatus(): 'completed' | 'incomplete' | 'not_attempted' | 'unknown' {
    if (this._interactionElements.every(interactionElement => interactionElement.validate())) return 'completed';
    if (this._interactionElements.some(interactionElement => interactionElement.validate())) return 'incomplete';
    return 'not_attempted';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item': QtiAssessmentItem;
  }
}
