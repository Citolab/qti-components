import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-components';
import { provide } from '@lit/context';
import { TestContext, testContext } from './qti-assessment-test.context';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';
import { SignalWatcher, signal, Signal, effect } from '@lit-labs/preact-signals';
import { AudienceContext } from '../context';
@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  @property({ type: String, reflect: true }) audienceContext:
    | 'author'
    | 'candidate'
    | 'proctor'
    | 'scorer'
    | 'testConstructor'
    | 'tutor';
  @property({ type: String, reflect: true }) itemIndex: string;

  private _initialValue: TestContext = {
    itemIndex: 0,
    audienceContext: 'candidate',
    items: []
  };
  @property({ type: String }) identifier: string;

  public signalContext = signal(this._initialValue);

  @provide({ context: testContext })
  @property({ attribute: false })
  private _context: TestContext; // = this._initialValue;

  public set context(value: TestContext) {
    console.log('set context', value);
    this.signalContext.value = value;
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('_context')) {
      const oldIndex = changedProperties.get('_context')?.itemIndex;
      if (
        this.signalContext.value.items.length > 0 &&
        this.signalContext.value.itemIndex !== null &&
        oldIndex !== this.signalContext.value.itemIndex
      ) {
        this._requestItem(
          this.signalContext.value.items[this.signalContext.value.itemIndex].identifier,
          this.signalContext.value.items[oldIndex]?.identifier
        );
      }
    }
    if (changedProperties.has('audienceContext')) {
      this.itemRefEls.forEach((value, key) => (value.audienceContext = { view: this.audienceContext }));
      console.log('audienceContext', this.audienceContext);
    }
    if (changedProperties.has('itemIndex')) {
      console.log('itemIndex', this.itemIndex);
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

    // update the provider context
    effect(() => (this._context = this.signalContext.value));
  }

  public itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();

  // only copies the variables from the item, back into the testcontext to retain state
  private copyItemVariables(identifier: string): void {
    this.signalContext.value = {
      ...this.signalContext.value,
      items: this.signalContext.value.items.map(itemContext => {
        return itemContext.identifier == identifier
          ? { ...itemContext, variables: this.getAssessmentItem(identifier).context.variables }
          : itemContext;
      })
    };
  }

  restoreContext = (contextToRestore: TestContext) => {
    if (!contextToRestore) {
      contextToRestore = this._initialValue;
    }
    this.signalContext.value.itemIndex = contextToRestore.itemIndex;
    // append the items that are not yet in the context and replace the ones that are
    contextToRestore.items?.forEach(itemContext => {
      const existingItemContext = this.signalContext.value.items.find(i => i.identifier === itemContext.identifier);
      if (existingItemContext) {
        existingItemContext.variables = itemContext.variables;
      } else {
        this.signalContext.value.items.push(itemContext);
      }
    });
  };

  getAssessmentItem(identifier: string): QtiAssessmentItem {
    return this.querySelector<QtiAssessmentItemRef>(`qti-assessment-item-ref[identifier="${identifier}"]`)
      .assessmentItem;
  }

  get currentAssessmentItem(): QtiAssessmentItem {
    return this.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${
        this.signalContext.value.items[this.signalContext.value.itemIndex].identifier
      }"]`
    ).assessmentItem;
  }

  private onItemRefRegistered(e: CustomEvent<{ href: string; identifier: string }>): void {
    this.itemRefEls.set(e.detail.identifier, e.target as QtiAssessmentItemRef);

    const { href, identifier } = e.detail;
    this.signalContext.value.items = [
      ...this.signalContext.value.items,
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
    if (e.detail === this.signalContext.value.itemIndex) return; // same item
    this.signalContext.value = { ...this.signalContext.value, itemIndex: e.detail };
  }

  firstUpdated(a): void {
    super.firstUpdated(a);
    if (this.signalContext.value.items.length === 0) {
      console.warn('No items found in the test, please add at least one item');
      return;
    }
    this._emit<{ detail: QtiAssessmentItem }>('qti-assessment-first-updated', this);
  }

  private itemConnected = (item: QtiAssessmentItem): void => {
    const itemContext = this.signalContext.value.items.find(i => i?.identifier === item?.identifier);
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

// set context(value: TestContext) {
//   // if (!value) {
//   //   value = this._initialValue;
//   // }
//   // this.signalContext.value.items?.forEach(itemContext => {
//   //   if (!value.items) value.items = [];
//   //   if (!value.items.find(i => i.identifier === itemContext.identifier)) {
//   //     value.items.push(itemContext);
//   //   }
//   // });
//   // this.signalContext.value = value;
// }
// get context(): TestContext {
//   return this.signalContext.value;
// }
