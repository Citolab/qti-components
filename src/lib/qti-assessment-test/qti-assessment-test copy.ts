import { html, LitElement } from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import { QtiAssessmentItem, QtiRegisterVariable, VariableDeclaration } from '../qti-components';
import { provide } from '@lit-labs/context';
import { TestContext, testContext } from './qti-assessment-test.context';
import { ItemContext } from '../qti-components/qti-assessment-item/qti-assessment-item.context';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';
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
  // private _contextChanged = ({ detail: context }: { detail: ItemContext }) => {
  //   this.context = {
  //     ...this.context,
  //     items: this.context.items.map(itemContext => {
  //       console.log(itemContext.identifier, context);
  //       return itemContext.identifier === context.identifier ? { ...context } : itemContext;
  //     })
  //   };
  // };

  // // keep in sync with the assessment-item
  private _contextChanged = ({ detail: identifier }) => {
    this.context = {
      ...this.context,
      items: this.context.items.map(item =>
        item.identifier === this._activeAssessmentItemEl?.identifier
          ? { ...this._activeAssessmentItemEl?.context }
          : item
      )
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
          },
          {
            identifier: 'numAttempts',
            cardinality: 'single',
            baseType: 'integer',
            value: '0',
            type: 'response'
          }
        ]
      }
    ];
  }

  private _onTestRequestItem(e: CustomEvent<number>): void {
    e.stopImmediatePropagation();

    if (e.detail === this.context.itemIndex) return; // same item

    console.log('test: start processResponse');
    this._activeAssessmentItemEl?.processResponse();

    console.log('test: start updateItemIndex');
    this.context = { ...this.context, itemIndex: e.detail };

    console.log('test: start _activeAssessmentItemEl = null');
    this._activeAssessmentItemEl = null;

    console.log('test: start dispatch test-set-index');

    this.dispatchEvent(
      new CustomEvent<number>('on-test-set-index', {
        bubbles: true,
        composed: true,
        detail: e.detail
      })
    );
  }

  constructor() {
    super();
    this.addEventListener('register-qti-assessment-item-ref', this._onItemRefRegistered);
    // this.addEventListener('item-connected', (e: any) => this._itemConnectedHandler(e.detail));
    this.addEventListener('on-test-request-item', this._onTestRequestItem);
    this.addEventListener('qti-register-variable', (e: any) => this._qtiRegisterVariable(e));
    this.addEventListener('qti-interaction-changed', (e: any) => this._contextChanged(e.detail.item));
    this.addEventListener('qti-outcome-changed', (e: any) => this._contextChanged(e.detail.item));
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

  private _qtiRegisterVariable(e: CustomEvent<VariableDeclaration<string | string[] | null>>) {
    console.log(e.target, e.currentTarget);
    // find the item in the context
    const itemContext = this.context.items.find(
      item => item.identifier === (e.target as QtiAssessmentItemRef).identifier
    );
    console.log('itemContext', itemContext);

    // // check in the context if exactly this variable is already registered in testcontext
    // const varExists = this.context.items
    //   .find(item => item.identifier === (e.target as QtiAssessmentItem).identifier)
    //   ?.variables.find(variable => variable.identifier === e.detail.identifier);
    // console.log('varExists', varExists);
    // if (varExists) return;

    // // else register the variable, in an immutable way
    // this.context = {
    //   ...this.context,
    //   items: this.context.items.map(item =>
    //     item.identifier === (e.target as QtiAssessmentItem).identifier
    //       ? {
    //           ...item,
    //           variables: [...item.variables, e.detail]
    //         }
    //       : item
    //   )
    // };
  }

  // private _itemConnectedHandler = (item: QtiAssessmentItem) => {
  //   this._activeAssessmentItemEl = item;
  //   this._contextChanged({ detail: item.identifier });
  //   debugger;
  //   const itemContext = this.context.items.find(item => item.identifier === this._activeAssessmentItemEl?.identifier);
  //   if (itemContext.variables.find(v => v.identifier === 'completionStatus').value === 'unknown') {
  //     this._activeAssessmentItemEl.initcontext = itemContext;
  //   }
  // };

  render() {
    return html`
      <slot> </slot>
      <pre>${JSON.stringify(this.context, null, 2)}</pre>
    `;
  }
}

// 'qti-interaction-changed', {
//   item: this.identifier,
//   responseIdentifier: identifier,
//   response: value
// }
// 'qti-outcome-changed', {
//   item: this.identifier,
//   identifier,
//   value: this._context.variables.find(v => v.identifier === identifier)?.value
// }

//      <pre>${JSON.stringify(this.context, null, 2)}</pre>

// @register-qti-assessment-item-ref=${this._itemRef}
// @on-test-request-item=${this._requestItem}
