import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-components';
import { provide } from '@lit/context';
import { TestContext, testContext } from './qti-assessment-test.context';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  @property({ type: String }) identifier: string;

  @provide({ context: testContext })
  @property({ attribute: false })
  private _context: TestContext = {
    itemIndex: 0,
    items: []
  };
  public get context(): TestContext {
    return this._context;
  }
  public set context(value: TestContext) {
    this._context = value;
  }

  public itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();

  // only copies the variables from the item, back into the testcontext to retain state
  private copyItemVariables(identifier: string): void {
    this._context = {
      ...this._context,
      items: this._context.items.map(itemContext => {
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
    this._context.items = [
      ...this._context.items,
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
    if (e.detail === this._context.itemIndex) return; // same item
    this._context = { ...this._context, itemIndex: e.detail };
  }

  firstUpdated(a): void {
    super.firstUpdated(a);
    if (this._context.items.length === 0) {
      console.warn('No items found in the test, please add at least one item');
      return;
    }
    this._emit<{ detail: QtiAssessmentItem }>('qti-assessment-first-updated', this);
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('_context')) {
      const oldIndex = changedProperties.get('_context')?.itemIndex;
      if (this._context.itemIndex !== null && oldIndex !== this._context.itemIndex) {
        this._requestItem(
          this._context.items[this._context.itemIndex].identifier,
          this._context.items[oldIndex]?.identifier
        );
      }
    }
  }

  constructor() {
    super();
    this.addEventListener('register-item-ref', this.onItemRefRegistered);
    this.addEventListener('on-test-request-item', this.onTestRequestItem);
    this.addEventListener('qti-item-first-updated', (e: CustomEvent<QtiAssessmentItem>) =>
      this.itemConnected(e.detail)
    );
    this.addEventListener('qti-interaction-changed', e => this.copyItemVariables(e.detail.item));
    this.addEventListener('qti-outcome-changed', e => this.copyItemVariables(e.detail.item));
  }

  private itemConnected = (item: QtiAssessmentItem): void => {
    const itemContext = this._context.items.find(i => i?.identifier === item?.identifier);
    // if it is still empty, then copy the variables from the item
    if (itemContext.variables.length === 1) {
      this.copyItemVariables(item.identifier);
    } else {
      // if it is not empty, then the item variables with the testcontext variables
      item.variables = [...itemContext.variables];
    }
  };

  private _requestItem(identifier?: string, oldIdentifier?: string): void {
    this.dispatchEvent(
      new CustomEvent<
        | {
            old: string | undefined;
            new?: string;
          }
        | undefined
      >('on-test-set-item', {
        bubbles: true,
        composed: true,
        detail: {
          old: oldIdentifier,
          new: identifier
        }
      })
    );
  }

  private _emit<T>(name, detail = null) {
    this.dispatchEvent(
      new CustomEvent<T>(name, {
        bubbles: true,
        composed: true,
        detail
      })
    );
  }

  render() {
    return html`<slot></slot>`;
  }
}
