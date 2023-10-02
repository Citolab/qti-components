import { html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { QtiAssessmentItem, VariableDeclaration } from '../qti-components';
import { provide } from '@lit-labs/context';
import { TestContext, testContext } from './qti-assessment-test.context';

@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  private _activeAssessmentItemEl: QtiAssessmentItem | undefined;

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
        item.identifier === this._activeAssessmentItemEl?.identifier && item.identifier === identifier
          ? { ...this._activeAssessmentItemEl?.context }
          : item
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
    this.addEventListener('on-test-request-item', (e: CustomEvent<number>): void => {
      this.context = { ...this.context, itemIndex: e.detail };
    });
  }

  private _setItem = (item: QtiAssessmentItem) => {
    this._activeAssessmentItemEl = item;

    const itemContext = this.context.items.find(item => item.identifier === this._activeAssessmentItemEl?.identifier);
    if (itemContext.variables.find(v => v.identifier === 'completionStatus').value === 'unknown') {
      this._activeAssessmentItemEl.context = itemContext;
    }
  };

  render() {
    return html`
      <slot @item-connected=${({ detail }) => this._setItem(detail)} @context-changed=${this._contextChanged}> </slot>
    `;
  }
}