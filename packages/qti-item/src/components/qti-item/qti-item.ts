import { provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';

import { computedItemContext } from '@qti-components/base';
import { configContext } from '@qti-components/base';
import { qtiContext } from '@qti-components/base';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { ConfigContext } from '@qti-components/base';
import type { QtiContext } from '@qti-components/base';
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

export class QtiItem extends LitElement {
  @state()
  @provide({ context: computedItemContext })
  public computedContext: ComputedItemContext;
  protected assessmentItem?: QtiAssessmentItem;

  @state()
  @provide({ context: configContext })
  public configContext: ConfigContext = {};

  /**
   * Provided so that descendants (e.g. `<item-container>`) can read the QTI runtime
   * context for standalone item delivery, including the optional shuffle `seed`.
   */
  @state()
  @provide({ context: qtiContext })
  public qtiContext: QtiContext = {
    QTI_CONTEXT: {
      testIdentifier: '',
      candidateIdentifier: '',
      environmentIdentifier: 'default'
    }
  };

  // Store event handlers as instance properties
  #onItemContextChanged = this.#handleItemContextChanged.bind(this);
  #onAssessmentItemConnected = this.#handleAssessmentItemConnected.bind(this);

  constructor() {
    super();
    this.addEventListener('qti-item-context-updated', this.#onItemContextChanged);
    this.addEventListener('qti-assessment-item-connected', this.#onAssessmentItemConnected);
  }

  #handleItemContextChanged(e: CustomEvent<{ itemContext: ItemContext }>) {
    this.#updateItemVariablesInTestContext(e.detail.itemContext.identifier, e.detail?.itemContext?.variables || []);
  }

  #handleAssessmentItemConnected(e: CustomEvent<QtiAssessmentItem>) {
    const fullVariables = (e.detail as any)._context.variables;
    this.assessmentItem = e.detail;
    this.computedContext =
      this.computedContext?.identifier === this.assessmentItem.identifier
        ? { ...this.computedContext, title: this.assessmentItem.title }
        : ({
            identifier: this.assessmentItem.identifier,
            title: this.assessmentItem.title,
            adaptive: this.assessmentItem.getAttribute('adaptive')?.toLowerCase() === 'true' || false,
            variables: fullVariables
          } as ComputedItemContext);
    this.#updateItemVariablesInTestContext(this.assessmentItem.identifier, fullVariables || []);
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
