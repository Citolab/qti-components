import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';

import { computedContext } from '../../exports/computed.context';

import type { ComputedContext } from '../../exports/computed.context';

@customElement('test-print-item-variables')
export class TestPrintVariables extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  @property({ type: String, reflect: true })
  public mode: 'summed' | 'complete' = 'summed';

  render() {
    const activeItems = this.computedContext?.testParts.flatMap(testPart =>
      testPart.sections.flatMap(section => section.items).find(item => item.active)
    );
    let activeItem = activeItems?.[0];
    if (this.mode === 'summed' && activeItems?.length > 0) {
      activeItem = { ...activeItems[0] };
      delete activeItem['variables'];
    }
    return html` <small><pre>${JSON.stringify(activeItem, null, 2)}</pre></small> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-item-variables': TestPrintVariables;
  }
}
