import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hi-24-outline-chevron-left')
export class Hi24OutlineChevronLeft extends LitElement {
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
      </svg>
    `;
  }
}
