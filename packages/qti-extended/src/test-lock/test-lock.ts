import { css, html, LitElement, nothing } from 'lit';
import { consume } from '@lit/context';
import { property, state } from 'lit/decorators.js';
import { computedContext } from '@citolab/qti-components/qti-base';
import { controlStyles as styles, dispatchPublic } from '@citolab/qti-components/qti-test/plugin-api';

import type { PropertyValues } from 'lit';
import type { ComputedContext } from '@citolab/qti-components/qti-base';

/** The lock's entry in the test's state (`session.plugins.lock`). */
export interface LockState {
  /** The test is locked: the candidate left the page and nobody has unlocked it yet. */
  locked: boolean;
  /** How often the test was locked during this session. */
  times: number;
}

/**
 * The lock state of a test: whether it is locked and how often it was. For a host that shows it to a
 * proctor, or unlocks from its own screen.
 */
export const lockState = (context: Pick<ComputedContext, 'plugins'> | undefined): LockState => {
  const entry = context?.plugins?.lock as { locked?: unknown; times?: unknown } | undefined;
  return {
    locked: entry?.locked === true,
    times: typeof entry?.times === 'number' ? entry.times : 0
  };
};

/**
 * Locks the test when the candidate leaves the page: another tab or window, or the page hidden. A
 * modal covers the test until it is unlocked, so the candidate cannot go on answering. It is a
 * deterrent for a supervised session, not security: the page is the candidate's.
 *
 * The lock lives in the test's state under `lock` (`session.plugins.lock`, `{ locked, times }`), so a
 * host that stores `state` stores it: reloading the page does not escape it, and `times` tells a
 * proctor how often the candidate left. `lockState(computedContext)` reads it.
 *
 * Unlocking: with a `code`, the modal asks for it, and the right code unlocks. The code is in the page
 * for anyone who opens the developer tools, so it keeps a candidate from simply carrying on, nothing
 * more. Without a `code`, the modal only shows its message and the host unlocks, with `unlock()` (for
 * example after a proctor's action on another screen).
 *
 * Focus moving into an iframe (a portable custom interaction, a video) is not leaving the page.
 *
 * Put it inside `<test-navigation>`; it shows nothing until the test is locked. The modal's message
 * is the element's content.
 *
 * @slot - The message in the modal.
 * @attr code - The code that unlocks the test; without it only `unlock()` does.
 * @attr locked - Reflected: the test is locked.
 * @attr code-label - The label of the code field.
 * @attr unlock-label - The label of the unlock button.
 * @attr wrong-code-label - The message for a wrong code.
 * @fires lock - The test was locked (also when a restored state is locked).
 * @fires unlock - The test was unlocked.
 * @csspart dialog - The modal.
 * @csspart notice - The message. (Not `message`: the theme paints that part as a validation message.)
 * @csspart form - The code field and button.
 * @csspart input - The code field.
 * @csspart button - The unlock button.
 * @csspart error - The message for a wrong code.
 */
export class TestLock extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  @property({ attribute: false })
  protected computedContext?: ComputedContext;

  @property() code?: string;

  @property({ attribute: 'code-label' }) codeLabel = 'Code';

  @property({ attribute: 'unlock-label' }) unlockLabel = 'Ontgrendel';

  @property({ attribute: 'wrong-code-label' }) wrongCodeLabel = 'Deze code klopt niet.';

  @property({ type: Boolean, reflect: true }) locked = false;

  @state() private wrongCode = false;

  static override styles = [
    css`
      :host {
        display: contents;
      }
      dialog {
        box-sizing: border-box;
        max-width: min(28rem, calc(100vw - 2rem));
        padding: 1.5rem;
        border: var(--qti-border-width, var(--qc-border-width, var(--cito-border-width, 1px))) solid
          var(--qti-border-color, color-mix(in oklab, CanvasText 45%, Canvas));
        border-radius: var(--qti-radius-box, var(--qc-radius-box, var(--cito-radius-box, 0.5rem)));
        background: var(--qti-color-base-100, var(--qc-color-base-100, var(--cito-color-base-100, Canvas)));
        color: var(--qti-color-base-content, var(--qc-color-base-content, var(--cito-color-base-content, CanvasText)));
        font: inherit;
      }
      dialog::backdrop {
        background: rgb(0 0 0 / 0.4);
        backdrop-filter: blur(4px);
      }
      form {
        display: flex;
        flex-wrap: wrap;
        align-items: end;
        gap: 0.5rem;
        margin-block-start: 1rem;
      }
      label {
        display: grid;
        gap: 0.25rem;
        flex: 1 1 10rem;
      }
      input {
        ${styles.ind};
        cursor: text;
        justify-content: start;
        background: transparent;
        color: inherit;
      }
      button {
        ${styles.btn};
      }
      @media (hover: hover) and (pointer: fine) {
        button:hover {
          ${styles.btnInteractive};
        }
      }
      button:active {
        ${styles.btnActive};
      }
      input:focus-visible,
      button:focus-visible {
        ${styles.focusRing};
      }
      [part='error'] {
        flex-basis: 100%;
        margin: 0;
      }
    `
  ];

  #onVisibilityChange = () => {
    if (document.hidden) this.#lock();
  };

  #onBlur = () => {
    // Focus moving into an iframe of the test blurs the window too; that is not leaving the page.
    // The iframe is the active element only after the blur, so look once the event is through.
    setTimeout(() => {
      if (document.activeElement instanceof HTMLIFrameElement) return;
      this.#lock();
    });
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('visibilitychange', this.#onVisibilityChange);
    window.addEventListener('blur', this.#onBlur);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('visibilitychange', this.#onVisibilityChange);
    window.removeEventListener('blur', this.#onBlur);
  }

  /** Unlocks the test, whatever the code: for a host that unlocks from its own screen. */
  unlock(): void {
    const current = lockState(this.computedContext);
    if (!current.locked) return;
    this.#write({ locked: false, times: current.times });
  }

  #lock(): void {
    // Only inside a test that is running: there is no state to keep the lock in otherwise.
    if (!this.computedContext?.testParts?.length) return;
    const current = lockState(this.computedContext);
    if (current.locked) return;
    this.#write({ locked: true, times: current.times + 1 });
  }

  #write(value: LockState): void {
    dispatchPublic(this, 'qc-test-update-plugin-state', { plugin: 'lock', value });
  }

  #submit(event: SubmitEvent): void {
    event.preventDefault();
    const input = this.renderRoot.querySelector('input')!;
    if (input.value === this.code) {
      input.value = '';
      this.wrongCode = false;
      this.unlock();
    } else {
      this.wrongCode = true;
      input.select();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('computedContext')) this.locked = lockState(this.computedContext).locked;
  }

  protected override updated(changed: PropertyValues): void {
    if (!changed.has('locked')) return;
    const dialog = this.renderRoot.querySelector('dialog')!;
    if (this.locked && !dialog.open) {
      dialog.showModal();
      this.dispatchEvent(new Event('lock', { bubbles: true, composed: true }));
    } else if (!this.locked && dialog.open) {
      dialog.close();
      this.wrongCode = false;
      this.dispatchEvent(new Event('unlock', { bubbles: true, composed: true }));
    }
  }

  override render() {
    // Escape closes a modal dialog; this one stays until it is unlocked.
    return html`<dialog part="dialog" aria-labelledby="notice" @cancel=${(event: Event) => event.preventDefault()}>
      <div id="notice" part="notice">
        <slot>De toets is vergrendeld. Vraag de toezichthouder om hem te openen.</slot>
      </div>
      ${this.code
        ? html`<form part="form" @submit=${this.#submit}>
            <label
              >${this.codeLabel}
              <input part="input" type="password" autocomplete="off" required aria-invalid=${this.wrongCode} />
            </label>
            <button part="button" type="submit">${this.unlockLabel}</button>
            ${this.wrongCode ? html`<p part="error" role="alert">${this.wrongCodeLabel}</p>` : nothing}
          </form>`
        : nothing}
    </dialog>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-lock': TestLock;
  }
}
