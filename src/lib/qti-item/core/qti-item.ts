import { provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { computedItemContext } from '../../exports/computed-item.context';

import type { QtiAssessmentItem } from '../../qti-components';
import type { ItemContext } from '../../exports/item.context';
import type { VariableDeclaration } from '../../exports/variables';
import type { ComputedItemContext , CorrectResponseMode } from '../../exports/computed-item.context';

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
  private _qtiAssessmentItem?: QtiAssessmentItem;

  // Store event handlers as instance properties
  private _onItemContextChanged = this._handleItemContextChanged.bind(this);
  private _onAssessmentItemConnected = this._handleAssessmentItemConnected.bind(this);
  private _onHandleShowCorrectResponse = this._handleShowCorrectResponse.bind(this);
  private _onHandleShowCandidateCorrection = this._handleShowCandidateCorrection.bind(this);
  private _onHandleSwitchCorrectResponseMode = this._handleSwitchCorrectResponseMode.bind(this);

  constructor() {
    super();
    this.addEventListener('qti-item-context-updated', this._onItemContextChanged);
    this.addEventListener('qti-assessment-item-connected', this._onAssessmentItemConnected);
    this.addEventListener('item-show-correct-response', this._onHandleShowCorrectResponse);
    this.addEventListener('item-show-candidate-correction', this._onHandleShowCandidateCorrection);
    this.addEventListener('item-switch-correct-response-mode', this._onHandleSwitchCorrectResponseMode);
  }

  private _handleItemContextChanged(e: CustomEvent<{ itemContext: ItemContext }>) {
    this._updateItemVariablesInTestContext(e.detail.itemContext.identifier, e.detail?.itemContext?.variables || []);
  }

  private _handleAssessmentItemConnected(e: CustomEvent<QtiAssessmentItem>) {
    const fullVariables = (e.detail as any)._context.variables;
    this._qtiAssessmentItem = e.detail;
    this.computedContext =
      this.computedContext?.identifier === this._qtiAssessmentItem.identifier
        ? { ...this.computedContext, title: this._qtiAssessmentItem.title }
        : ({
            identifier: this._qtiAssessmentItem.identifier,
            title: this._qtiAssessmentItem.title,
            adaptive: this._qtiAssessmentItem.getAttribute('adaptive')?.toLowerCase() === 'true' || false,
            variables: fullVariables,
            correctResponseMode: 'internal',
          } as ComputedItemContext);
    this._updateItemVariablesInTestContext(this._qtiAssessmentItem.identifier, fullVariables || []);
  }

  private _handleShowCorrectResponse(e: CustomEvent<boolean>) {
    if (this._qtiAssessmentItem) {
      this._qtiAssessmentItem.showCorrectResponse(e.detail);
    }
  }

  private _handleShowCandidateCorrection(e: CustomEvent<boolean>) {
    if (this._qtiAssessmentItem) {
      this._qtiAssessmentItem.showCandidateCorrection(e.detail);
    }
  }

  private _handleSwitchCorrectResponseMode(e: CustomEvent<CorrectResponseMode>) {
    // Switch off the correct response first
    this._handleShowCorrectResponse(new CustomEvent('item-show-correct-response', { detail: false, bubbles: true }));

    this.computedContext = {
      ...this.computedContext,
      correctResponseMode: e.detail
    };
  }

  private _updateItemVariablesInTestContext(
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

  render() {
    return html`<slot></slot>`;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('qti-item-context-changed', this._onItemContextChanged);
    this.removeEventListener('qti-assessment-item-connected', this._onAssessmentItemConnected);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
