import { css, html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext } from '..';

@customElement('test-view-toggle')
export class TestViewToggle extends LitElement {
  viewOptions = ['candidate', 'scorer', ''];

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  static styles = css`
    label {
      display: flex;
      align-items: center;
    }
  `;

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
      <label>
        <input
          type="checkbox"
          role="switch"
          switch
          aria-checked=${this._sessionContext?.view === 'scorer'}
          id="viewToggle"
          ?checked=${this._sessionContext?.view === 'scorer'}
          @change=${(e: Event) => {
            const el = e.target as HTMLInputElement;
            if (el.checked) {
              this._switchView('scorer');
            } else {
              this._switchView('candidate');
            }
          }}
        />

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
