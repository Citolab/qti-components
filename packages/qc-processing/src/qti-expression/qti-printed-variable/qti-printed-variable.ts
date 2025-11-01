import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { itemContext } from '@qti-components/shared';

import type { VariableDeclaration } from '@qti-components/shared';
import type { ItemContext } from '@qti-components/shared';

export class QtiPrintedVariable extends LitElement {
  @property({ type: String })
  identifier: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  override render() {
    const value = this.context?.variables.find(v => v.identifier === this.identifier)?.value;
    return value === null ? nothing : html`${JSON.stringify(value, null, 2)}`;
  }

  public calculate(): VariableDeclaration<string | string[]> {
    const result = this.context.variables.find(v => v.identifier === this.identifier) || null;
    return result;
  }
}

customElements.define('qti-printed-variable', QtiPrintedVariable);
