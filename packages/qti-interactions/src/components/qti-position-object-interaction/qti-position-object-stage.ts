import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { PropertyValueMap } from 'lit';

@customElement('qti-position-object-stage')
export class QtiPositionObjectStage extends LitElement {
  choiceOrdering: boolean;
  startX: any;
  startY: any;
  dragElement: any;

  override render() {
    return html`<slot></slot>`;
  }

  static override styles = [
    css`
      :host {
        display: inline-block;
        position: relative;
      }
    `
  ];

  constructor() {
    super();
    this.removeMoveListener = this.removeMoveListener.bind(this);
    this.dragElementHandler = this.dragElementHandler.bind(this);
  }

  // Define a function to handle the mousemove event on the draggable element
  dragElementHandler(event: MouseEvent): void {
    event.preventDefault();

    // Calculate the distance the mouse has moved since the last event
    const deltaX: number = event.clientX - this.startX;
    const deltaY: number = event.clientY - this.startY;

    // Update the position of the draggable element
    this.dragElement.style.left = this.dragElement.offsetLeft + deltaX + 'px';
    this.dragElement.style.top = this.dragElement.offsetTop + deltaY + 'px';

    // Update the starting position of the mouse
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  override firstUpdated(a: PropertyValueMap<any>): void {
    super.firstUpdated(a);

    // Get the draggable and drop zone elements
    this.dragElement = this.querySelector('qti-position-object-interaction>img');
    // const canvasElement = document.getElementById('canvas');

    // Initialize variables for the starting position of the draggable element
    this.startX = 0;
    this.startY = 0;

    // Add a mousedown event listener to the draggable element
    this.dragElement.addEventListener('mousedown', (event: MouseEvent) => {
      // Save the starting position of the mouse
      this.startX = event.clientX;
      this.startY = event.clientY;

      // Add a mousemove event listener to the document
      document.addEventListener('mousemove', this.dragElementHandler, true);
    });
    document.addEventListener('mouseup', this.removeMoveListener);
  }

  removeMoveListener() {
    document.removeEventListener('mousemove', this.dragElementHandler, true);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('mousemove', this.dragElementHandler);
    document.removeEventListener('mouseup', this.removeMoveListener);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-position-object-stage': QtiPositionObjectStage;
  }
}
