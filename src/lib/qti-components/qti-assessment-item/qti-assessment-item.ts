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
import { ItemContext, itemContext } from './qti-assessment-item.context';
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

  // @provide({ context: itemContext })
  @property({ attribute: false })
  private _context: ItemContext = {
    identifier: this.getAttribute('identifier'),
    itemEl: this,
    variables: [
      {
        identifier: 'completionStatus',
        cardinality: 'single',
        baseType: 'string',
        value: 'unknown',
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

  public get context(): ItemContext {
    return this._context;
  }

  public set context(value: ItemContext) {
    this._context = value;

    this.context.variables.forEach(variable => {
      if (variable.type === 'response') {
        const interactionElement = this._interactionElements.find(
          (el: Interaction) => el.responseIdentifier === variable.identifier
        );
        if (interactionElement) {
          interactionElement.response = variable.value;
        }
      }

      if (variable.type === 'outcome' || variable['_constructor-name_'] == 'OutcomeVariable') {
        this._feedbackElements.forEach(fe => fe.checkShowFeedback(variable.identifier));
      }
    });

    this.requestUpdate('context', null);
  }

  private _initialContext: Readonly<ItemContext> = { ...this.context, variables: this._context.variables };
  private _feedbackElements: QtiFeedback[] = [];
  private _interactionElements: Interaction[] = [];

  firstUpdated(val): void {
    super.firstUpdated(val);
    this._emit<{ detail: QtiAssessmentItem }>('qti-item-connected', this);
  }

  /** @deprecated use context property instead */
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

    this.addEventListener('qti-register-variable', ({ detail }) => {
      this._context = { ...this._context, variables: [...this._context.variables, detail.variable] };
      this._initialContext = this._context;
    });
    this.addEventListener('qti-register-feedback', (e: CustomEvent<QtiFeedback>) => {
      e.stopPropagation();
      this._feedbackElements.push(e.detail);
    });
    this.addEventListener('qti-register-interaction', (e: CustomEvent<null>) => {
      e.stopPropagation();
      this._interactionElements.push(e.target as Interaction);
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

  // public showCorrectResponse() {
  //   const responseVariables = this.context.variables.filter(
  //     (vari: ResponseVariable | OutcomeVariable) => 'correctResponse' in vari && vari.correctResponse
  //   ) as ResponseVariable[];
  //   this.responses = responseVariables.map(cr => {
  //     return {
  //       responseIdentifier: cr.identifier,
  //       response: cr.correctResponse
  //     };
  //   });
  // }

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

    this.updateOutcomeVariable(
      'numAttempts',
      (+this._context.variables.find(v => v.identifier === 'numAttempts')?.value + 1).toString()
    );

    this._emit('qti-response-processing');
    return true;
  }

  public resetResponses() {
    this.context = this._initialContext;
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
    if (this.adaptive === 'false') {
      // if adapative, completionStatus is set by the processing template
      this.updateOutcomeVariable('completionStatus', this._getCompletionStatus());
    }
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

    this._emit<InteractionChangedDetails>('qti-outcome-changed', {
      item: this.identifier,
      identifier,
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
