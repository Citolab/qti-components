import { CSSResultGroup, html, PropertyValues } from 'lit';
import { customElement } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { Interaction } from '../internal/interaction/interaction';
import styles from './qti-gap-match-interaction.styles';
@customElement('qti-gap-match-interaction')
export class QtiGapMatchInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-gap-text',
  'qti-gap',
  `slot[part='drags']`
) {
  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  static styles: CSSResultGroup = styles;

  override render() {
    return html`<slot name="prompt"> </slot>
      <slot part="drags" name="drags"></slot>
      <slot part="drops"></slot>
      <div role="alert" id="validationMessage"></div>`;
  }

  override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.updateMinDimensionsForDrowZones();

    // MutationObserver to observe changes in child elements
    this.observer = new MutationObserver(() => this.updateMinDimensionsForDrowZones());
    this.observer.observe(this, { childList: true, subtree: true });

    // ResizeObserver to monitor size changes of `gapTexts`
    this.resizeObserver = new ResizeObserver(() => this.updateMinDimensionsForDrowZones());
    const gapTexts = this.querySelectorAll('qti-gap-text');
    gapTexts.forEach(gapText => this.resizeObserver?.observe(gapText));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Cleanup MutationObserver
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Cleanup ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private updateMinDimensionsForDrowZones() {
    const gapTexts = this.querySelectorAll('qti-gap-text');
    const gaps = this.querySelectorAll('qti-gap');
    let maxHeight = 0;
    let maxWidth = 0;
    gapTexts.forEach(gapText => {
      const rect = gapText.getBoundingClientRect();
      maxHeight = Math.max(maxHeight, rect.height);
      maxWidth = Math.max(maxWidth, rect.width);
    });

    const dragSlot = this.shadowRoot?.querySelector('[part="drags"]') as HTMLElement;
    if (dragSlot) {
      dragSlot.style.minHeight = `${maxHeight}px`;
      dragSlot.style.minWidth = `${maxWidth}px`;
    }
    for (const gap of gaps) {
      gap.style.minHeight = `${maxHeight}px`;
      gap.style.minWidth = `${maxWidth}px`;
    }
  }

  set correctResponse(value: string | string[]) {
    let matches: { text: string; gap: string }[] = [];
    const response = Array.isArray(value) ? value : [value];

    if (response) {
      matches = response.map(x => {
        const split = x.split(' ');
        return { text: split[0], gap: split[1] };
      });
    }

    const gaps = this.querySelectorAll('qti-gap');
    gaps.forEach(gap => {
      const identifier = gap.getAttribute('identifier');
      const textIdentifier = matches.find(x => x.gap === identifier)?.text;
      const text = this.querySelector(`qti-gap-text[identifier="${textIdentifier}"]`)?.textContent.trim();
      if (textIdentifier && text) {
        if (!gap.nextElementSibling?.classList.contains('correct-option')) {
          const textSpan = document.createElement('span');
          textSpan.classList.add('correct-option');
          textSpan.textContent = text;
          gap.insertAdjacentElement('afterend', textSpan);
        }
      } else if (gap.nextElementSibling?.classList.contains('correct-option')) {
        gap.nextElementSibling.remove();
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-match-interaction': QtiGapMatchInteraction;
  }
}
