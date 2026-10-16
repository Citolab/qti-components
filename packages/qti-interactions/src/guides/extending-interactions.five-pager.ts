import { html } from 'lit';

import { QtiSliderInteraction } from '@qti-components/slider-interaction';

/**
 * The second example from the "Creating an extended interaction" guide: a slider that shows its values as a
 * row of buttons. It subclasses `QtiSliderInteraction`, so `validate`, `response`, the bounds, form
 * participation and `readonly`/`disabled` are inherited; it only replaces what is drawn.
 *
 * The item author asks for it in plain QTI, `<qti-slider-interaction class="type:five-pager">`,
 * and the host's transformer renames the element to `qti-slider-interaction-five-pager`
 * (`extendElementsWithClass('type')`). The XML stays valid QTI; only the host knows about the class.
 */
export class QtiSliderInteractionFivePager extends QtiSliderInteraction {
  override connectedCallback() {
    super.connectedCallback();
    // The slider makes the host a focusable `role=slider`; here the buttons are what is focusable.
    this.setAttribute('role', 'group');
    this.removeAttribute('tabindex');
  }

  /**
   * The slider's drag logic is private, so a subclass publishes the way any interaction does:
   * show the value through the `response` setter, then `saveResponse` it.
   */
  #pick(value: string) {
    this.response = value;
    this.saveResponse(value);
  }

  override render() {
    const values: string[] = [];
    for (let v = this.min; v <= this.max; v += this.step) values.push(String(v));
    return html`
      <slot name="prompt"></slot>
      <div part="slider">
        ${values.map(
          value => html`
            <button
              type="button"
              part="page"
              aria-pressed=${String(this.response === value)}
              ?disabled=${this.disabled}
              @click=${() => this.#pick(value)}
            >
              ${value}
            </button>
          `
        )}
      </div>
    `;
  }
}

if (!customElements.get('qti-slider-interaction-five-pager')) {
  customElements.define('qti-slider-interaction-five-pager', QtiSliderInteractionFivePager);
}
