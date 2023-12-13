import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { watch } from '../../decorators/watch';
import type { InteractionChangedDetails, OutcomeChangedDetails } from '../internal/event-types';
import type { ResponseInteraction } from '../internal/expression-result';
import type { VariableDeclaration, VariableValue } from '../internal/variables';
import { OutcomeVariable, ResponseVariable } from '../internal/variables';
import type { QtiFeedback } from '../qti-feedback/qti-feedback';
import type { Interaction } from '../qti-interaction/internal/interaction/interaction';
import type { QtiResponseProcessing } from '../qti-response-processing';
import { ItemContext, itemContext, itemContextVariables } from './qti-assessment-item.context';

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
  @property({ type: String }) identifier: string = '';
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
  // @property({ attribute: false })
  private _context: ItemContext = {
    identifier: this.getAttribute('identifier'),
    variables: itemContextVariables
  };

  // @property({ type: String, reflect: true, attribute: 'state' })
  _state:
    | 'item-created' // <-- pk: this is the state when the item is created
    | 'item-connected' // <-- pk: this is the state when the item is connected
    | 'variables-restored' // <-- pk: this is the state when the variables are restored
    | 'first-updated' // <-- pk: this is the state when the first-updated event is fired
    | 'item-connected' = 'item-created'; // <-- pk: this is the state when the item is connected

  private set state(value: this['_state']) {
    this._state = value;
    // console.info(`item: %c${this._state}`, 'background: #222; color: #bada55');
  }

  public get variables(): VariableValue<string | string[] | null>[] {
    return this._context.variables.map(v => ({ identifier: v.identifier, value: v.value, type: v.type }));
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
          return { ...variable, ...matchingValue };
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
          interactionElement.response = variable.value;
        }
      }

      if (variable.type === 'outcome') {
        this._feedbackElements.forEach(fe => fe.checkShowFeedback(variable.identifier));
      }
    });
  }

  private _initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };
  private _feedbackElements: QtiFeedback[] = [];
  private _interactionElements: Interaction[] = [];

  firstUpdated(val): void {
    this.state = 'first-updated';
    requestAnimationFrame(() => {
      // necessary to wait for the children of every interaction
      this._emit<{ detail: QtiAssessmentItem }>('qti-assessment-item-first-updated', this);
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.state = 'item-connected';
  }

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

  constructor() {
    super();
    this.state = 'item-created';
    this.addEventListener('qti-register-variable', ({ detail }) => {
      this._context = { ...this._context, variables: [...this._context.variables, detail.variable] };
      this._initialContext = this._context;
    });
    this.addEventListener('qti-register-feedback', (e: CustomEvent<QtiFeedback>) => {
      e.stopPropagation();
      const feedbackElement = e.detail;
      this._feedbackElements.push(feedbackElement);
      feedbackElement.checkShowFeedback(feedbackElement.outcomeIdentifier);
    });
    this.addEventListener('qti-register-interaction', (e: CustomEvent<null>) => {
      e.stopPropagation();
      this._interactionElements.push(e.target as Interaction);
    });
    this.addEventListener('end-attempt', (e: CustomEvent<{ responseIdentifier: string; countAttempt: boolean }>) => {
      const { responseIdentifier, countAttempt } = e.detail;
      this.updateResponseVariable(responseIdentifier, 'true');
      this.processResponse(countAttempt);
    });

    this.addEventListener(
      // wordt aangeroepen vanuit de processingtemplate
      'qti-set-outcome-value',
      (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
        const { outcomeIdentifier, value } = e.detail;
        this.updateOutcomeVariable(outcomeIdentifier, value);
      }
    );

    this.addEventListener('qti-interaction-response', this.handleUpdateResponseVariable);
  }

  public showCorrectResponse(show: boolean) {
    const responseVariables = this._context.variables.filter(
      (vari: ResponseVariable | OutcomeVariable) => 'correctResponse' in vari && vari.correctResponse
    ) as ResponseVariable[];
    const responses = responseVariables.map(cr => {
      return {
        responseIdentifier: cr.identifier,
        response: cr.correctResponse
      };
    });
    for (const response of responses) {
      const interaction: Interaction | undefined = this._interactionElements.find(
        i => i.getAttribute('response-identifier') === response.responseIdentifier
      );
      interaction && (interaction.correctResponse = show ? response.response : '');
    }
  }

  public processResponse(countNumAttempts: boolean = true): boolean {
    const responseProcessor = this.querySelector('qti-response-processing') as unknown as QtiResponseProcessing;
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
      // if adapative, completionStatus is set by the processing template
      this.updateOutcomeVariable('completionStatus', this._getCompletionStatus());
    }

    countNumAttempts &&
      this.updateOutcomeVariable(
        'numAttempts',
        (+this._context.variables.find(v => v.identifier === 'numAttempts')?.value + 1).toString()
      );

    this._emit('qti-response-processed');
    return true;
  }

  public resetResponses() {
    this._context = this._initialContext;
  }

  public getResponse(identifier: string): Readonly<ResponseVariable> {
    return this.getVariable(identifier) as ResponseVariable;
  }

  public getOutcome(identifier: string): Readonly<OutcomeVariable> {
    return this.getVariable(identifier) as OutcomeVariable;
  }

  public getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>> {
    return this._context.variables.find(v => v.identifier === identifier) || null;
  }

  // saving privates here: ------------------------------------------------------------------------------

  private handleUpdateResponseVariable(event: CustomEvent<ResponseInteraction>) {
    const { responseIdentifier, response } = event.detail;
    this.updateResponseVariable(responseIdentifier, response);
  }

  public updateResponseVariable(identifier: string, value: string | string[] | undefined) {
    this._context = {
      ...this._context,
      variables: this._context.variables.map(v => (v.identifier !== identifier ? v : { ...v, value: value }))
    };

    this._emit<InteractionChangedDetails>('qti-interaction-changed', {
      item: this.identifier,
      responseIdentifier: identifier,
      response: value
    });

    if (this.adaptive === 'false') {
      // if adapative, completionStatus is set by the processing template
      this.updateOutcomeVariable('completionStatus', this._getCompletionStatus());
    }
  }

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
          value: outcomeVariable.cardinality === 'single' ? value : [...v.value, value as string]
        };
      })
    };

    this._feedbackElements.forEach(fe => fe.checkShowFeedback(identifier));

    this._emit<OutcomeChangedDetails>('qti-outcome-changed', {
      item: this.identifier,
      outcomeIdentifier: identifier,
      value: this._context.variables.find(v => v.identifier === identifier)?.value
    });
  }

  private _getCompletionStatus(): 'completed' | 'incomplete' | 'not_attempted' | 'unknown' {
    if (this._interactionElements.every(interactionElement => interactionElement.validate())) return 'completed';
    if (this._interactionElements.some(interactionElement => interactionElement.validate())) return 'incomplete';
    return 'not_attempted';
  }

  private _emit<T>(name, detail = null) {
    this.dispatchEvent(
      new CustomEvent<T>(name, {
        bubbles: true,
        composed: true,
        detail
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item': QtiAssessmentItem;
  }
}
