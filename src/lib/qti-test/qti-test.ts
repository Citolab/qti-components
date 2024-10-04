import { provide } from '@lit/context';
import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { OutcomeVariable, QtiAssessmentItem, QtiOutcomeProcessing, VariableDeclaration } from '../qti-components';
import type { SessionContext, viewer } from './context/session.context';
import { sessionContext } from './context/session.context';
import { testContext, TestContext } from './context/test.context';
import { QtiAssessmentItemRef } from './qti-assessment-test/qti-assessment-item-ref';

const initialContextValue = {
  items: [],
  testOutcomeVariables: []
};

@customElement('qti-test')
export class QtiTest extends LitElement {
  @state()
  @provide({ context: sessionContext })
  private _sessionContext: SessionContext = { identifier: null, view: null };

  public itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();

  static styles = css`
    :host {
      display: block;
    }
  `;

  updated(changedProperties: PropertyValues<any>) {
    if (changedProperties.has('_sessionContext')) {
      console.log(this._sessionContext.view);
      this.itemRefEls.forEach(itemRefEl => {
        itemRefEl.view = this._sessionContext.view;
      });
      this.querySelectorAll('[view]')?.forEach((element: HTMLElement) => {
        element.getAttribute('view') === this._sessionContext.view
          ? element.classList.add('show')
          : element.classList.remove('show');
      });
    }
  }

  // this.renderRoot.querySelectorAll('[view]')?.forEach((element: HTMLElement) => {
  //   element.getAttribute('view') === this.view ? element.classList.add('show') : element.classList.remove('show');
  // });
  // this.assessmentItem?.showCorrectResponse(this.view === 'scorer');

  @provide({ context: testContext })
  private _testContext: TestContext = initialContextValue;

  get context(): TestContext {
    return this._testContext;
  }

  /* restores the context by updating existing items and adding new items from the "contextToRestore" parameter into the "this._context.items" array. */
  set context(contextToRestore: TestContext) {
    if (!contextToRestore) {
      contextToRestore = initialContextValue;
    }
    // append the items that are not yet in the context and replace the ones that are
    contextToRestore.items?.forEach(itemContext => {
      const existingItemContext = this._testContext.items.find(i => i.identifier === itemContext.identifier);
      if (existingItemContext) {
        existingItemContext.variables = itemContext.variables;
      } else {
        this._testContext.items.push(itemContext);
      }
    });
  }

  // ------------------------ getter and setter session ------------------------

  public updateOutcomeVariable(identifier: string, value: string | string[] | undefined) {
    const outcomeVariable = this.getOutcome(identifier);
    if (!outcomeVariable) {
      console.warn(`Can not set qti-outcome-identifier: ${identifier}, it is not available`);
      return;
    }
    this._testContext = {
      ...this._testContext,
      testOutcomeVariables: this._testContext.testOutcomeVariables.map(v => {
        if (v.identifier !== identifier) {
          return v;
        }
        return {
          ...v,
          value: outcomeVariable.cardinality === 'single' ? value : [...v.value, value as string]
        };
      })
    };
  }

  public getOutcome(identifier: string): Readonly<OutcomeVariable> {
    return this.getVariable(identifier) as OutcomeVariable;
  }
  public getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>> {
    return this._testContext.testOutcomeVariables.find(v => v.identifier === identifier) || null;
  }

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

  outcomeProcessing(): boolean {
    const outcomeProcessor = this.querySelector('qti-outcome-processing') as unknown as QtiOutcomeProcessing;
    if (!outcomeProcessor) return false;
    outcomeProcessor?.process();
    return true;
  }

  /*
   * this code adds a new item to the items array in the _context object,
   * if no item with a matching identifier already exists.
   * If a matching item is found, the code does not modify the items array.
   */
  private _onItemRefRegistered(
    e: CustomEvent<{ href: string; identifier: string }> & {
      target: QtiAssessmentItemRef;
    }
  ): void {
    this.itemRefEls.set(e.detail.identifier, e.target);

    const { href, identifier } = e.detail;

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

  private _itemFirstUpdated = (item: QtiAssessmentItem): void => {
    const itemContext = this._testContext.items.find(i => i?.identifier === item?.identifier);
    // if it is still empty, then copy the variables from the item

    if (!itemContext) {
      console.log(`item with Id not found ${item?.identifier} is the name of the item the same?`);
      return;
    }

    if (itemContext.variables?.length === 1) {
      this.mergeItemVariables(item.identifier);
    } else {
      // if it is not empty, then the item variables with the testcontext variables
      item.variables = [...itemContext.variables];
    }
  };

  @property({ type: String, reflect: true, attribute: 'item-identifier' })
  set itemIdentifier(identifier: string) {
    if (this._sessionContext.identifier !== identifier) {
      this._sessionContext = { ...this._sessionContext, identifier };

      if (this.itemRefEls.has(identifier)) {
        // A. if the related item-ref is already registered, then we can request the item
        this._sessionContext.identifier && this._requestItem(this._sessionContext.identifier);
        return;
      }
    }
  }

  @property({ type: String, reflect: false, attribute: 'view' })
  set view(viewer: viewer) {
    this._sessionContext = { ...this._sessionContext, view: viewer };
  }

  private onItemRefRegistered(e: CustomEvent<{ href: string; identifier: string }>): void {
    if (e.detail.identifier === this._sessionContext.identifier) {
      // B. if the item-identifer is already set, and we register the related item-ref, then we can request the item
      this._sessionContext.identifier && this._requestItem(this._sessionContext.identifier);
    }
  }

  get itemIdentifier(): string {
    return this._sessionContext.identifier;
  }

  private contextChangedEvent(e) {
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
    this.dispatchEvent(
      new CustomEvent<TestContext>('qti-context-changed', {
        bubbles: true,
        composed: true,
        detail: this.context
      })
    );
  }

  constructor() {
    super();
    this.addEventListener(
      'qti-item-connected',
      (e: CustomEvent<{ href: string; identifier: string }> & { target: QtiAssessmentItemRef }) => {
        this._onItemRefRegistered(e);
      }
    );
    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
      this._itemFirstUpdated(e.detail);
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
    this.addEventListener(
      // wordt aangeroepen vanuit de processingtemplate
      'qti-set-outcome-value',
      (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
        const { outcomeIdentifier, value } = e.detail;
        this.updateOutcomeVariable(outcomeIdentifier, value);
        e.stopPropagation();
      }
    );

    this.addEventListener('qti-test-set-item', (e: CustomEvent) => {
      this._sessionContext = { ...this._sessionContext, identifier: e.detail };
    });
    this.addEventListener('qti-outcome-changed', this.contextChangedEvent);
    this.addEventListener('qti-interaction-changed', this.contextChangedEvent);
    this.addEventListener('qti-assessment-item-connected', e => {});
    // this.addEventListener(
    //   'qti-assessment-test-connected',
    //   e => (this.assessmentTestEl = e.target as QtiAssessmentTest)
    // );
    this.addEventListener('qti-item-connected', (e: CustomEvent<{ identifier: string; href: string }>) =>
      this.onItemRefRegistered(e)
    );
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

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('on-test-switch-view', this.handleTestSwitchView);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('on-test-switch-view', this.handleTestSwitchView);
  }

  handleTestSwitchView(event: CustomEvent) {
    const view = event.detail;
    this._sessionContext = { ...this._sessionContext, view };
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
