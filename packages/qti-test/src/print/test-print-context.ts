import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { state } from 'lit/decorators.js';

import { computedContext } from '@qti-components/base';

import type { ComputedContext } from '@qti-components/base';

export class TestPrintContext extends LitElement {
  @state()
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  override render() {
    return html` <small><pre>${JSON.stringify(this.computedContext, null, 2)}</pre></small> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-context': TestPrintContext;
  }
}
