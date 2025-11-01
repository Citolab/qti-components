import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { customElement, state } from 'lit/decorators.js';

import { computedContext } from '../../../src/lib/exports/computed.context';

import type { ComputedContext } from '../../../src/lib/exports/computed.context';

@customElement('test-print-context')
export class TestPrintContext extends LitElement {
  @state()
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  render() {
    return html` <small><pre>${JSON.stringify(this.computedContext, null, 2)}</pre></small> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-context': TestPrintContext;
  }
}
