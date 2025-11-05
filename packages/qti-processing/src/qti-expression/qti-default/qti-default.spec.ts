import '@qti-components/components';

import { html, render } from 'lit';
import { provide } from '@lit/context';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { itemContext, testContext, type ItemContext } from '@qti-components/shared';

import type { OutcomeVariable, VariableDeclaration, TestContext } from '@qti-components/shared';
import type { QtiDefault } from './qti-default';

// Mock item context provider
@customElement('mock-item-provider')
class MockItemProvider extends LitElement {
  @provide({ context: itemContext })
  itemContext: ItemContext = {
    variables: []
  };

  render() {
    return html`<slot></slot>`;
  }
}

// Mock test context provider
@customElement('mock-test-provider')
class MockTestProvider extends LitElement {
  @provide({ context: testContext })
  testContext: TestContext = {
    items: []
  };

  render() {
    return html`<slot></slot>`;
  }
}

describe('qti-default', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  describe('current item context', () => {
    it('should return default value from response variable in item context', async () => {
      @customElement('test-item-provider-1')
      class TestItemProvider1 extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: [
            {
              identifier: 'RESPONSE',
              type: 'response',
              cardinality: 'single',
              baseType: 'string',
              value: null,
              defaultValue: 'default-response'
            } as VariableDeclaration<string>
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-1>
          <qti-default identifier="RESPONSE"></qti-default>
        </test-item-provider-1>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBe('default-response');
    });

    it('should return default value from outcome variable', async () => {
      @customElement('test-item-provider-2')
      class TestItemProvider2 extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: [
            {
              identifier: 'SCORE',
              type: 'outcome',
              cardinality: 'single',
              baseType: 'float',
              value: null,
              defaultValue: '0'
            } as OutcomeVariable
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-2>
          <qti-default identifier="SCORE"></qti-default>
        </test-item-provider-2>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBe('0');
    });

    it('should return default value from template variable', async () => {
      @customElement('test-item-provider-3')
      class TestItemProvider3 extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: [
            {
              identifier: 'TEMPLATE_VAR',
              type: 'template',
              cardinality: 'single',
              baseType: 'integer',
              value: '',
              defaultValue: '42'
            } as VariableDeclaration<string>
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-3>
          <qti-default identifier="TEMPLATE_VAR"></qti-default>
        </test-item-provider-3>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBe('42');
    });

    it('should return null when variable has no default value', async () => {
      @customElement('test-item-provider-4')
      class TestItemProvider4 extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: [
            {
              identifier: 'NO_DEFAULT',
              type: 'response',
              cardinality: 'single',
              baseType: 'string',
              value: null,
              defaultValue: null
            } as VariableDeclaration<string>
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-4>
          <qti-default identifier="NO_DEFAULT"></qti-default>
        </test-item-provider-4>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBeNull();
    });

    it('should return null when variable is not found', async () => {
      @customElement('test-item-provider-5')
      class TestItemProvider5 extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: [
            {
              identifier: 'OTHER_VAR',
              type: 'response',
              cardinality: 'single',
              baseType: 'string',
              value: null,
              defaultValue: 'test'
            } as VariableDeclaration<string>
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-5>
          <qti-default identifier="NON_EXISTENT"></qti-default>
        </test-item-provider-5>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBeNull();
    });
  });

  describe('item identifier prefixing (test context)', () => {
    it('should return default value from specific item in test context', async () => {
      @customElement('test-context-provider-1')
      class TestContextProvider1 extends LitElement {
        @provide({ context: testContext })
        testContext: TestContext = {
          items: [
            {
              identifier: 'item1',
              variables: [
                {
                  identifier: 'RESPONSE',
                  type: 'response',
                  cardinality: 'single',
                  baseType: 'string',
                  value: null,
                  defaultValue: 'item1-default'
                } as VariableDeclaration<string>
              ]
            },
            {
              identifier: 'item2',
              variables: [
                {
                  identifier: 'RESPONSE',
                  type: 'response',
                  cardinality: 'single',
                  baseType: 'string',
                  value: null,
                  defaultValue: 'item2-default'
                } as VariableDeclaration<string>
              ]
            }
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-context-provider-1>
          <qti-default identifier="item1.RESPONSE"></qti-default>
        </test-context-provider-1>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBe('item1-default');
    });

    it('should return different default values for different items', async () => {
      @customElement('test-context-provider-2')
      class TestContextProvider2 extends LitElement {
        @provide({ context: testContext })
        testContext: TestContext = {
          items: [
            {
              identifier: 'item1',
              variables: [
                {
                  identifier: 'SCORE',
                  type: 'outcome',
                  cardinality: 'single',
                  baseType: 'float',
                  value: null,
                  defaultValue: '10.0'
                } as VariableDeclaration<string>
              ]
            },
            {
              identifier: 'item2',
              variables: [
                {
                  identifier: 'SCORE',
                  type: 'outcome',
                  cardinality: 'single',
                  baseType: 'float',
                  value: null,
                  defaultValue: '20.0'
                } as VariableDeclaration<string>
              ]
            }
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-context-provider-2>
          <qti-default identifier="item2.SCORE"></qti-default>
        </test-context-provider-2>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBe('20.0');
    });

    it('should return null when item is not found in test context', async () => {
      @customElement('test-context-provider-3')
      class TestContextProvider3 extends LitElement {
        @provide({ context: testContext })
        testContext: TestContext = {
          items: [
            {
              identifier: 'item1',
              variables: []
            }
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-context-provider-3>
          <qti-default identifier="nonexistent.RESPONSE"></qti-default>
        </test-context-provider-3>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBeNull();
    });

    it('should return null when variable is not found in specified item', async () => {
      @customElement('test-context-provider-4')
      class TestContextProvider4 extends LitElement {
        @provide({ context: testContext })
        testContext: TestContext = {
          items: [
            {
              identifier: 'item1',
              variables: [
                {
                  identifier: 'OTHER_VAR',
                  type: 'response',
                  cardinality: 'single',
                  baseType: 'string',
                  value: null,
                  defaultValue: 'test'
                } as VariableDeclaration<string>
              ]
            }
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-context-provider-4>
          <qti-default identifier="item1.MISSING_VAR"></qti-default>
        </test-context-provider-4>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBeNull();
    });
  });

  describe('error cases', () => {
    it('should return null when identifier attribute is missing', async () => {
      @customElement('test-item-provider-error-1')
      class TestItemProviderError1 extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: []
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-error-1>
          <qti-default></qti-default>
        </test-item-provider-error-1>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBeNull();
    });

    it('should return null when no item context is available', async () => {
      const template = () => html` <qti-default identifier="RESPONSE"></qti-default> `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBeNull();
    });

    it('should return null for invalid identifier format', async () => {
      @customElement('test-item-provider-error-2')
      class TestItemProviderError2 extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: []
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-error-2>
          <qti-default identifier="item.variable.extra.parts"></qti-default>
        </test-item-provider-error-2>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toBeNull();
    });
  });

  describe('complex default values', () => {
    it('should handle array default values for multiple cardinality', async () => {
      @customElement('test-item-provider-array')
      class TestItemProviderArray extends LitElement {
        @provide({ context: itemContext })
        itemContext: ItemContext = {
          variables: [
            {
              identifier: 'MULTI_RESPONSE',
              type: 'response',
              cardinality: 'multiple',
              baseType: 'identifier',
              value: null,
              defaultValue: ['A', 'B', 'C']
            } as VariableDeclaration<string[]>
          ]
        };

        render() {
          return html`<slot></slot>`;
        }
      }

      const template = () => html`
        <test-item-provider-array>
          <qti-default identifier="MULTI_RESPONSE"></qti-default>
        </test-item-provider-array>
      `;

      render(template(), testContainer);
      await new Promise(resolve => setTimeout(resolve, 0));

      const qtiDefault = testContainer.querySelector('qti-default') as QtiDefault;
      expect(qtiDefault.calculate()).toEqual(['A', 'B', 'C']);
    });
  });
});
