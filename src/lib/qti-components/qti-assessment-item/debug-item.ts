import { html, LitElement } from 'lit';

import { customElement, queryAssignedElements, queryAssignedNodes, state } from 'lit/decorators.js';
import { QtiAssessmentItem } from './qti-assessment-item';
import { register } from 'module';
import { VariableDeclaration } from '../qti-utilities/Variables';

@customElement('debug-item')
export class DebugItem extends LitElement {
  private _assessmentItemRef: QtiAssessmentItem | undefined;

  @state()
  private _items: Array<VariableDeclaration<string | string[]>> = [];

  private _registerItem = (item: QtiAssessmentItem) => {
    this._assessmentItemRef = item;
    this._assessmentItemRef.context;
  };

  private _contextChanged = () => {
    this._items = [...(this._assessmentItemRef?.context.variables ?? [])];
  };

  render() {
    return html`
      <pre>${JSON.stringify(this._items, null, 2)}</pre>

      <slot
        @item-connected=${({ detail }) => this._registerItem(detail)}
        @context-changed=${() => this._contextChanged()}
      >
      </slot>
    `;
  }
}

// @queryAssignedElements({ slot: 'list', flatten: true, selector: 'qti-assessment-item' })
// listItems!: Array<QtiAssessmentItem>;

// @slotchange=${(e: Event) => console.log('slotchange', e, this.listItems)}
