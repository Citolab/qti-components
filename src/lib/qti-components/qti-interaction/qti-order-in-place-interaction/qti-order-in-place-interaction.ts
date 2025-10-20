import { html, css, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DragDropManager, PointerSensor, KeyboardSensor } from '@dnd-kit/dom';
import { Sortable } from '@dnd-kit/dom/sortable';

import { Interaction } from '../../../exports/interaction';
import styles from './qti-order-in-place-interaction.styles';

import type { QtiSimpleChoice } from '../qti-simple-choice';

@customElement('qti-order-interaction-in-place')
export class QtiOrderInPlaceInteraction extends Interaction {
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

    this.choices.forEach(choice => {
      choice.classList.remove('correct-option', 'incorrect-option');
    });

    if (show && responseVariable?.correctResponse) {
      const correctOrder = Array.isArray(responseVariable.correctResponse)
        ? responseVariable.correctResponse
        : [responseVariable.correctResponse];

      this.choices.forEach((choice, index) => {
        const identifier = choice.getAttribute('identifier');
        if (identifier) {
          const isCorrect = correctOrder[index] === identifier;
          choice.classList.add(isCorrect ? 'correct-option' : 'incorrect-option');
        }
      });
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

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.setupTimeout);
    this.cleanup();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction-in-place': QtiOrderInPlaceInteraction;
  }
}
