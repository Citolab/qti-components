import { html } from 'lit';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

// import { DragDropInteractionMixin } from '@qti-components/interactions-core/mixins/drag-drop/drag-drop-interaction-mixin.js';
import styles from './qti-gap-match-interaction.styles.js';

import type { CSSResultGroup } from 'lit';
/**
 * Drag-and-drop gap-match interaction: candidates drag choices into gap targets.
 *
 * @slot prompt - The prompt shown above the interaction.
 * @slot drags - The draggable choice sources.
 * @slot - Default slot for the drop targets (gaps).
 *
 * @csspart drags - Wrapper around the drag sources slot.
 * @csspart drops - Wrapper around the drop targets slot.
 * @csspart message - Live validation message region (role="alert").
 */
export class QtiGapMatchInteraction extends DragDropSlottedSortableMixin(
  DragDropSlottedMixin(Interaction, 'qti-gap-text', 'qti-gap', `slot[part~='drags']`),
  '[qti-draggable="true"]'
) {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot name="prompt"> </slot>
      <slot part="drags" name="drags"></slot>
      <slot part="drops"></slot>
      <div role="alert" part="message" id="validation-message"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-match-interaction': QtiGapMatchInteraction;
  }
}
