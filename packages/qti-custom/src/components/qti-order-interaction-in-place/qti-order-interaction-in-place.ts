import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Interaction, InteractionReviewController } from '@qti-components/base';
import { watch } from '@qti-components/utilities';
import {
  DragDropSortableMixin,
  VerticalListSortingStrategy,
  HorizontalListSortingStrategy
} from '@qti-components/interactions';

import styles from './qti-order-interaction-in-place.styles';

import type { ComputedContext } from '@qti-components/base';
import type { PropertyValueMap } from 'lit';
import type { QtiSimpleChoice } from '@qti-components/interactions';

// Create strategy instances for reuse
const verticalStrategy = new VerticalListSortingStrategy();
const horizontalStrategy = new HorizontalListSortingStrategy();

@customElement('qti-order-interaction-in-place')
export class QtiOrderInteractionInPlace extends DragDropSortableMixin(
  Interaction,
  'qti-simple-choice',
  `slot[part="drags"]`,
  verticalStrategy
) {
  static styles = [styles];

  @property({ attribute: 'orientation', reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  @property({ type: Number, attribute: 'data-choices-container-width' }) choiceWidth = 200;

  @property({ type: Boolean, attribute: 'disable-animations' })
  set disableAnimations(value: boolean) {
    (this as any).enableFlipAnimations = !value;
  }
  get disableAnimations(): boolean {
    return !(this as any).enableFlipAnimations;
  }

  @watch('orientation')
  _handleOrientationChange(_oldValue: 'vertical' | 'horizontal', newValue: 'vertical' | 'horizontal') {
    // Dynamically switch sorting strategy based on orientation
    (this as any).strategy = newValue === 'horizontal' ? horizontalStrategy : verticalStrategy;
  }

  @watch('choiceWidth') _handleTestElementChange(_oldValue: ComputedContext, newValue: ComputedContext) {
    if (newValue != null) {
      this.style.setProperty('--choice-width', `${newValue}px`);
    } else {
      this.style.removeProperty('--choice-width');
    }
  }

  constructor() {
    super();
    this.reviewController = new InteractionReviewController(this);
  }

  override render() {
    return html`
      <slot name="prompt"></slot>
      <slot part="drags"></slot>
    `;
  }

  private get choices(): QtiSimpleChoice[] {
    return this.trackedDraggables as QtiSimpleChoice[];
  }

  public async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const prompt = this.querySelector('qti-prompt');
    if (prompt) {
      prompt.setAttribute('slot', 'prompt');
    }
  }

  public override afterCache(): void {
    super.afterCache();
    this.applyInteractivityChanges();
  }

  protected override updated(changedProps: PropertyValueMap<any>) {
    super.updated(changedProps);

    if (changedProps.has('disabled') || changedProps.has('readonly')) {
      this.applyInteractivityChanges();
    }
  }

  public override validate(): boolean {
    return this.choices.length > 0;
  }

  override async firstUpdated(changedProps: any) {
    super.firstUpdated(changedProps);

    // Wait for drag-drop initialization to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    this.applyInteractivityChanges();
    this.saveResponse();
  }

  private applyInteractivityChanges() {
    this.choices.forEach(choice => {
      choice.disabled = this.disabled;
      choice.readonly = this.readonly;
    });
  }

  public override toggleCandidateCorrection(show: boolean): void {
    const responseVariable = this.responseVariable;

    if (!responseVariable?.correctResponse) {
      return;
    }

    const correctOrder = Array.isArray(responseVariable.correctResponse)
      ? responseVariable.correctResponse
      : [responseVariable.correctResponse];

    // Clear existing candidate states from all choices
    this.choices.forEach(choice => {
      if (choice.internals) {
        choice.internals.states.delete('candidate-correct');
        choice.internals.states.delete('candidate-incorrect');
      }
      choice.removeAttribute('candidate-correct');
      choice.removeAttribute('candidate-incorrect');
    });

    if (!show) {
      return;
    }

    // For order interactions, we compare the current DOM order with the correct order
    this.choices.forEach((choice, index) => {
      const identifier = choice.getAttribute('identifier');
      if (identifier && index < correctOrder.length) {
        const isCorrectPosition = correctOrder[index] === identifier;

        if (isCorrectPosition) {
          if (choice.internals) {
            choice.internals.states.add('candidate-correct');
          }
          choice.setAttribute('candidate-correct', '');
        } else {
          if (choice.internals) {
            choice.internals.states.add('candidate-incorrect');
          }
          choice.setAttribute('candidate-incorrect', '');
        }
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction-in-place': QtiOrderInteractionInPlace;
  }
}
