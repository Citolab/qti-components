import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Interaction, InteractionReviewController } from '@qti-components/base';

import { DragDropInteractionMixin } from '../../mixins/drag-drop';
import styles from './qti-gap-match-interaction.styles.js';
import {
  toggleGapMatchCandidateCorrection,
  toggleGapMatchCorrectResponse
} from './qti-gap-match-interaction-review.helpers';

import type { CSSResultGroup } from 'lit';
@customElement('qti-gap-match-interaction')
export class QtiGapMatchInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-gap-text',
  'qti-gap',
  `slot[part='drags']`
) {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot name="prompt"> </slot>
      <slot part="drags" name="drags"></slot>
      <slot part="drops"></slot>
      <div role="alert" part="message" id="validation-message"></div>`;
  }

  public override toggleCorrectResponse(show: boolean): void {
    toggleGapMatchCorrectResponse(
      {
        responseVariable: this.responseVariable,
        querySelectorAll: this.querySelectorAll.bind(this),
        querySelector: this.querySelector.bind(this)
      },
      show
    );
  }

  constructor() {
    super();
    this.reviewController = new InteractionReviewController(this);
  }

  public override toggleCandidateCorrection(show: boolean) {
    toggleGapMatchCandidateCorrection(
      {
        responseVariable: this.responseVariable,
        querySelectorAll: this.querySelectorAll.bind(this),
        querySelector: this.querySelector.bind(this)
      },
      show
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-match-interaction': QtiGapMatchInteraction;
  }
}
