import { provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { itemContext, itemContextVariables } from '@qti-components/base';

import { dispatchPublic } from '../../public-events';

import type { PropertyValues } from 'lit';
import type { QtiTemplateProcessing } from '../qti-template-processing/qti-template-processing.js';
import type { InteractionChangedDetails, OutcomeEntry, SetOutcomesDetails } from '../../internal/event-types.ts';
import type { ResponseInteraction } from '@qti-components/base';
import type { RegisteredInteraction } from '@qti-components/base';
import type { VariableDeclaration, VariableValue } from '@qti-components/base';
import type { OutcomeVariable, ResponseVariable, TemplateVariable } from '@qti-components/base';
import type QtiRegisterVariable from '../../internal/events/qti-register-variable.ts';
import type { ItemContext } from '@qti-components/base';

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

/**
 * What the item needs of its response processing: start a run for an attempt. The result comes
 * back as an event.
 */
interface ResponseProcessor {
  processResponse(options: { numAttempts: number }): void;
}

export class QtiAssessmentItem extends LitElement {
  #itemTitle: string | undefined;
  #templateProcessing: QtiTemplateProcessing | null = null;

  @property({ type: String }) identifier: string = '';
  @property({ type: String }) adaptive: 'true' | 'false' = 'false';
  /*
   * `attribute` spelled out: Lit derives `timedependent` from the property
   * name, while QTI writes `time-dependent`. Without it the attribute never
   * reached the property, so an item declaring `time-dependent="true"` still
   * reported false to `test-navigation`, which reads this to build the computed
   * item context.
   */
  @property({ type: String, attribute: 'time-dependent' }) timeDependent: 'true' | 'false' | null = null;

  @property({ type: String })
  override get title(): string {
    return this.#itemTitle;
  }
  override set title(value: string) {
    this.#itemTitle = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }

  /**
   * Locks the item, for example once it is submitted. Published in the item context, which the
   * interactions inside follow, so the item keeps no list of them to set it on.
   */
  @property({ type: Boolean }) disabled: boolean;

  /**
   * Shows the item for reading only. Published in the item context, which the interactions inside
   * follow, so the item keeps no list of them to set it on.
   */
  @property({ type: Boolean }) readonly: boolean;

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    const readonlyChanged = changed.has('readonly') && (this.readonly ?? false) !== (this._context.readonly ?? false);
    const disabledChanged = changed.has('disabled') && (this.disabled ?? false) !== (this._context.disabled ?? false);
    if (readonlyChanged || disabledChanged) {
      this._context = {
        ...this._context,
        ...(readonlyChanged ? { readonly: !!this.readonly } : {}),
        ...(disabledChanged ? { disabled: !!this.disabled } : {})
      };
    }
  }

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

  /**
   * The item's whole context, declarations included, for reading. `variables` is the trimmed view
   * for hosts; the test needs the declarations too, and used to reach for the private field.
   */
  public get itemContext(): Readonly<ItemContext> {
    return this._context;
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
    const previous = this._context.variables;
    // Recognised by their declaration, or by their own type: a template declaration registers after
    // its first render, so a test restoring on connect can get here before it has.
    const restoredTemplates = value.filter(
      v =>
        v.value !== null &&
        v.value !== undefined &&
        (v.type === 'template' ||
          previous.some(declared => declared.identifier === v.identifier && declared.type === 'template'))
    );
    restoredTemplates.forEach(v =>
      this.#restoredTemplateValues.set(v.identifier, v.value as Readonly<string | string[]>)
    );
    const templatesChanged = restoredTemplates.some(
      v =>
        JSON.stringify(previous.find(declared => declared.identifier === v.identifier)?.value) !==
        JSON.stringify(v.value)
    );

    this._context = {
      ...this._context,
      variables: this._context.variables.map(variable => {
        const matchingValue = value.find(v => v.identifier === variable.identifier);
        if (matchingValue) {
          return {
            ...variable,
            ...matchingValue,
            interpolationTable: (variable as OutcomeVariable).interpolationTable,
            matchTable: (variable as OutcomeVariable).matchTable
          };
        }
        return variable;
      })
    };

    // Restored after the first processing run: correct responses still follow the values it drew.
    if (this.#templatesProcessed && templatesChanged) {
      this.#runTemplateProcessing();
    }

    // The interactions take the answers over from the context, some of them a moment from now, and
    // a different answer can mean a different verdict. Look once they have.
    void this.updateComplete.then(() => this.#revalidate());
    if (this.isConnected) this.#beginFirstAttempt();
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
  /**
   * Template values handed in through `variables` — drawn in an earlier visit or session. Template
   * processing keeps them instead of drawing again, so the candidate sees the question they
   * answered, and still runs, so correct responses are derived from them.
   */
  #restoredTemplateValues = new Map<string, Readonly<string | string[]>>();
  #templatesProcessed = false;
  /** Registered candidate-input interactions. Correction packages may extend their presentation behavior. */
  protected interactionElements: RegisteredInteraction[] = [];

  /** @deprecated use variables property instead */
  set responses(myResponses: ResponseInteraction[]) {
    if (myResponses) {
      for (const response of myResponses) {
        const responseVariable = this.getResponse(response.responseIdentifier);
        if (responseVariable) {
          this.updateResponseVariable(response.responseIdentifier, response.response);
        }

        const interaction: RegisteredInteraction | undefined = this.interactionElements.find(
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
      // The verdict goes in first, so whoever hears the item connect reads it with the rest.
      this.validate(false);
      this.#beginFirstAttempt();
      dispatchPublic(this, 'cito-item-rendered', this);
      // Internal plumbing: the test and the item container listen for this name.
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
    this.addEventListener('qti-register-interaction', this.#handleRegisterInteraction);
    this.addEventListener('end-attempt', this.#handleEndAttempt);
    this.addEventListener('cito-item-set-outcomes', this.#handleSetOutcomes);
    this.addEventListener('qti-set-template-value', this.#handleSetTemplateValue);
    this.addEventListener('qti-set-correct-response', this.#handleSetCorrectResponse);
    this.addEventListener('qti-interaction-response', this.#handleUpdateResponseVariable);
  }

  #removeEventListeners() {
    this.removeEventListener('qti-register-variable', this.#handleRegisterVariable);
    this.removeEventListener('qti-register-interaction', this.#handleRegisterInteraction);
    this.removeEventListener('end-attempt', this.#handleEndAttempt);
    this.removeEventListener('cito-item-set-outcomes', this.#handleSetOutcomes);
    this.removeEventListener('qti-set-template-value', this.#handleSetTemplateValue);
    this.removeEventListener('qti-set-correct-response', this.#handleSetCorrectResponse);
    this.removeEventListener('qti-interaction-response', this.#handleUpdateResponseVariable);
  }

  #handleRegisterVariable = (e: QtiRegisterVariable) => {
    e.stopImmediatePropagation();
    const { variable } = e.detail;
    const restored = variable.type === 'template' ? this.#restoredTemplateValues.get(variable.identifier) : undefined;
    const registered = restored !== undefined ? { ...variable, value: restored } : variable;
    this._context = { ...this._context, variables: [...this._context.variables, registered] };
    this.#initialContext = this._context;
    e.stopPropagation();
  };

  #handleRegisterInteraction = (e: CustomEvent<{ interaction: string; interactionElement: RegisteredInteraction }>) => {
    e.stopImmediatePropagation();
    this.interactionElements.push(e.detail.interactionElement);
  };

  #handleEndAttempt = (e: CustomEvent<{ responseIdentifier: string; countAttempt: boolean }>) => {
    e.stopImmediatePropagation();
    const { responseIdentifier, countAttempt } = e.detail;
    this.validate();
    this.updateResponseVariable(responseIdentifier, 'true');
    this.#processResponse(countAttempt, true, responseIdentifier);
  };

  /**
   * Applies the outcomes of a processing run, ours or a backend's, in one update, with the
   * interactions' validity.
   *
   * completionStatus is response processing's to set (QTI info model §2.2.2). When an attempt of a
   * non-adaptive item ends and processing left it `unknown`, the item marks it `completed`: the
   * attempt is done. TAO does the same, and the 1EdTech results-reporting reference results expect
   * it. An adaptive item is completed only by its own processing.
   */
  #handleSetOutcomes = (e: CustomEvent<SetOutcomesDetails>) => {
    e.stopImmediatePropagation();
    const { outcomes = [], responseProcessed = false } = e.detail ?? {};
    const completion: OutcomeEntry[] = [];
    if (responseProcessed && this.adaptive === 'false') {
      const sent = outcomes.find(o => o.identifier === 'completionStatus')?.value;
      if ((sent ?? this.getVariable('completionStatus')?.value) === 'unknown') {
        completion.push({ identifier: 'completionStatus', value: 'completed' });
      }
    }
    this.#applyOutcomes([...outcomes, ...completion], this.#checkValidity(false));

    if (responseProcessed) {
      // `responseProcessed` marks this as the end of an attempt (vs. a plain
      // selection, which fires the same event without the flag). Lets listeners
      // react only when an attempt actually ends.
      this.dispatchEvent(
        new CustomEvent<{ itemContext: ItemContext; responseProcessed: boolean }>('qti-item-context-updated', {
          bubbles: true,
          composed: true,
          detail: { itemContext: this._context, responseProcessed: true }
        })
      );
    }
  };

  #handleSetTemplateValue = (e: CustomEvent<{ templateIdentifier: string; value: string | string[] | null }>) => {
    e.stopImmediatePropagation();
    const { templateIdentifier, value } = e.detail;
    if (!this.#restoredTemplateValues.has(templateIdentifier)) {
      this.updateTemplateVariable(templateIdentifier, value ?? undefined);
    }
    e.stopPropagation();
  };

  #handleSetCorrectResponse = (e: CustomEvent<{ responseIdentifier: string; value: string | string[] | null }>) => {
    e.stopImmediatePropagation();
    const { responseIdentifier, value } = e.detail;
    this.updateCorrectResponse(responseIdentifier, value ?? undefined);
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

    // The interaction has updated its own validity by now; publish the verdict with the answer.
    this.validate(false);

    this.dispatchEvent(
      new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: { itemContext: this._context }
      })
    );
  };

  async #processTemplates(): Promise<void> {
    const templateDeclarations = Array.from(this.querySelectorAll<LitElement>('qti-template-declaration'));
    if (templateDeclarations.length > 0) {
      await Promise.all(templateDeclarations.map(declaration => declaration.updateComplete));
      await Promise.resolve();
    }

    this.#templateProcessing = this.querySelector<QtiTemplateProcessing>('qti-template-processing');
    this.#templatesProcessed = true;
    // Run template processing before first presentation
    this.#runTemplateProcessing();
  }

  #runTemplateProcessing(): void {
    if (!this.#templateProcessing) return;
    this.#templateProcessing.process();
    this.#initialContext = { ...this._context, variables: this._context.variables };
  }

  /**
   * Scores the attempt. The item does not score itself: its response processing does, like a
   * backend, and sends the outcomes back in `cito-item-set-outcomes`, which the item applies in one
   * update. The item keeps the attempt count (QTI info model §2.2.2: the delivery engine maintains
   * numAttempts) and hands the new count to the run, whose rules may read it. Without response
   * processing the item only counts the attempt. A run that throws still counts the attempt and applies
   * no outcomes.
   *
   * @returns whether the item has response processing.
   */
  public processResponse(countNumAttempts = true, reportValidityAfterScoring = true): boolean {
    return this.#processResponse(countNumAttempts, reportValidityAfterScoring);
  }

  #processResponse(countNumAttempts: boolean, reportValidity: boolean, endedBy?: string): boolean {
    this.#checkValidity(reportValidity);
    this.#resetOtherEndAttempts(endedBy);

    const numAttempts = +this.getVariable('numAttempts')?.value + (countNumAttempts ? 1 : 0);
    const processor = this.querySelector<HTMLElement & Partial<ResponseProcessor>>('qti-response-processing');
    if (typeof processor?.processResponse === 'function') {
      try {
        processor.processResponse({ numAttempts });
      } catch (error) {
        // The attempt started, so it counts (QTI info model §2.2.2), as in TAO and Amp-up; the
        // outcomes of a run that failed are not applied.
        this.#applyOutcomes([{ identifier: 'numAttempts', value: String(numAttempts) }]);
        throw error;
      }
      return true;
    }
    dispatchPublic(this, 'cito-item-set-outcomes', {
      outcomes: [{ identifier: 'numAttempts', value: String(numAttempts) }],
      responseProcessed: true
    });
    return false;
  }

  /**
   * QTI info model §2.4.5: when an attempt ends any other way than through an end-attempt
   * interaction, that interaction's response is `false`.
   */
  #resetOtherEndAttempts(endedBy: string | undefined): void {
    const others = Array.from(this.querySelectorAll('qti-end-attempt-interaction'), el =>
      el.getAttribute('response-identifier')
    ).filter(id => id && id !== endedBy);
    if (others.length === 0) return;
    this._context = {
      ...this._context,
      variables: this._context.variables.map(v => (others.includes(v.identifier) ? { ...v, value: 'false' } : v))
    };
  }

  public resetResponses() {
    this._context = this.#initialContext;
    if (this.isConnected) this.#beginFirstAttempt();
  }

  /**
   * QTI info model §2.2.2: completionStatus is `not_attempted` until the first attempt starts, then
   * `unknown`. The attempt starts when the candidate gets the item, so an item on screen is never
   * `not_attempted` — also not after a reset or a restore that says so.
   */
  #beginFirstAttempt(): void {
    if (this.getVariable('completionStatus')?.value !== 'not_attempted') return;
    this._context = {
      ...this._context,
      variables: this._context.variables.map(v =>
        v.identifier === 'completionStatus' ? { ...v, value: 'unknown' } : v
      )
    };
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

  /** Extension point for presentation packages reacting to a candidate response change. */
  protected afterResponseVariableUpdated(): void {}

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

    this.afterResponseVariableUpdated();

    dispatchPublic(this, 'cito-item-response-changed', {
      item: this.identifier,
      responseIdentifier: identifier,
      response: Array.isArray(value) ? [...value] : value
    });

    // A different answer can mean a different verdict.
    this.validate(false);
  }

  /**
   * Updates the template variable with the specified identifier to the given value.
   */
  public updateTemplateVariable(identifier: string, value: string | string[] | undefined) {
    const templateVariable = this._context.variables.find(v => v.identifier === identifier && v.type === 'template') as
      | TemplateVariable
      | undefined;

    if (!templateVariable) {
      console.warn(`Can not set qti-template-identifier: ${identifier}, it is not available`);
      return;
    }

    const normalizedValue =
      templateVariable.cardinality === 'single'
        ? Array.isArray(value)
          ? value[0]
          : (value ?? null)
        : value === undefined || value === null
          ? null
          : Array.isArray(value)
            ? value
            : [value];

    this._context = {
      ...this._context,
      variables: this._context.variables.map(v =>
        v.identifier !== identifier
          ? v
          : {
              ...v,
              value: normalizedValue
            }
      )
    };

    this.dispatchEvent(
      new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: { itemContext: this._context }
      })
    );
  }

  /**
   * Updates the correct response for the specified response variable.
   */
  public updateCorrectResponse(identifier: string, value: string | string[] | undefined) {
    const responseVariable = this.getResponse(identifier);

    if (!responseVariable) {
      console.warn(`Can not set correct response for identifier: ${identifier}, it is not available`);
      return;
    }

    const normalizedValue =
      responseVariable.cardinality === 'single'
        ? Array.isArray(value)
          ? value[0]
          : (value ?? null)
        : value === undefined || value === null
          ? null
          : Array.isArray(value)
            ? value
            : [value];

    this._context = {
      ...this._context,
      variables: this._context.variables.map(v =>
        v.identifier !== identifier
          ? v
          : {
              ...v,
              correctResponse: normalizedValue
            }
      )
    };

    this.dispatchEvent(
      new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
        bubbles: true,
        composed: true,
        detail: { itemContext: this._context }
      })
    );
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
    this.#applyOutcomes([{ identifier, value }]);
  }

  /**
   * Publishes the outcomes (and the validity) in one update, then one `cito-item-outcomes-changed`.
   * An identifier the item does not declare is skipped with a warning; a later entry for the same
   * identifier wins.
   */
  #applyOutcomes(outcomes: readonly OutcomeEntry[], valid?: boolean) {
    const values = new Map<string, OutcomeEntry['value']>();
    for (const { identifier, value } of outcomes) {
      const variable = this.getVariable(identifier);
      if (!variable) {
        console.warn(`Can not set qti-outcome-identifier: ${identifier}, it is not available`);
        continue;
      }
      values.set(identifier, variable.cardinality === 'single' ? value : Array.isArray(value) ? value : [value]);
    }
    const validChanged = valid !== undefined && valid !== this._context.valid;
    if (values.size === 0 && !validChanged) return;

    this._context = {
      ...this._context,
      ...(validChanged ? { valid } : {}),
      variables: this._context.variables.map(v =>
        values.has(v.identifier) ? { ...v, value: values.get(v.identifier) as string | string[] | null } : v
      )
    };

    if (values.size > 0) {
      dispatchPublic(this, 'cito-item-outcomes-changed', {
        item: this.identifier,
        outcomes: [...values].map(([identifier, value]) => ({ identifier, value }))
      });
    }
  }

  public validate(reportValidity = true): boolean {
    const isValid = this.#checkValidity(reportValidity);
    this.#publishValidity(isValid);
    return isValid;
  }

  #checkValidity(reportValidity: boolean): boolean {
    const isValid = this.interactionElements.every(interactionElement => interactionElement.validate());
    if (reportValidity) {
      this.reportValidity();
    }
    return isValid;
  }

  /** Puts the verdict in the item context, where the test and anything else can read it. */
  #publishValidity(valid: boolean): void {
    if (this._context.valid !== valid) {
      this._context = { ...this._context, valid };
    }
  }

  /**
   * Checks again after something the interactions' validity depends on changed without them saying
   * so (an answer handed in through `variables`), and tells the test if the verdict moved.
   */
  #revalidate(): void {
    const before = this._context.valid;
    this.validate(false);
    if (this._context.valid !== before) {
      this.dispatchEvent(
        new CustomEvent<{ itemContext: ItemContext }>('qti-item-context-updated', {
          bubbles: true,
          composed: true,
          detail: { itemContext: this._context }
        })
      );
    }
  }

  public reportValidity() {
    for (const interactionElement of this.interactionElements) {
      interactionElement.reportValidity();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-item': QtiAssessmentItem;
  }
}

declare module '../../public-events' {
  interface PublicItemEventMap {
    /** The item rendered: its interactions are in the DOM and its validity is known. */
    'cito-item-rendered': CustomEvent<QtiAssessmentItem>;
  }
}
