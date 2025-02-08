import { provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { computedItemContext } from '../../exports/computed-item.context';

import type { QtiAssessmentItem } from '../../qti-components';
import type { ItemContext } from '../../exports/item.context';
import type { ResponseVariable, VariableDeclaration } from '../../exports/variables';
import type { ComputedItemContext } from '../../exports/computed-item.context';

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
  private _onHandleTestShowCorrectResponse = this._handleTestShowCorrectResponse.bind(this);
  constructor() {
    super();
    this.addEventListener('qti-item-context-changed', this._onItemContextChanged);
    this.addEventListener('qti-assessment-item-connected', this._onAssessmentItemConnected);
    this.addEventListener('item-show-correct-response', this._onHandleTestShowCorrectResponse.bind(this));
  }

  private _handleItemContextChanged(e: CustomEvent<{ itemContext: ItemContext }>) {
    this._updateItemVariablesInTestContext(e.detail.itemContext.identifier, e.detail?.itemContext?.variables || []);
  }

  private _handleAssessmentItemConnected(e: CustomEvent<QtiAssessmentItem>) {
    this._qtiAssessmentItem = e.detail;
    this.computedContext =
      this.computedContext?.identifier === e.detail.identifier
        ? { ...this.computedContext, title: e.detail.title }
        : {
            identifier: e.detail.identifier,
            title: e.detail.title
          };
    this._updateItemVariablesInTestContext(e.detail.identifier, e.detail.variables || []);
  }

  private _handleTestShowCorrectResponse(e: CustomEvent<boolean>) {
    if (this._qtiAssessmentItem) {
      this._qtiAssessmentItem.showCorrectResponse(e.detail);
    }
  }

  private _updateItemVariablesInTestContext(
    identifier: string,
    variables: readonly VariableDeclaration<string | string[] | null>[]
  ): void {
    const rawscore = variables?.find(vr => vr.identifier == 'SCORE')?.value;
    const score = parseInt(rawscore?.toString());
    const completionStatus = variables?.find(v => v.identifier === 'completionStatus')?.value;

    const correct = score !== undefined && !isNaN(score) && score > 0;
    const incorrect = score !== undefined && !isNaN(score) && score <= 0;
    const completed = completionStatus === 'completed';
    // || item.category === this.host._configContext?.infoItemCategory || false
    const responseVariables: ResponseVariable[] = variables?.filter(v => {
      if (v.type !== 'response') {
        return false;
      }
      if (v.identifier.toLowerCase().startsWith('response')) {
        return true;
      }
      if ((v as ResponseVariable).correctResponse) {
        return true;
      }
    });

    // sort the response variables by the order of the string: identifier
    const sortedResponseVariables = responseVariables?.sort((a, b) => a.identifier.localeCompare(b.identifier));
    const response =
      sortedResponseVariables.length === 0
        ? ''
        : sortedResponseVariables
            ?.map(v => {
              if (Array.isArray(v.value)) {
                return v.value.join('&');
              }
              return v.value;
            })
            .join('#');
    const correctResponseArray = sortedResponseVariables.map(r => {
      if (r.mapping && r.mapping.mapEntries.length > 0) {
        return r.mapping.mapEntries
          .map(m => {
            return `${m.mapKey}=${m.mappedValue}pt `;
          })
          .join('&');
      }
      if (r.areaMapping && r.areaMapping.areaMapEntries.length > 0) {
        return r.areaMapping.areaMapEntries.map(m => {
          return `${m.coords} ${m.shape}=${m.mappedValue}`;
        });
      }
      if (r.correctResponse) {
        return Array.isArray(r.correctResponse) ? r.correctResponse.join('&') : r.correctResponse;
      }
      return [];
    });

    const correctResponse = correctResponseArray.join('&');
    this.computedContext = {
      ...this.computedContext,
      identifier,
      correct,
      incorrect,
      completed,
      correctResponse: correctResponse ? correctResponse : this.computedContext?.correctResponse || '',
      value: response
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
