import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { watch } from '../../decorators/watch';
import { itemContext } from '../../exports/qti-assessment-item.context';
import { itemContextVariables } from '../../exports/item.context';

import type { InteractionChangedDetails, OutcomeChangedDetails } from '../internal/event-types';
import type { ResponseInteraction } from '../../exports/expression-result';
import type { VariableDeclaration, VariableValue } from '../../exports/variables';
import type { OutcomeVariable, ResponseVariable } from '../../exports/variables';
import type { QtiFeedback } from '../qti-feedback/qti-feedback';
import type { QtiResponseProcessing } from '../qti-response-processing';
import type QtiRegisterVariable from '../internal/events/qti-register-variable';
import type { ItemContext } from '../../exports/item.context';
import type { Interaction } from '../../exports/interaction';
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
  @property({ type: String }) timeDependent: 'true' | 'false' | null = null;

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
  private _context: ItemContext = {
    identifier: this.getAttribute('identifier'),
    variables: itemContextVariables
  };

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
          interactionElement.value = variable.value as string | string[];
        }
      }
    });
  }

  private _initialContext: Readonly<ItemContext> = { ...this._context, variables: this._context.variables };
  private _feedbackElements: QtiFeedback[] = [];
  private _interactionElements: Interaction[] = [];

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this._emit<{ detail: QtiAssessmentItem }>('qti-assessment-item-connected', this);
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
          interaction.value = response.response;
        }
      }
    }
  }

  override render() {
    return html`<slot></slot>`;
  }

  constructor() {
    super();
    this.addEventListener('qti-register-variable', (e: QtiRegisterVariable) => {
      this._context = { ...this._context, variables: [...this._context.variables, e.detail.variable] };
      this._initialContext = this._context;
      e.stopPropagation();
    });
    this.addEventListener('qti-register-feedback', (e: CustomEvent<QtiFeedback>) => {
      e.stopPropagation();
      const feedbackElement = e.detail;
      this._feedbackElements.push(feedbackElement);
      const numAttempts = Number(this._context.variables.find(v => v.identifier === 'numAttempts')?.value) || 0;
      if (numAttempts > 0) {
        feedbackElement.checkShowFeedback(feedbackElement.outcomeIdentifier);
      }
    });
    this.addEventListener(
      'qti-register-interaction',
      (e: CustomEvent<{ interaction: string; interactionElement: Interaction }>) => {
        e.stopPropagation();

        this._interactionElements.push(e.detail.interactionElement);
      }
    );
    this.addEventListener('end-attempt', (e: CustomEvent<{ responseIdentifier: string; countAttempt: boolean }>) => {
      const { responseIdentifier, countAttempt } = e.detail;
      this.validate();
      this.updateResponseVariable(responseIdentifier, 'true');
      this.processResponse(countAttempt);
    });

    this.addEventListener(
      // wordt aangeroepen vanuit de processingtemplate
      'qti-set-outcome-value',
      (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
        const { outcomeIdentifier, value } = e.detail;
        this.updateOutcomeVariable(outcomeIdentifier, value);
        e.stopPropagation();
      }
    );

    this.addEventListener('qti-interaction-response', this.handleUpdateResponseVariable);
  }

  /**
   * Toggles the display of correct responses for interactions.
   * @param show - A boolean indicating whether to show or hide correct responses.
   */
  public showCorrectResponse(show: boolean): void {
    // Process response variables with correct responses.
    const responses = this._context.variables
      .filter(
        (variable: ResponseVariable | OutcomeVariable) => 'correctResponse' in variable && variable.correctResponse
      )
      .map((variable: ResponseVariable) => ({
        responseIdentifier: variable.identifier,
        response: variable.correctResponse || ''
      }));

    // Update interactions with the correct responses or clear them.
    for (const { responseIdentifier, response } of responses) {
      const interaction = this._interactionElements.find(
        element => element.getAttribute('response-identifier') === responseIdentifier
      );

      if (interaction) {
        interaction.correctResponse = show ? response : '';
      }
    }
  }

  public processResponse(countNumAttempts: boolean = true): boolean {
    this.validate();
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

    if (countNumAttempts) {
      this.updateOutcomeVariable(
        'numAttempts',
        (+this._context.variables.find(v => v.identifier === 'numAttempts')?.value + 1).toString()
      );
    }

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
      response: Array.isArray(value) ? [...value] : value
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

  public validate(reportValidity = true): boolean | null {
    if (this._interactionElements.every(interactionElement => interactionElement.validate())) return true;
    if (this._interactionElements.some(interactionElement => interactionElement.validate())) return false;
    if (reportValidity) this.reportValidity();
    return null;
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
