import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hi-24-outline-x-mark')
export class Hi24OutlineXMark extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;
  @property()
  class?: string = '';
  // Render the UI as a function of component state
  render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
        data-slot="icon"
        class=${this.class}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path>
      </svg>
    `;
  }
}
