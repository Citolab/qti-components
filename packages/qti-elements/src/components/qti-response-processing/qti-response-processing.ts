import { ContextConsumer, ContextProvider } from '@lit/context';
import { css, html, LitElement } from 'lit';

import { itemContext, QtiExitResponseSignal, type QtiRuleBase } from '@qti-components/base';

import { mapResponse, mapResponsePoint, matchCorrect } from '../../internal/template-strings';
import { dispatchPublic } from '../../public-events';

import type { ItemContext, OutcomeVariable } from '@qti-components/base';
import type { PropertyValueMap } from 'lit';

type OutcomeValue = string | string[] | null | undefined;

/** The response processing templates we substitute for, keyed by the file name in `template`. */
const responseProcessingTemplates: Record<string, string> = {
  map_response: mapResponse,
  map_response_point: mapResponsePoint,
  match_correct: matchCorrect
};

/**
 * Response processing as the item's own backend: it reads the item context, runs its rules once and
 * sends the outcomes and the attempt count back in one `cito-item-set-outcomes`. The item applies
 * them; a host that scores elsewhere sends the same event instead.
 */
export class QtiResponseProcessing extends LitElement {
  static override styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  /**
   * The rules inside read and write this element's copy of the item context, never the item's. It
   * is provided under the same `itemContext`: the nearest provider wins, so every expression in
   * here gets the copy without knowing about it.
   */
  #provider = new ContextProvider(this, { context: itemContext });
  #copy?: ItemContext;

  constructor() {
    super();
    new ContextConsumer(this, {
      context: itemContext,
      subscribe: true,
      // Every variable its own object, so a write changes the copy and not the item's context.
      callback: context => {
        this.#copy = { ...context, variables: context.variables.map(v => ({ ...v })) };
        this.#provider.setValue(this.#copy);
      }
    });
    // Every rule that sets an outcome sits in here: the write lands in the copy, so a later rule
    // reads it, and never reaches the item (or the test above it, whose outcome processing listens
    // for the same name).
    this.addEventListener(
      'qti-set-outcome-value',
      (e: CustomEvent<{ outcomeIdentifier: string; value: OutcomeValue }>) => {
        e.stopImmediatePropagation();
        const variable = this.#copy?.variables.find(v => v.identifier === e.detail.outcomeIdentifier);
        if (!variable) {
          console.warn(`Can not set qti-outcome-identifier: ${e.detail.outcomeIdentifier}, it is not available`);
          return;
        }
        const { value } = e.detail;
        variable.value = variable.cardinality === 'single' ? value : Array.isArray(value) ? value : [value];
      }
    );
  }

  override render() {
    return html`<slot></slot>`;
  }

  /**
   * Scores the attempt on the copy: sets `numAttempts` to the count the item hands over, resets a
   * non-adaptive item's outcomes to their defaults (QTI info model §2.5), runs the rules and sends
   * every outcome and `numAttempts` in one `cito-item-set-outcomes`. The item applies them and publishes, which gives this element a
   * fresh copy. A rule that throws ends the run and the error propagates; nothing is sent, and the
   * run's writes stay in the copy until the item's next update.
   */
  public processResponse({ numAttempts }: { numAttempts: number }): void {
    const copy = this.#copy;
    if (!copy) return;
    const reset = this.closest('qti-assessment-item')?.getAttribute('adaptive') !== 'true';
    for (const variable of copy.variables) {
      if (variable.identifier === 'numAttempts') variable.value = String(numAttempts);
      if (variable.type === 'outcome' && reset) variable.value = defaultValueOf(variable as OutcomeVariable);
    }

    this.#runRules();

    dispatchPublic(this, 'cito-item-set-outcomes', {
      outcomes: copy.variables
        .filter(v => v.type === 'outcome' || v.identifier === 'numAttempts')
        .map(({ identifier, value }) => ({ identifier, value })),
      responseProcessed: true
    });
  }

  #runRules() {
    const rules = [...this.children] as unknown as QtiRuleBase[];
    try {
      for (const rule of rules) {
        rule.process();
      }
    } catch (error) {
      // `qti-exit-response` ends the attempt's processing from wherever it
      // sits, however deeply nested. Reaching here is the rule doing its job,
      // so the run simply stops; anything else is a real failure and rethrows.
      if (!(error instanceof QtiExitResponseSignal)) throw error;
    }
  }

  public override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const template = this.getAttribute('template');
    if (!template) return;

    const templateName = template.split('/').pop()!.replace('.xml', '');
    const rules = responseProcessingTemplates[templateName];
    // Leave an unknown template's authored children alone; there is nothing to substitute.
    if (!rules) return;

    // Parsed through this element's own `innerHTML` rather than a fragment created off `document`:
    // the HTML fragment parsing algorithm takes its custom element registry from the context
    // element, so the rules are upgraded with the registry this element lives in. A fragment from
    // `document.createRange()` is parsed against the global registry, which leaves every rule an
    // unupgraded HTMLElement when the item was rendered into a scoped registry.
    this.innerHTML = rules;
  }
}

/** The declared default; a numeric outcome without one starts at 0. */
function defaultValueOf(variable: OutcomeVariable): OutcomeValue {
  const value = ('defaultValue' in variable ? variable.defaultValue : null) ?? null;
  if (value === null && (variable.baseType === 'integer' || variable.baseType === 'float')) return '0';
  return value;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-processing': QtiResponseProcessing;
  }
}
