import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hi-24-outline-chevron-right')
export class Hi24OutlineChevronRight extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 1.5rem;
      width: 1.5rem;
    }
  `;
  @property()
  class?: string = '';
  // Render the UI as a function of component state
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
      <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
    </svg>`;
  }
}