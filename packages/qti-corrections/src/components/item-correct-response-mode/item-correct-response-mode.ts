import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { configContext } from '@qti-components/base';

import type { ConfigContext } from '@qti-components/base';
import type { CorrectionConfig, CorrectResponseMode } from '../../context/correction-config';

export class ItemCorrectResponseMode extends LitElement {
  @consume({ context: configContext, subscribe: true })
  private itemContext: ConfigContext & CorrectionConfig;

  @property({ type: String })
  label = 'Correct response mode';

  @state()
  private _options = {
    internal: 'Internal',
    full: 'Full (copy)'
  };

  #switchMode(view: CorrectResponseMode) {
    this.dispatchEvent(
      new CustomEvent('item-switch-correct-response-mode', {
        detail: view,
        bubbles: true
      })
    );
  }

  override render() {
    return html`
      <label part="label" for="modeSelect">${this.label}</label>
      <select
        part="select"
        id="modeSelect"
        @change=${(e: Event) => {
          const el = e.target as HTMLSelectElement;
          this.#switchMode(el.value as CorrectResponseMode);
        }}
      >
        ${Object.keys(this._options).map(
          value =>
            html`<option value="${value}" ?selected=${value === this.itemContext?.correctResponseMode}>
              ${this._options[value as keyof typeof this._options]}
            </option>`
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
