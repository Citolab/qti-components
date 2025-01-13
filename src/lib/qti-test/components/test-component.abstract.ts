import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { propInternalState } from '../../decorators';
import type { TestElement, TestContext } from '../core/context';
import { testContext, testElement } from '../core/context';
import { watch } from '../../decorators/watch';

export abstract class TestComponent extends LitElement {
  @propInternalState({
    type: Boolean,
    reflect: true,
    aria: 'ariaDisabled' // Maps to `aria-disabled` attribute
  })
  public disabled = true;

  @state()
  @consume({ context: testContext, subscribe: true })
  protected _testContext?: TestContext;

  @state()
  @consume({ context: testElement, subscribe: true })
  protected _testElement?: TestElement;
  @watch('_testElement')
  _handleTestElementChange(_oldValue: TestElement, newValue: TestElement) {
    if (newValue.el) {
      this.disabled = false;
    }
  }

  protected _internals: ElementInternals;

  protected items;
  protected itemIndex;
  protected view;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  protected willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('_testContext')) {
      const { items = [], navItemId } = this._testContext ?? {};
      this.itemIndex = items.findIndex(item => item.identifier === navItemId);
      this.items = items;
      this.view = this._testContext?.view;
    }
  }

  protected _switchView(view: string) {
    this.dispatchEvent(
      new CustomEvent('on-test-switch-view', {
        composed: true,
        bubbles: true,
        detail: view
      })
    );
  }

  protected _requestItem(identifier: string): void {
    this.dispatchEvent(
      new CustomEvent('qti-request-test-item', {
        composed: true,
        bubbles: true,
        detail: identifier
      })
    );
  }
}
