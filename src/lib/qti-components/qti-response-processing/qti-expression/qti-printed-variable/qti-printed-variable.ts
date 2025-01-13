import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { itemContext } from '../../../qti-assessment-item/qti-assessment-item.context';
import type { VariableDeclaration } from '../../../internal/variables';
import type { ItemContext } from '../../../internal/item.context';

export class QtiPrintedVariable extends LitElement {
  @property({ type: String })
  identifier: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  override render() {
    const value = this.context?.variables.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

  public calculate(): VariableDeclaration<string | string[]> {
    const result = this.context.variables.find(v => v.identifier === this.identifier) || null;
    return result;
  }
}

customElements.define('qti-printed-variable', QtiPrintedVariable);
