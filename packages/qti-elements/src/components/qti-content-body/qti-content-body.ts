import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { itemContext } from '@qti-components/base';

import type { ItemContext, TemplateVariable } from '@qti-components/base';

@customElement('qti-content-body')
export class QtiContentBody extends LitElement {
  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  override render() {
    return html`<slot @slotchange=${this.#expandMathVariables}></slot>`;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.updateComplete.then(() => this.#expandMathVariables());
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('context')) {
      this.#expandMathVariables();
    }
  }

  #expandMathVariables(): void {
    const mathVariables = new Map<string, string>();
    const templateVariables = (this.context?.variables ?? []).filter(variable => variable.type === 'template');

    for (const variable of templateVariables) {
      const templateVariable = variable as TemplateVariable;
      if (templateVariable.mathVariable !== true || templateVariable.value === null || templateVariable.value === undefined) {
        continue;
      }

      mathVariables.set(templateVariable.identifier, this.#stringifyValue(templateVariable.value));
    }

    if (mathVariables.size === 0) {
      return;
    }

    const mathIdentifiers = Array.from(this.querySelectorAll('*')).filter(
      element => element.localName.toLowerCase() === 'mi' || element.localName.toLowerCase() === 'mn'
    );

    for (const element of mathIdentifiers) {
      const identifier = element.getAttribute('data-qti-math-variable-source') ?? element.textContent?.trim() ?? '';
      const value = mathVariables.get(identifier);

      if (!value) {
        continue;
      }

      if (element.localName.toLowerCase() === 'mn') {
        element.textContent = value;
        element.setAttribute('data-qti-math-variable-source', identifier);
        continue;
      }

      const replacement = document.createElement('mn');
      replacement.textContent = value;
      replacement.setAttribute('data-qti-math-variable-source', identifier);
      element.replaceWith(replacement);
    }
  }

  #stringifyValue(value: string | readonly string[] | number | boolean | null): string {
    if (Array.isArray(value)) {
      return value.join(' ');
    }

    return value?.toString() ?? '';
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'qti-content-body': QtiContentBody;
  }
}
