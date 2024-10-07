import { provide } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-components';
import type { SessionContext } from './context/session.context';
import { sessionContext } from './context/session.context';
import { testContext, TestContext } from './context/test.context';
import { QtiAssessmentItemRef } from './qti-assessment-test/qti-assessment-item-ref';
import { ChangeViewMixin } from './qti-test.view.mixin';

const initialContextValue = {
  items: [],
  testOutcomeVariables: []
};

@customElement('qti-test')
export class QtiTest extends ChangeViewMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
    }
  `;
  public itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();

  @state()
  @provide({ context: sessionContext })
  private _sessionContext: SessionContext = { identifier: null, view: 'candidate' };

  @state()
  @provide({ context: testContext })
  private _testContext: TestContext = initialContextValue;

  // @property({ type: String, reflect: true, attribute: 'item-identifier' })
  // set itemIdentifier(identifier: string) {
  //   if (this._sessionContext.identifier !== identifier) {
  //     this._sessionContext = { ...this._sessionContext, identifier };

  //     if (this.itemRefEls.has(identifier)) {
  //       // A. if the related item-ref is already registered, then we can request the item
  //       this._sessionContext.identifier && this._requestItem(this._sessionContext.identifier);
  //       return;
  //     }
  //   }
  // }

  private _itemChangedHandler() {}

  // get context(): TestContext {
  //   return this._testContext;
  // }

  // /* restores the context by updating existing items and adding new items from the "contextToRestore" parameter into the "this._context.items" array. */
  // set context(contextToRestore: TestContext) {
  //   if (!contextToRestore) {
  //     contextToRestore = initialContextValue;
  //   }
  //   // append the items that are not yet in the context and replace the ones that are
  //   contextToRestore.items?.forEach(itemContext => {
  //     const existingItemContext = this._testContext.items.find(i => i.identifier === itemContext.identifier);
  //     if (existingItemContext) {
  //       existingItemContext.variables = itemContext.variables;
  //     } else {
  //       this._testContext.items.push(itemContext);
  //     }
  //   });
  // }

  // ------------------------ getter and setter session ------------------------

  // public updateOutcomeVariable(identifier: string, value: string | string[] | undefined) {
  //   const outcomeVariable = this.getOutcome(identifier);
  //   if (!outcomeVariable) {
  //     console.warn(`Can not set qti-outcome-identifier: ${identifier}, it is not available`);
  //     return;
  //   }
  //   this._testContext = {
  //     ...this._testContext,
  //     testOutcomeVariables: this._testContext.testOutcomeVariables.map(v => {
  //       if (v.identifier !== identifier) {
  //         return v;
  //       }
  //       return {
  //         ...v,
  //         value: outcomeVariable.cardinality === 'single' ? value : [...v.value, value as string]
  //       };
  //     })
  //   };
  // }

  // public getOutcome(identifier: string): Readonly<OutcomeVariable> {
  //   return this.getVariable(identifier) as OutcomeVariable;
  // }
  // public getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>> {
  //   return this._testContext.testOutcomeVariables.find(v => v.identifier === identifier) || null;
  // }

  // only copies the variables from the item, back into the testcontext to retain state
  private mergeItemVariables(identifier: string): void {
    const assessmentItem = this.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${identifier}"]`
    ).assessmentItem;
    this._testContext = {
      ...this._testContext,
      items: this._testContext.items.map(itemContext => {
        if (itemContext.identifier !== identifier) return itemContext;

        return {
          ...itemContext,
          variables: assessmentItem.variables.map(variable => {
            const matchingValue = itemContext.variables.find(v => v.identifier === variable.identifier);
            return matchingValue ? { ...matchingValue, ...variable } : variable;
          })
        };
      })
    };
  }

  // outcomeProcessing(): boolean {
  //   const outcomeProcessor = this.querySelector('qti-outcome-processing') as unknown as QtiOutcomeProcessing;
  //   if (!outcomeProcessor) return false;
  //   outcomeProcessor?.process();
  //   return true;
  // }
  /*
   * this code adds a new item to the items array in the _context object,
   * if no item with a matching identifier already exists.
   * If a matching item is found, the code does not modify the items array.
   */

  private _onAssessmentItemConnected = (item: QtiAssessmentItem): void => {
    const itemContext = this._testContext.items.find(i => i?.identifier === item?.identifier);
    // if it is still empty, then copy the variables from the item

    if (!itemContext) {
      console.warn(`item-ids between assessment.xml and item.xml should match: ${item?.identifier} is not found!`);
      return;
    }

    if (itemContext.variables?.length === 1) {
      this.mergeItemVariables(item.identifier);
    } else {
      // if it is not empty, then the item variables with the testcontext variables
      item.variables = [...itemContext.variables];
    }
  };

  private _onItemConnected(
    e: CustomEvent<{ href: string; identifier: string }> & { target: QtiAssessmentItemRef }
  ): void {
    const { href, identifier } = e.detail;
    this.itemRefEls.set(e.detail.identifier, e.target);

    if (e.detail.identifier === this._sessionContext.identifier) {
      // B. if the item-identifer is already set, and we register the related item-ref, then we can request the item
      if (this._sessionContext.identifier) {
        this._requestItem(this._sessionContext.identifier);
      }
    }
    if (this._sessionContext.identifier === null && this._testContext.items.length === 0) {
      this._sessionContext = { ...this._sessionContext, identifier: e.detail.identifier };
      this._requestItem(this._sessionContext.identifier);
    }

    this._testContext = {
      ...this._testContext,
      items: this._testContext.items.find(item => item.identifier === identifier)
        ? [...this._testContext.items]
        : [
            ...this._testContext.items,
            {
              href,
              identifier,
              variables: [
                {
                  identifier: 'completionStatus',
                  value: 'not_attempted',
                  type: 'outcome'
                }
              ],
              category: e.target.category
            }
          ]
    };
  }

  get itemIdentifier(): string {
    return this._sessionContext.identifier;
  }

  // private contextChangedEvent(e) {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   e.stopImmediatePropagation();
  //   this.dispatchEvent(
  //     new CustomEvent<TestContext>('qti-context-changed', {
  //       bubbles: true,
  //       composed: true,
  //       detail: this.context
  //     })
  //   );
  // }

  constructor() {
    super();
    this.addEventListener(
      'qti-item-connected',
      (e: CustomEvent<{ href: string; identifier: string }> & { target: QtiAssessmentItemRef }) =>
        this._onItemConnected(e)
    );
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
      this._onAssessmentItemConnected(e.detail);
    });
    this.addEventListener('qti-interaction-changed', e => this.mergeItemVariables(e.detail.item));
    this.addEventListener('qti-outcome-changed', e => {
      this.mergeItemVariables(e.detail.item);
      e.stopPropagation();
    });
    this.addEventListener('qti-register-variable', e => {
      this._testContext = {
        ...this._testContext,
        testOutcomeVariables: [...this._testContext.testOutcomeVariables, e.detail.variable]
      };
      e.stopPropagation();
    });
    // wordt aangeroepen vanuit de processingtemplate
    // this.addEventListener(
    //   'qti-set-outcome-value',
    //   (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
    //     const { outcomeIdentifier, value } = e.detail;
    //     this.updateOutcomeVariable(outcomeIdentifier, value);
    //     e.stopPropagation();
    //   }
    // );

    this.addEventListener('qti-test-set-item', (e: CustomEvent) => {
      this._sessionContext = { ...this._sessionContext, identifier: e.detail };
    });
    // this.addEventListener('qti-outcome-changed', this.contextChangedEvent);
    // this.addEventListener('qti-interaction-changed', this.contextChangedEvent);
    this.addEventListener('qti-assessment-item-connected', e => {});
    // this.addEventListener(
    //   'qti-assessment-test-connected',
    //   e => (this.assessmentTestEl = e.target as QtiAssessmentTest)
    // );
  }

  private _requestItem(identifier?: string, oldIdentifier?: string): void {
    this.dispatchEvent(
      new CustomEvent<string>('qti-test-set-item', {
        bubbles: true,
        composed: true,
        detail: identifier
      })
    );
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test': QtiTest;
  }
}
