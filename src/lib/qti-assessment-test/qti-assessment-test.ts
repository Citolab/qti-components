import { html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { QtiAssessmentItem, VariableDeclaration } from '../qti-components';
import { provide } from '@lit-labs/context';
import { TestContext, testContext } from './qti-assessment-test.context';
import { ItemContext } from '../qti-components/qti-assessment-item/qti-assessment-item.context';

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
  private _contextChanged = () => {
    this.context = {
      ...this.context,
      items: this.context.items.map(itemContext => {
        return itemContext.identifier == this._activeAssessmentItemEl.identifier
          ? { ...this._activeAssessmentItemEl.context }
          : itemContext;
      })
    };
  };

  private _onItemRefRegistered(e: CustomEvent<{ href: string; identifier: string }>) {
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

  private _onTestRequestItem(e: CustomEvent<number>): void {
    e.stopImmediatePropagation();
    if (e.detail === this.context.itemIndex) return; // same item
    this._activeAssessmentItemEl?.processResponse();
    this.context = { ...this.context, itemIndex: e.detail };
    // this._activeAssessmentItemEl = null;
    this.dispatchEvent(
      new CustomEvent<number>('on-test-set-index', {
        bubbles: true,
        composed: true,
        detail: e.detail
      })
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.dispatchEvent(
      new CustomEvent<number>('on-test-set-index', {
        bubbles: true,
        composed: true,
        detail: 0
      })
    );
  }

  constructor() {
    super();
    this.addEventListener('register-qti-assessment-item-ref', this._onItemRefRegistered);
    this.addEventListener('on-test-request-item', this._onTestRequestItem);
    this.addEventListener('item-connected', (e: any) => this._setItem(e.detail));
    this.addEventListener('qti-interaction-changed', e => this._contextChanged());
    this.addEventListener('qti-outcome-changed', e => this._contextChanged());
  }

  private _setItem = (item: QtiAssessmentItem) => {
    this._activeAssessmentItemEl = item;

    const itemContext = this.context.items.find(item => item.identifier === this._activeAssessmentItemEl?.identifier);
    if (itemContext.variables.find(v => v.identifier === 'completionStatus').value === 'not_attempted') {
      this.context = {
        ...this.context,
        items: this.context.items.map(itemContext => {
          return itemContext.identifier == item.identifier ? { ...item.context } : itemContext;
        })
      };
    } else {
      this._activeAssessmentItemEl.context = itemContext;
    }
  };

  render() {
    return html` <slot> </slot> `;
  }
}
