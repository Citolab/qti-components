import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hi-24-outline-arrow-left')
export class Hi24OutlineArrowLeft extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;
  @property()
  class?: string = '';
  render() {
    return html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
        data-slot="icon"
        class=${this.class}
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    `;
  }
}
