import { css, html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';

import styles from '@qti-components/interactions/components/qti-inline-choice-interaction/qti-inline-choice-interaction.styles.js';

import { Interaction } from '../interaction';

let inlineChoiceMenuCounter = 0;

export class QtiInlineChoiceInteraction extends Interaction {
  private _calculatedMinWidth: number;
  static override get styles() {
    return [
      styles,
      css`
        :host {
          white-space: nowrap;
        }
      `
    ];
  }

  @state()
  protected _dropdownOpen = false;

  private readonly _menuId = `qti-inline-choice-menu-${inlineChoiceMenuCounter++}`;

  override render() {
    return html`
      <button
        part="trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded="${this._dropdownOpen ? 'true' : 'false'}"
        aria-controls="${this._menuId}"
        popovertarget="${this._menuId}"
        popovertargetaction="toggle"
      >
        <span part="value">Klik om opties in te vullen</span>
        <span part="dropdown-icon" aria-hidden="true">▾</span>
      </button>
      <div id="${this._menuId}" part="menu" role="listbox" popover="auto">
        <button part="option" type="button" role="option">
          <span part="option-content">vul hieronder de opties in</span>
        </button>
        <slot @slotchange=${this.#onChoicesSlotChange}></slot>
      </div>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#estimateOptimalWidth();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }

  #estimateOptimalWidth() {
    // const trigger = this.renderRoot.querySelector<HTMLElement>('button[part="trigger"]');
    // let widthPx = 0;
    // if (widthPx <= 0 && trigger) {
    //   widthPx = trigger.getBoundingClientRect().width;
    // }
    // if (widthPx <= 0) return;
    // const fontSize = parseFloat(getComputedStyle(this).fontSize || '16') || 16;
    // const widthEm = Math.min(Math.max(widthPx / fontSize, 8.75), 40);
    // this._calculatedMinWidth = widthEm;
    // this.style.setProperty('--qti-calculated-min-width', `${widthEm}em`);
  }

  #onChoicesSlotChange = () => {
    this.#estimateOptimalWidth();
  };
}

customElements.define('qti-inline-choice-interaction', QtiInlineChoiceInteraction);
