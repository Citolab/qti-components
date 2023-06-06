import { html, LitElement } from 'lit';

export class QtiPrompt extends LitElement {
  override render() {
    return html` <slot></slot> `;
  }

  override connectedCallback(): void {
    // if prompts are in interactions they should have a slot, so the prompt has to go there
    // if prompt is in the body, then just display the prompt there.
    // A better check would be the latter, but not can't get through the shadowroot to find the slot
    const inInteraction = this.parentElement.tagName.endsWith('INTERACTION');
    inInteraction && this.setAttribute('slot', 'prompt');
    // const promptSlot = this.parentElement.shadowRoot.querySelector("[name='prompt']");
  }
}

customElements.define('qti-prompt', QtiPrompt);
