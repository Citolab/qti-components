import { html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DragDropManager, PointerSensor, KeyboardSensor } from '@dnd-kit/dom';
import { Sortable } from '@dnd-kit/dom/sortable';

import { Interaction } from '@qti-components/base';

import styles from './qti-order-interaction-in-place.styles';

import type { QtiSimpleChoice } from '@qti-components/interactions';

@customElement('qti-order-interaction-in-place')
export class QtiOrderInteractionInPlace extends Interaction {
  static styles = [
    css`
      ${unsafeCSS(styles)}
    `
  ];

  @property({ attribute: 'orientation', reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  choices: QtiSimpleChoice[] = [];
  private manager: DragDropManager | null = null;
  private sortableInstances: Map<string, Sortable> = new Map();

  override render() {
    return html`
      <slot name="prompt"></slot>
      <div part="container">
        <div part="items-container" class="sortable-container" orientation="${this.orientation}">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }

  private setupTimeout: any;
  private isSetupComplete = false;
  private isDragging = false;

  private handleSlotChange() {
    // Don't setup during drag operations or if already set up
    if (this.isDragging || this.isSetupComplete) {
      return;
    }

    // Simple debounced setup
    clearTimeout(this.setupTimeout);
    this.setupTimeout = setTimeout(() => this.setupSortable(), 0);
  }

  private async setupSortable() {
    await this.updateComplete;

    // Don't setup if already complete
    if (this.isSetupComplete) {
      return;
    }

    // Clean up previous instances
    this.cleanup();

    // Get the slotted qti-simple-choice elements
    this.choices = Array.from(this.querySelectorAll('qti-simple-choice')) as QtiSimpleChoice[];

    if (this.choices.length === 0) {
      return;
    }

    // Create the drag drop manager with touch and keyboard support
    this.manager = new DragDropManager({
      sensors: [
        PointerSensor.configure({
          activationConstraints: {
            distance: {
              value: 5
            },
            delay: {
              value: 200,
              tolerance: 10
            }
          }
        }),
        KeyboardSensor.configure({
          keyboardCodes: {
            start: ['Space', 'Enter'],
            cancel: ['Escape'],
            end: ['Space', 'Enter'],
            up: ['ArrowUp'],
            down: ['ArrowDown'],
            left: ['ArrowLeft'],
            right: ['ArrowRight']
          }
        })
      ]
    });

    // Listen for drag start/end to track dragging state
    this.manager.monitor.addEventListener('dragstart', event => {
      this.isDragging = true;
      // Add dragging class to the element being dragged
      const source = event.operation?.source;
      if (source?.element) {
        source.element.classList.add('dragging');
      }
    });

    this.manager.monitor.addEventListener('dragend', () => {
      this.isDragging = false;
      // Remove dragging class from all elements
      this.choices.forEach(choice => {
        choice.classList.remove('dragging');
      });

      // Update choices order after drag
      requestAnimationFrame(() => {
        this.updateChoicesOrder();
      });
    });

    // Set up each choice as sortable
    this.choices.forEach((choice, index) => {
      this.setupChoiceAsSortable(choice, index);
    });

    // Apply uniform width to all choices
    this.applyUniformWidth();

    this.isSetupComplete = true;
  }

  private applyUniformWidth() {
    if (this.choices.length === 0) return;

    // Reset any previous width constraints to get natural widths
    this.choices.forEach(choice => {
      choice.style.width = '';
    });

    // Force a layout recalculation by accessing offsetWidth
    void this.choices[0].offsetWidth;

    // Find the maximum width among all choices
    let maxWidth = 0;
    this.choices.forEach(choice => {
      const width = choice.getBoundingClientRect().width;
      maxWidth = Math.max(maxWidth, width);
    });

    // Apply the maximum width to all choices
    this.choices.forEach(choice => {
      choice.style.width = `${maxWidth}px`;
    });
  }

  private setupChoiceAsSortable(choice: QtiSimpleChoice, index: number) {
    const identifier = choice.getAttribute('identifier') || `choice-${index}`;

    if (!this.manager) return;

    const sortable = new Sortable(
      {
        id: identifier,
        element: choice,
        index: index,
        data: { choice, identifier },
        transition: null
      },
      this.manager
    );

    this.sortableInstances.set(identifier, sortable);

    choice.style.cursor = 'grab';
    choice.style.userSelect = 'none';
  }

  private updateChoicesOrder() {
    // Get the updated choices in their new DOM order
    this.choices = Array.from(this.querySelectorAll('qti-simple-choice')) as QtiSimpleChoice[];

    this.applyUniformWidth();
    this.saveResponse(this.getResponseValue());
  }

  private cleanup() {
    this.sortableInstances.forEach(sortable => {
      sortable.destroy();
    });
    this.sortableInstances.clear();

    if (this.manager) {
      this.manager.destroy();
      this.manager = null;
    }

    this.isSetupComplete = false;
  }

  public toggleCorrectResponse(show: boolean): void {
    const responseVariable = this.responseVariable;

    // Always start by removing old correct answer display
    this.querySelectorAll('.correct-order-display').forEach(display => display.remove());

    if (show && responseVariable?.correctResponse) {
      const correctOrder = Array.isArray(responseVariable.correctResponse)
        ? responseVariable.correctResponse
        : [responseVariable.correctResponse];

      // Create a container for the correct order display
      const correctDisplay = document.createElement('div');
      correctDisplay.classList.add('correct-order-display');
      correctDisplay.style.cssText = `
        margin-top: 16px;
        padding: 12px;
        border: 2px solid var(--qti-correct);
        border-radius: 8px;
        background-color: var(--qti-correct-bg, rgba(46, 125, 50, 0.1));
      `;

      // Add a label
      const label = document.createElement('div');
      label.style.cssText = `
        font-weight: bold;
        color: var(--qti-correct);
        margin-bottom: 8px;
        font-size: 0.9em;
      `;
      label.textContent = 'Correct Order:';
      correctDisplay.appendChild(label);

      // Create the correct order list
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

          // Add order number
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

          // Add choice content
          const content = document.createElement('span');
          content.textContent = originalChoice.textContent?.trim() || '';
          correctChoice.appendChild(content);

          correctList.appendChild(correctChoice);
        }
      });

      correctDisplay.appendChild(correctList);

      // Insert the correct display after the interaction
      this.appendChild(correctDisplay);
    }
  }

  private getResponseValue(): string[] {
    return this.choices.map(choice => choice.getAttribute('identifier') || '').filter(Boolean);
  }

  // Required abstract methods from Interaction base class
  get response(): string[] {
    return this.getResponseValue();
  }

  set response(value: string | string[] | null) {
    if (Array.isArray(value) && value.length > 0) {
      this.setResponseOrder(value);
    }
  }

  validate(): boolean {
    // Basic validation - ensure we have choices
    return this.choices.length > 0;
  }

  override async firstUpdated(changedProps: any) {
    super.firstUpdated(changedProps);
    await this.setupSortable();
  }

  private setResponseOrder(identifiers: string[]) {
    // Reorder choices in the light DOM based on identifiers
    identifiers.forEach(identifier => {
      const choice = this.choices.find(c => c.getAttribute('identifier') === identifier);
      if (choice) {
        // Move to end of container
        this.appendChild(choice);
      }
    });

    // Update our choices array
    this.choices = Array.from(this.querySelectorAll('qti-simple-choice')) as QtiSimpleChoice[];

    // Force a setup reset since DOM order changed
    this.forceSetupReset();
  }

  /**
   * Force a complete reset of the sortable setup.
   * Useful when the DOM structure changes programmatically.
   */
  private forceSetupReset() {
    this.isSetupComplete = false;
    this.cleanup();
    setTimeout(() => this.setupSortable(), 0);
  }

  public override toggleCandidateCorrection(show: boolean): void {
    const responseVariable = this.responseVariable;

    if (!responseVariable?.correctResponse) {
      return;
    }

    // Always get fresh choices from DOM in current order
    this.choices = Array.from(this.querySelectorAll('qti-simple-choice')) as QtiSimpleChoice[];

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
    clearTimeout(this.setupTimeout);
    this.cleanup();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction-in-place': QtiOrderInteractionInPlace;
  }
}
