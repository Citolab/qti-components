import { provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { computedItemContext } from '@qti-components/base';
import { configContext } from '@qti-components/base';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { ConfigContext, CorrectResponseMode } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';
import type { VariableDeclaration } from '@qti-components/base';
import type { ComputedItemContext } from '@qti-components/base';

/**
 * `<qti-item>` is a custom element designed for rendering a single `qti-assessment-item`.
 * It can also host some functionalities to interact with the item like scoring, showing feedback, etc.
 * Placing a mandatory `<item-container>` inside '<qti-item>' will load or parse the item and render it.
 * See `<item-container>` for more details.
 *
 * ```html
 * <qti-item>
 *   <item-container class="m-4 bg-white" item-url="./path/to/item.xml"></item-container>
 * </qti-item>
 * ```
 */
@customElement('qti-item')
export class QtiItem extends LitElement {
  @state()
  @provide({ context: computedItemContext })
  public computedContext: ComputedItemContext;
  #qtiAssessmentItem?: QtiAssessmentItem;

  @state()
  @provide({ context: configContext })
  public configContext: ConfigContext = {};

  // Store event handlers as instance properties
  #onItemContextChanged = this.#handleItemContextChanged.bind(this);
  #onAssessmentItemConnected = this.#handleAssessmentItemConnected.bind(this);

  #onHandleShowCorrectResponse = this.#handleShowCorrectResponse.bind(this);
  #onHandleShowCandidateCorrection = this.#handleShowCandidateCorrection.bind(this);
  #onHandleSwitchCorrectResponseMode = this.#handleSwitchCorrectResponseMode.bind(this);

  constructor() {
    super();
    this.addEventListener('qti-item-context-updated', this.#onItemContextChanged);
    this.addEventListener('qti-assessment-item-connected', this.#onAssessmentItemConnected);
    this.addEventListener('item-show-correct-response', this.#onHandleShowCorrectResponse);
    this.addEventListener('item-show-candidate-correction', this.#onHandleShowCandidateCorrection);
    this.addEventListener('item-switch-correct-response-mode', this.#onHandleSwitchCorrectResponseMode);
  }

  #handleItemContextChanged(e: CustomEvent<{ itemContext: ItemContext }>) {
    this.#updateItemVariablesInTestContext(e.detail.itemContext.identifier, e.detail?.itemContext?.variables || []);
  }

  #handleAssessmentItemConnected(e: CustomEvent<QtiAssessmentItem>) {
    const fullVariables = (e.detail as any)._context.variables;
    this.#qtiAssessmentItem = e.detail;
    this.computedContext =
      this.computedContext?.identifier === this.#qtiAssessmentItem.identifier
        ? { ...this.computedContext, title: this.#qtiAssessmentItem.title }
        : ({
            identifier: this.#qtiAssessmentItem.identifier,
            title: this.#qtiAssessmentItem.title,
            adaptive: this.#qtiAssessmentItem.getAttribute('adaptive')?.toLowerCase() === 'true' || false,
            variables: fullVariables,
            correctResponseMode: 'internal'
          } as ComputedItemContext);
    this.#updateItemVariablesInTestContext(this.#qtiAssessmentItem.identifier, fullVariables || []);
  }

  #handleShowCorrectResponse(e: CustomEvent<boolean>) {
    if (this.#qtiAssessmentItem) {
      this.#qtiAssessmentItem.showCorrectResponse(e.detail);
    }
  }

  #handleShowCandidateCorrection(e: CustomEvent<boolean>) {
    if (this.#qtiAssessmentItem) {
      this.#qtiAssessmentItem.showCandidateCorrection(e.detail);
    }
  }

  #handleSwitchCorrectResponseMode(e: CustomEvent<CorrectResponseMode>) {
    // Switch off the correct response first
    this.#handleShowCorrectResponse(new CustomEvent('item-show-correct-response', { detail: false, bubbles: true }));

    this.configContext = {
      ...this.configContext,
      correctResponseMode: e.detail
    };
  }

  #updateItemVariablesInTestContext(
    identifier: string,
    variables: readonly VariableDeclaration<string | string[] | null>[]
  ): void {
    const rawscore = variables?.find(vr => vr.identifier == 'SCORE')?.value;
    const score = parseFloat(rawscore?.toString());
    const completionStatus = variables?.find(v => v.identifier === 'completionStatus')?.value;

    const correct = score !== undefined && !isNaN(score) && score > 0;
    const incorrect = score !== undefined && !isNaN(score) && score <= 0;
    const completed = completionStatus === 'completed';
    this.computedContext = {
      ...this.computedContext,
      identifier,
      correct,
      incorrect,
      completed,
      variables
    };
  }

  override render() {
    return html`<slot></slot>`;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-item-context-changed', this.#onItemContextChanged);
    this.removeEventListener('qti-assessment-item-connected', this.#onAssessmentItemConnected);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
