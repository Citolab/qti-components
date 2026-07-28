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
 * @customElement qti-gap-match-interaction
 *
 * @attr {string} response-identifier - Required. Identifier of the bound response variable.
 * @attr {number} [max-associations=1] - Maximum gaps that may be filled across the whole
 *   interaction; `0` means unlimited.
 * @attr {number} [min-associations=1] - Minimum filled gaps for a valid response.
 * @attr {boolean} [shuffle=false] - Requests shuffling of the `qti-gap-text` sources. Applied
 *   by the transform pipeline (`qti-transformers`), not by this element.
 * @attr {'qti-choices-top'|'qti-choices-bottom'|'qti-choices-left'|'qti-choices-right'} class -
 *   QTI shared presentation vocabulary positioning the gap-choices container.
 * @attr {boolean} [auto-size-dropzones=false] - Extension, not QTI. Sizes every gap to the
 *   widest chip so placement does not reflow the prose.
 * @attr {boolean} [disable-animations=false] - Extension, not QTI. Disables the FLIP move
 *   animation.
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
