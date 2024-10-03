import { provide } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { OutcomeVariable, QtiAssessmentItem, QtiOutcomeProcessing, VariableDeclaration } from '../qti-components';
import type { SessionContext, viewer } from './context/session.context';
import { sessionContext } from './context/session.context';
import { testContext, TestContext } from './context/test.context';
import { QtiAssessmentItemRef } from './qti-assessment-test/qti-assessment-item-ref';

const initialContextValue: TestContext = {
  items: [],
  testOutcomeVariables: []
};

@customElement('qti-test')
export class QtiTest extends LitElement {
  @state()
  @provide({ context: sessionContext })
  private _sessionContext: SessionContext = { identifier: null, view: null };

  @provide({ context: testContext })
  private _testContext: TestContext = initialContextValue;

  public itemRefEls: Map<string, QtiAssessmentItemRef> = new Map();

  static styles = css`
    :host {
      display: block;
    }
  `;

  get context(): TestContext {
    return this._testContext;
  }

  set context(contextToRestore: TestContext) {
    if (!contextToRestore) {
      contextToRestore = initialContextValue;
    }

    contextToRestore.items?.forEach(itemContext => {
      const existingItem = this._testContext.items.find(i => i.identifier === itemContext.identifier);
      if (existingItem) {
        existingItem.variables = itemContext.variables;
      } else {
        this._testContext.items.push(itemContext);
      }
    });
  }

  public updateOutcomeVariable(identifier: string, value: string | string[] | undefined) {
    const outcomeVariable = this.getOutcome(identifier);
    if (!outcomeVariable) {
      console.warn(`Cannot set qti-outcome-identifier: ${identifier}, it is not available`);
      return;
    }

    this._testContext = {
      ...this._testContext,
      testOutcomeVariables: this._testContext.testOutcomeVariables.map(v =>
        v.identifier !== identifier
          ? v
          : {
              ...v,
              value: outcomeVariable.cardinality === 'single' ? value : [...(v.value as string[]), value as string]
            }
      )
    };
  }

  public getOutcome(identifier: string): Readonly<OutcomeVariable> {
    return this.getVariable(identifier) as OutcomeVariable;
  }

  public getVariable(identifier: string): Readonly<VariableDeclaration<string | string[] | null>> | null {
    return this._testContext.testOutcomeVariables.find(v => v.identifier === identifier) || null;
  }

  private mergeItemVariables(identifier: string): void {
    const assessmentItemRef = this.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${identifier}"]`
    );
    const assessmentItem = assessmentItemRef?.assessmentItem;
    if (!assessmentItem) return;

    this._testContext = {
      ...this._testContext,
      items: this._testContext.items.map(itemContext => {
        if (itemContext.identifier !== identifier) return itemContext;

        const variables = assessmentItem.variables.map(variable => {
          const matchingValue = itemContext.variables.find(v => v.identifier === variable.identifier);
          return matchingValue ? { ...matchingValue, ...variable } : variable;
        });

        return {
          ...itemContext,
          variables
        };
      })
    };
  }

  public outcomeProcessing(): boolean {
    const outcomeProcessor = this.querySelector('qti-outcome-processing') as QtiOutcomeProcessing;
    if (!outcomeProcessor) return false;
    outcomeProcessor.process();
    return true;
  }

  @property({ type: String, reflect: true, attribute: 'item-identifier' })
  set itemIdentifier(identifier: string) {
    if (this._sessionContext.identifier !== identifier) {
      this._sessionContext = { ...this._sessionContext, identifier };

      if (this.itemRefEls.has(identifier)) {
        this._requestItem(identifier);
      }
    }
  }

  get itemIdentifier(): string {
    return this._sessionContext.identifier;
  }

  @property({ type: String, attribute: 'view' })
  set view(viewer: viewer) {
    this._sessionContext = { ...this._sessionContext, view: viewer };
  }

  private _onItemRefRegistered(
    e: CustomEvent<{ href: string; identifier: string }> & {
      target: QtiAssessmentItemRef;
    }
  ): void {
    const { href, identifier } = e.detail;
    this.itemRefEls.set(identifier, e.target);

    if (!this._testContext.items.some(item => item.identifier === identifier)) {
      this._testContext.items.push({
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
      });
    }

    if (identifier === this._sessionContext.identifier) {
      this._requestItem(identifier);
    }
  }

  private _itemFirstUpdated(item: QtiAssessmentItem): void {
    const itemContext = this._testContext.items.find(i => i.identifier === item.identifier);

    if (!itemContext) {
      console.log(`Item with ID not found: ${item.identifier}. Is the name of the item the same?`);
      return;
    }

    if (itemContext.variables.length <= 1) {
      this.mergeItemVariables(item.identifier);
    } else {
      item.variables = [...itemContext.variables];
    }
  }

  private _requestItem(identifier: string): void {
    this.dispatchEvent(
      new CustomEvent<string>('qti-test-set-item', {
        bubbles: true,
        composed: true,
        detail: identifier
      })
    );
  }

  private _contextChangedEvent(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(
      new CustomEvent<TestContext>('qti-context-changed', {
        bubbles: true,
        composed: true,
        detail: this.context
      })
    );
  }

  private _handleTestSwitchView(event: CustomEvent<viewer>): void {
    this._sessionContext = { ...this._sessionContext, view: event.detail };
  }

  constructor() {
    super();

    // Event listeners
    this.addEventListener(
      'qti-item-connected',
      (
        e: CustomEvent<{ href: string; identifier: string }> & {
          target: QtiAssessmentItemRef;
        }
      ) => this._onItemRefRegistered(e)
    );

    this.addEventListener('qti-assessment-item-connected', (e: CustomEvent<QtiAssessmentItem>) => {
      this._itemFirstUpdated(e.detail);
    });

    this.addEventListener('qti-interaction-changed', (e: CustomEvent<{ item: string }>) => {
      this.mergeItemVariables(e.detail.item);
      this._contextChangedEvent(e);
    });

    this.addEventListener('qti-outcome-changed', (e: CustomEvent<{ item: string }>) => {
      this.mergeItemVariables(e.detail.item);
      this._contextChangedEvent(e);
      e.stopPropagation();
    });

    this.addEventListener(
      'qti-register-variable',
      (e: CustomEvent<{ variable: VariableDeclaration<string | string[] | null> }>) => {
        const variable = e.detail.variable;
        if (!this._testContext.testOutcomeVariables.some(v => v.identifier === variable.identifier)) {
          this._testContext.testOutcomeVariables.push(variable);
        }
        e.stopPropagation();
      }
    );

    this.addEventListener(
      'qti-set-outcome-value',
      (e: CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>) => {
        this.updateOutcomeVariable(e.detail.outcomeIdentifier, e.detail.value);
        e.stopPropagation();
      }
    );

    this.addEventListener('qti-test-set-item', (e: CustomEvent<string>) => {
      this._sessionContext = { ...this._sessionContext, identifier: e.detail };
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('on-test-switch-view', this._handleTestSwitchView);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('on-test-switch-view', this._handleTestSwitchView);
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test': QtiTest;
  }
}
