import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sessionContext } from '../../exports/session.context';

import type { SessionContext } from '../../exports/session.context';

@customElement('test-view-toggle')
export class TestViewToggle extends LitElement {
  static styles = css`
    ::slotted {
      display: flex;
      flex-wrap: nowrap;
    }
    label {
      display: flex;
      cursor: pointer;
      user-select: none;
    }
  `;

  @consume({ context: sessionContext, subscribe: true })
  private sessionContext: SessionContext;

  viewOptions = ['candidate', 'scorer', ''];

  _switchView(view: string) {
    this.dispatchEvent(
      new CustomEvent('on-test-switch-view', {
        composed: true,
        bubbles: true,
        detail: view
      })
    );
  }

  render() {
    return html`
      <label for="viewToggle" part="label">
        <input
          type="checkbox"
          role="switch"
          switch
          aria-checked=${this.sessionContext?.view === 'scorer'}
          id="viewToggle"
          class="peer"
          part="input"
          ?checked=${this.sessionContext?.view === 'scorer'}
          @change=${(e: Event) => {
            const el = e.target as HTMLInputElement;
            if (el.checked) {
              this._switchView('scorer');
            } else {
              this._switchView('candidate');
            }
          }}
        />
        <!-- for switch -->
        <span part="peer"></span>
        <slot></slot>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-view-toggle': TestViewToggle;
  }
}
