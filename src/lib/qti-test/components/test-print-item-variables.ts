import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';

import { computedContext } from '../../exports/computed.context';

import type { ComputedContext } from '../../exports/computed.context';

@customElement('test-print-item-variables')
export class TestPrintVariables extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  render() {
    const activeItem = this.computedContext?.testParts.flatMap(testPart =>
      testPart.sections.flatMap(section => section.items).find(item => item.active)
    );

    return html` <small><pre>${JSON.stringify(activeItem, null, 2)}</pre></small> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-item-variables': TestPrintVariables;
  }
}
