import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { QtiFeedback } from '../qti-feedback';

@customElement('qti-modal-feedback')
export class QtiModalFeedback extends QtiFeedback {
  static override styles = css`
    .qti-dialog {
      background: var(--qti-bg);
      border: var(--qti-border-thickness) var(--qti-border-style) var(--qti-border-color);
      border-radius: var(--qti-border-radius);
      padding: var(--qti-padding-vertical) var(--qti-padding-horizontal);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      width: auto;
      max-width: 90%;
    }

    .button {
      border-radius: var(--qti-border-radius);
      padding: var(--qti-padding-vertical) var(--qti-padding-horizontal);
      background-color: var(--qti-bg-active);
      border: var(--qti-border-active);
      cursor: pointer;
      position: relative;
      display: inline-block;
    }

    .button:hover {
      background-color: var(--qti-hover-bg);
    }

    .button:disabled {
      background-color: var(--qti-disabled-bg);
      color: var(--qti-disabled-color);
      cursor: not-allowed;
    }

    .button:focus {
      outline: var(--qti-focus-border-width) solid var(--qti-focus-color);
    }
  `;

  override render() {
    return html`
      <dialog class="qti-dialog" part="feedback" ?open="${this.showStatus === 'on'}">
        <slot></slot>
        <div style="margin-top: var(--qti-gap-size); text-align: center;">
          <button class="button close-button" @click="${this.closeFeedback}">Close</button>
        </div>
      </dialog>
    `;
  }

  openFeedback() {
    const dialog = this.shadowRoot?.querySelector('dialog') as HTMLDialogElement | null;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }

  closeFeedback() {
    const dialog = this.shadowRoot?.querySelector('dialog') as HTMLDialogElement | null;
    if (dialog && dialog.open) {
      dialog.close();
      this.showStatus = 'off';
    }
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    if (this.showStatus === 'on') {
      this.openFeedback();
    }
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has('showStatus')) {
      if (this.showStatus === 'on') {
        this.openFeedback();
      } else {
        this.closeFeedback();
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-modal-feedback': QtiModalFeedback;
  }
}
