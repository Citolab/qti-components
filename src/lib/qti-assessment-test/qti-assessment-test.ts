import { html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { QtiAssessmentItem, VariableDeclaration } from '../qti-components';
import { provide } from '@lit-labs/context';
import { TestContext, testContext } from './qti-assessment-test.context';

@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  private _assessmentItemEl: QtiAssessmentItem | undefined;

  @provide({ context: testContext })
  @property({ attribute: false })
  public context: TestContext = {
    itemIndex: 0,
    items: []
  };

  // // keep in sync with the assessment-item
  private _contextChanged = ({ detail: identifier }) => {
    this.context = {
      ...this.context,
      items: this.context.items.map(item =>
        item.identifier === this._assessmentItemEl?.identifier ? { ...this._assessmentItemEl?.context } : item
      )
    };
  };

  constructor() {
    super();
    this.addEventListener(
      'register-qti-assessment-item-ref',
      (e: CustomEvent<{ href: string; identifier: string }>) => {
        const { href, identifier } = e.detail;
        this.context.items = [
          ...this.context.items,
          {
            href,
            identifier,
            variables: [
              {
                identifier: 'completionStatus',
                cardinality: 'single',
                baseType: 'string',
                value: 'not_attempted',
                type: 'outcome'
              }
            ]
          }
        ];
      }
    );
    this.addEventListener('on-test-request-item', (e: CustomEvent<number>) => {
      this.context = { ...this.context, itemIndex: e.detail };
    });
  }

  private _setItem = (item: QtiAssessmentItem) => {
    this._assessmentItemEl = item;

    const itemContext = this.context.items.find(item => item.identifier === this._assessmentItemEl?.identifier);
    if (itemContext.variables.find(v => v.identifier === 'numAttempts')) {
      this._assessmentItemEl.context = itemContext;
    }
  };

  render() {
    return html`
      <slot @item-connected=${({ detail }) => this._setItem(detail)} @context-changed=${this._contextChanged}> </slot>
    `;
  }
}

// @state()
// private _savedResponses: ReadonlyArray<VariableDeclaration<string | string[]>> = [];

// save a copy of the response variables
// private _saveResponse = () => {
//   this._savedResponses = this._assessmentItemRef.context.variables;
// };

// load the copy of the response variables
// private _loadResponse = () => {
//   this._assessmentItemRef.context = { ...this._assessmentItemRef.context, variables: this._savedResponses };
// };

// <button @click=${this._saveResponse}>Save</button>
// <button @click=${this._loadResponse}>Load</button>
// <pre>${JSON.stringify(this.context, null, 2)}</pre>
// <pre>${JSON.stringify(this._savedResponses, null, 2)}</pre>
// @queryAssignedElements({ slot: 'list', flatten: true, selector: 'qti-assessment-item' })
// listItems!: Array<QtiAssessmentItem>;

// @slotchange=${(e: Event) => console.log('slotchange', e, this.listItems)}
