import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-components';
import { provide } from '@lit-labs/context';
import { TestContext, testContext } from './qti-assessment-test.context';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  @provide({ context: testContext })
  @property({ attribute: false })
  public context: TestContext = {
    itemIndex: null, // <--- is null when no item is loaded
    items: []
  };

  private copyItemVariables(identifier: string): void {
    this.context = {
      ...this.context,
      items: this.context.items.map(itemContext => {
        return itemContext.identifier == identifier
          ? { ...itemContext, variables: this.getAssessmentItem(identifier).context.variables }
          : itemContext;
      })
    };
  }

  getAssessmentItem(identifier: string): QtiAssessmentItem {
    return this.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${identifier}"]`)
      .assessmentItem;
  }

  itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();

  private onItemRefRegistered(e: CustomEvent<{ href: string; identifier: string }>): void {
    this.itemRefEls.set(e.detail.identifier, e.target as QtiAssessmentItemRef);

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

  private onTestRequestItem(e: CustomEvent<number>): void {
    e.stopImmediatePropagation();
    if (e.detail === this.context.itemIndex) return; // same item
    // this.context.items[this.context.itemIndex]?.itemEl.processResponse();

    // this.context = { ...this.context, itemIndex: e.detail };
    this.context = { ...this.context, itemIndex: null };

    this._requestItem(this.context.items[e.detail].identifier);
  }

  firstUpdated(a): void {
    super.firstUpdated(a);
    this._requestItem(this.context.items[0].identifier);
  }

  constructor() {
    super();
    this.addEventListener('register-item-ref', this.onItemRefRegistered);
    this.addEventListener('on-test-request-item', this.onTestRequestItem);
    this.addEventListener('qti-item-connected', (e: any) => this.itemConnected(e.detail));
    this.addEventListener('qti-interaction-changed', e => this.copyItemVariables(e.detail.item));
    this.addEventListener('qti-outcome-changed', e => this.copyItemVariables(e.detail.item));
  }

  private itemConnected = (item: QtiAssessmentItem): void => {
    // this.context.items = this.context.items.map(itemContext => {
    //   return itemContext.identifier == item.identifier ? { ...itemContext, connected: true } : itemContext;
    // });

    // get the index of the current item
    const itemIndex = this.context.items.findIndex(itemContext => itemContext.identifier === item.identifier);

    this.context = { ...this.context, itemIndex };

    const itemContext = this.context.items.find(item => item.identifier === item?.identifier);
    // debugger;
    if (itemContext.variables.length === 1) {
      this.copyItemVariables(item.identifier);
    } else {
      item.variables = [...itemContext.variables];
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
