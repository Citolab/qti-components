import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-components';
import { provide } from '@lit-labs/context';
import { TestContext, testContext } from './qti-assessment-test.context';

@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  @provide({ context: testContext })
  @property({ attribute: false })
  public context: TestContext = {
    itemIndex: 0,
    items: []
  };

  private copyItemContext(identifier: string): void {
    this.context = {
      ...this.context,
      items: this.context.items.map(itemContext => {
        return itemContext.identifier == identifier
          ? { ...itemContext, ...this.context.items.find(item => item.identifier === identifier)?.itemEl.context }
          : itemContext;
      })
    };
  }

  private onItemRefRegistered(e: CustomEvent<{ href: string; identifier: string }>): void {
    const { href, identifier } = e.detail;
    this.context.items = [
      ...this.context.items,
      {
        href,
        identifier,
        itemEl: null,
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

  private onTestRequestItem(e: CustomEvent<number>): void {
    e.stopImmediatePropagation();
    if (e.detail === this.context.itemIndex) return; // same item
    this.context.items[this.context.itemIndex]?.itemEl.processResponse();
    this.context = { ...this.context, itemIndex: e.detail };
    this._requestItem(this.context.items[this.context.itemIndex].identifier);
  }

  firstUpdated(a): void {
    super.firstUpdated(a);
    this._requestItem(this.context.items[0].identifier);
  }

  constructor() {
    super();
    this.addEventListener('register-item-ref', this.onItemRefRegistered);
    this.addEventListener('on-test-request-item', this.onTestRequestItem);
    this.addEventListener('qti-item-connected', (e: any) => this.setItem(e.detail));
    this.addEventListener('qti-interaction-changed', e => this.copyItemContext(e.detail.item));
    this.addEventListener('qti-outcome-changed', e => this.copyItemContext(e.detail.item));
  }

  private setItem = (item: QtiAssessmentItem): void => {
    const el = (this.context.items[this.context.itemIndex].itemEl = item);

    const itemContext = this.context.items.find(item => item.identifier === el?.identifier);
    if (itemContext.variables.find(v => v.identifier === 'completionStatus').value === 'not_attempted') {
      this.copyItemContext(item.identifier);
    } else {
      el.variables = [...itemContext.variables];
    }
  };

  private _requestItem(identifier?: string): void {
    this.dispatchEvent(
      new CustomEvent<string>('on-test-set-item', {
        bubbles: true,
        composed: true,
        detail: identifier
      })
    );
  }

  render() {
    return html`<slot></slot>`;
  }
}
