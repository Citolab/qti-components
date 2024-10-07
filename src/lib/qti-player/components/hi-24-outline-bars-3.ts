import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hi-24-outline-bars-3')
export class Hi24OutlineBars3 extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 1.5rem;
      width: 1.5rem;
    }
  `;

  @property()
  class?: string = '';

  render() {
    return html` <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      aria-hidden="true"
      data-slot="icon"
      class=${this.class}
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
    </svg>`;
  }
}
