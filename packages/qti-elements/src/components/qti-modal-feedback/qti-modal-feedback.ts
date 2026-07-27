import { css, html } from 'lit';

import { QtiFeedback } from '@qti-components/base';

export class QtiModalFeedback extends QtiFeedback {
  static override styles = css`
    .qti-dialog {
      background: var(--qti-bg);
      border: var(--qti-border-thickness) var(--qti-border-style) var(--qti-border-color);
      border-radius: var(--qti-border-radius);
      padding: var(--qti-padding-box);
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
      padding: var(--qti-padding-box);
      background-color: var(--qti-bg-active);
      border: var(--qti-border-active);
      cursor: pointer;
      position: relative;
      display: inline-block;
    }

    /* Inlined from --qti-disabled-bg / --qti-disabled-color, which this button was the only reader
       of anywhere in the repo. They were named as a global disabled vocabulary but no interaction
       ever used them: the theme's disabled treatment is cursor only (see the note in qti-mixins.css). */
    .button:disabled {
      background-color: transparent;
      color: var(--qti-fg);
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
        <div style="margin-top: var(--qti-gap); text-align: center;">
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
