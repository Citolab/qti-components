import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('test-view')
export class TestView extends LitElement {
  viewOptions = ['author', 'candidate', 'proctor', 'scorer', 'testConstructor', 'tutor', ''];

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
        view:

        <select
          id="viewSelect"
          @change=${(e: Event) => {
            const el = e.target as HTMLInputElement;
            this._switchView(el.value);
          }}
        >
          ${this.viewOptions.map(v => html`<option value="${v}">${v}</option>`)}
        </select>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-view': TestView;
  }
}
