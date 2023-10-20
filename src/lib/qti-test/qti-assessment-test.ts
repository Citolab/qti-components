import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-components';
import { provide } from '@lit/context';
import { TestContext, testContext } from './qti-assessment-test.context';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  @provide({ context: testContext })
  @property({ attribute: false })
  public context: TestContext = {
    itemIndex: null, // <--- is null when no item is loaded, can be used to show a loader icon
    items: []
  };

  itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();

  // only copies the variables from the item, back into the testcontext to retain state
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

    // PK: this is where the magic should happen
    // can or can we not navigate to the next item?
    // if we can navigate to the next item, then should we?

    // - processResponse?, not for now, it will give feedback when we don't want to
    // this.context.items[this.context.itemIndex]?.itemEl.processResponse();

    const truthy = true;
    if (!truthy) {
      // - set the index to id we want it to be
      this.context = { ...this.context, itemIndex: e.detail };
    } else {
      // - set the index to null, meaning we finished this item and testContext will be triggered
      this.context = { ...this.context, itemIndex: null };
      this._requestItem(this.context.items[e.detail].identifier);
    }

    // - request a new item to the outer realm!
  }

  firstUpdated(a): void {
    super.firstUpdated(a);
    if (this.context.items.length === 0) return;
    this._requestItem(this.context.items[0].identifier);
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('context')) {
      const oldIndex = changedProperties.get('context')?.itemIndex;
      if (this.context.itemIndex !== null && oldIndex !== this.context.itemIndex) {
        this._requestItem(this.context.items[this.context.itemIndex].identifier);
      }
    }
  }

  constructor() {
    super();
    this.addEventListener('register-item-ref', this.onItemRefRegistered);
    this.addEventListener('on-test-request-item', this.onTestRequestItem);
    this.addEventListener('qti-item-connected', (e: CustomEvent<QtiAssessmentItem>) => this.itemConnected(e.detail));
    this.addEventListener('qti-interaction-changed', e => this.copyItemVariables(e.detail.item));
    this.addEventListener('qti-outcome-changed', e => this.copyItemVariables(e.detail.item));
  }

  private itemConnected = (item: QtiAssessmentItem): void => {
    // Ah, the new item has entered the inner realm, let's connect it to the context
    // get the index of the current item
    // debugger;
    const itemIndex = this.context.items.findIndex(itemContext => itemContext.identifier === item.identifier);

    // set the index of the current item, triggering the context ( set disabled or not )
    this.context = { ...this.context, itemIndex };

    // get the testcontext of this item
    const itemContext = this.context.items.find(i => i?.identifier === item?.identifier);
    // if it is still empty, then copy the variables from the item
    if (itemContext.variables.length === 1) {
      this.copyItemVariables(item.identifier);
    } else {
      // if it is not empty, then the item variables with the testcontext variables
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
