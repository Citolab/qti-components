import '../../../../qti-components';
import { html, render } from 'lit';
import { provide } from '@lit/context';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { qtiContext } from '../../../../exports/qti.context';

import type { QtiFieldValue } from './qti-field-value';
import type { QtiContext } from '../../../../exports/qti.context';

describe('qti-field-value with QTI_CONTEXT', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    // Create a fresh container for each test
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    // Clean up after each test
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  it('should extract testIdentifier from QTI_CONTEXT', async () => {
    // Create a unique provider for this test
    @customElement('test-provider-1')
    class TestProvider1 extends LitElement {
      @provide({ context: qtiContext })
      qtiContext: QtiContext = {
        QTI_CONTEXT: {
          testIdentifier: 'TEST_001',
          candidateIdentifier: 'CANDIDATE_123',
          environmentIdentifier: 'production'
        }
      };

      render() {
        return html`<slot></slot>`;
      }
    }

    const template = () => html`
      <test-provider-1>
        <qti-field-value field-identifier="testIdentifier">
          <qti-variable identifier="QTI_CONTEXT"></qti-variable>
        </qti-field-value>
      </test-provider-1>
    `;

    render(template(), testContainer);

    // Wait for elements to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 0));

    const qtiFieldValue = testContainer.querySelector('qti-field-value') as QtiFieldValue;
    expect(qtiFieldValue.calculate()).toBe('TEST_001');
  });

  it('should extract candidateIdentifier from QTI_CONTEXT', async () => {
    @customElement('test-provider-2')
    class TestProvider2 extends LitElement {
      @provide({ context: qtiContext })
      qtiContext: QtiContext = {
        QTI_CONTEXT: {
          testIdentifier: 'TEST_001',
          candidateIdentifier: 'CANDIDATE_123',
          environmentIdentifier: 'production'
        }
      };

      render() {
        return html`<slot></slot>`;
      }
    }

    const template = () => html`
      <test-provider-2>
        <qti-field-value field-identifier="candidateIdentifier">
          <qti-variable identifier="QTI_CONTEXT"></qti-variable>
        </qti-field-value>
      </test-provider-2>
    `;

    render(template(), testContainer);
    await new Promise(resolve => setTimeout(resolve, 0));

    const qtiFieldValue = testContainer.querySelector('qti-field-value') as QtiFieldValue;
    expect(qtiFieldValue.calculate()).toBe('CANDIDATE_123');
  });

  it('should extract environmentIdentifier from QTI_CONTEXT', async () => {
    @customElement('test-provider-3')
    class TestProvider3 extends LitElement {
      @provide({ context: qtiContext })
      qtiContext: QtiContext = {
        QTI_CONTEXT: {
          testIdentifier: 'TEST_001',
          candidateIdentifier: 'CANDIDATE_123',
          environmentIdentifier: 'production'
        }
      };

      render() {
        return html`<slot></slot>`;
      }
    }

    const template = () => html`
      <test-provider-3>
        <qti-field-value field-identifier="environmentIdentifier">
          <qti-variable identifier="QTI_CONTEXT"></qti-variable>
        </qti-field-value>
      </test-provider-3>
    `;

    render(template(), testContainer);
    await new Promise(resolve => setTimeout(resolve, 0));

    const qtiFieldValue = testContainer.querySelector('qti-field-value') as QtiFieldValue;
    expect(qtiFieldValue.calculate()).toBe('production');
  });

  // Continue with the same pattern for other tests...
  it('should work with custom context variables in QTI_CONTEXT', async () => {
    @customElement('test-provider-4')
    class TestProvider4 extends LitElement {
      @provide({ context: qtiContext })
      qtiContext: QtiContext = {
        QTI_CONTEXT: {
          testIdentifier: 'TEST_002',
          candidateIdentifier: 'CANDIDATE_456',
          environmentIdentifier: 'development',
          customField: 'customValue',
          scalingFactor: '1.5'
        }
      };

      render() {
        return html`<slot></slot>`;
      }
    }

    const template = () => html`
      <test-provider-4>
        <qti-field-value field-identifier="customField">
          <qti-variable identifier="QTI_CONTEXT"></qti-variable>
        </qti-field-value>
      </test-provider-4>
    `;

    render(template(), testContainer);
    await new Promise(resolve => setTimeout(resolve, 0));

    const qtiFieldValue = testContainer.querySelector('qti-field-value') as QtiFieldValue;
    expect(qtiFieldValue.calculate()).toBe('customValue');
  });
});
