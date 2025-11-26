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

  // @state() choices: QtiSimpleChoice[] = [];
  // private manager: DragDropManager | null = null;
  // private sortableInstances: Map<string, Sortable> = new Map();

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

  public toggleCorrectResponse(show: boolean): void {
    const responseVariable = this.responseVariable;

    this.querySelectorAll('.correct-order-display').forEach(display => display.remove());

    if (show && responseVariable?.correctResponse) {
      const correctOrder = Array.isArray(responseVariable.correctResponse)
        ? responseVariable.correctResponse
        : [responseVariable.correctResponse];

      const correctDisplay = document.createElement('div');
      correctDisplay.classList.add('correct-order-display');
      correctDisplay.style.cssText = `
        margin-top: 16px;
        padding: 12px;
        border: 2px solid var(--qti-correct);
        border-radius: 8px;
        background-color: var(--qti-correct-bg, rgba(46, 125, 50, 0.1));
      `;

      const label = document.createElement('div');
      label.style.cssText = `
        font-weight: bold;
        color: var(--qti-correct);
        margin-bottom: 8px;
        font-size: 0.9em;
      `;
      label.textContent = 'Correct Order:';
      correctDisplay.appendChild(label);

      const correctList = document.createElement('div');
      correctList.style.cssText = `
        display: flex;
        flex-direction: ${this.orientation === 'horizontal' ? 'row' : 'column'};
        gap: 8px;
        ${this.orientation === 'horizontal' ? 'flex-wrap: wrap;' : ''}
      `;

      correctOrder.forEach((identifier, index) => {
        const originalChoice = this.choices.find(choice => choice.getAttribute('identifier') === identifier);

        if (originalChoice) {
          const correctChoice = document.createElement('span');
          correctChoice.classList.add('correct-choice-display');
          correctChoice.style.cssText = `
            padding: 8px 12px;
            border: 1px solid var(--qti-correct);
            border-radius: 4px;
            background-color: white;
            display: inline-block;
            position: relative;
          `;

          const orderNumber = document.createElement('span');
          orderNumber.style.cssText = `
            position: absolute;
            top: -8px;
            left: -8px;
            background-color: var(--qti-correct);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8em;
            font-weight: bold;
          `;
          orderNumber.textContent = (index + 1).toString();
          correctChoice.appendChild(orderNumber);

          const content = document.createElement('span');
          content.textContent = originalChoice.textContent?.trim() || '';
          correctChoice.appendChild(content);

          correctList.appendChild(correctChoice);
        }
      });

      correctDisplay.appendChild(correctList);
      this.appendChild(correctDisplay);
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
    const forceNonInteractive = this.disabled || this.readonly;

    this.choices.forEach(choice => {
      if (this.disabled) {
        choice.setAttribute('aria-disabled', 'true');
      } else {
        choice.removeAttribute('aria-disabled');
      }

      if (this.readonly) {
        choice.setAttribute('aria-readonly', 'true');
      } else {
        choice.removeAttribute('aria-readonly');
      }

      // Remove tabindex in readonly/disabled mode to prevent focus
      if (forceNonInteractive) {
        choice.setAttribute('tabindex', '-1');
      } else {
        choice.setAttribute('tabindex', '0');
      }

      choice.style.cursor = forceNonInteractive ? 'default' : 'grab';
      choice.style.userSelect = forceNonInteractive ? 'auto' : 'none';
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
