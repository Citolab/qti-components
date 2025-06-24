import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { configContext } from '../../exports/config.context.ts';

import type { ConfigContext, CorrectResponseMode } from '../../exports/config.context.ts';

@customElement('item-correct-response-mode')
export class ItemCorrectResponseMode extends LitElement {
  @consume({ context: configContext, subscribe: true })
  private itemContext: ConfigContext;

  @property({ type: String })
  label = 'Correct response mode';

  @state()
  private _options = {
    internal: 'Internal',
    full: 'Full (copy)'
  };

  private _switchMode(view: CorrectResponseMode) {
    this.dispatchEvent(
      new CustomEvent('item-switch-correct-response-mode', {
        detail: view,
        bubbles: true
      })
    );
  }

  render() {
    return html`
      <label part="label" for="modeSelect">${this.label}</label>
      <select
        part="select"
        id="modeSelect"
        @change=${(e: Event) => {
          const el = e.target as HTMLSelectElement;
          this._switchMode(el.value as CorrectResponseMode);
        }}
      >
        ${Object.keys(this._options).map(
          value => html`<option value="${value}" ?selected=${value === this.itemContext?.correctResponseMode}>${this._options[value]}</option>`
        )}
      </select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'item-correct-response-mode': ItemCorrectResponseMode;
  }
}
