import { html } from 'lit';
import { state } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

// import { DragDropInteractionMixin } from '@qti-components/interactions-core/mixins/drag-drop';
import styles from './qti-associate-interaction.styles';

import type { QtiSimpleAssociableChoice } from '@qti-components/interactions-core/elements/qti-simple-associable-choice';
import type { CSSResultGroup } from 'lit';
const SlottedBase = DragDropSlottedMixin(
  Interaction,
  'qti-simple-associable-choice',
  '.dl',
  `slot[name='qti-simple-associable-choice']`,
  'pointerWithin'
);

export class QtiAssociateInteraction extends DragDropSlottedSortableMixin(SlottedBase, '[qti-draggable="true"]') {
  static override styles: CSSResultGroup = styles;
  @state() protected _childrenMap: Element[] = [];

  protected _registerChoiceHandler: (event: CustomEvent) => void;

  constructor() {
    super();
    this._registerChoiceHandler = this._registerChoice.bind(this);
    this.addEventListener('register-qti-simple-associable-choice', this._registerChoiceHandler);
  }

  protected _registerChoice(event: CustomEvent) {
    // Use composedPath()[0] to get the actual origin — event.target is retargeted to `this`
    // when a composed event crosses the shadow DOM boundary, making it useless for filtering.
    const origin = event.composedPath()[0] as HTMLElement;
    // Ignore clones placed in shadow DOM drop zones — only register light DOM choices
    if (this.shadowRoot?.contains(origin)) return;
    const choice = origin as QtiSimpleAssociableChoice;
    if (!this._childrenMap.includes(choice)) {
      this._childrenMap = [...this._childrenMap, choice];
    }
  }

  protected getResponse(): string[] {
    const pairCount = Math.ceil(this._childrenMap.length / 2);
    const response: string[] = [];
    for (let i = 0; i < pairCount; i++) {
      const leftDrop = this.shadowRoot?.querySelector(`.dl[identifier="droplist${i}_left"]`);
      const rightDrop = this.shadowRoot?.querySelector(`.dl[identifier="droplist${i}_right"]`);
      const leftId = leftDrop?.querySelector('[qti-draggable="true"]')?.getAttribute('identifier');
      const rightId = rightDrop?.querySelector('[qti-draggable="true"]')?.getAttribute('identifier');
      if (leftId && rightId) {
        response.push(`${leftId} ${rightId}`);
      }
    }
    return response;
  }

  getValue(val: string[]) {
    return (
      val?.flatMap((pair, i) => {
        const parts = pair.split(' ');
        if (parts.length !== 2) return [];
        return [`${parts[0]} droplist${i}_left`, `${parts[1]} droplist${i}_right`];
      }) ?? []
    );
  }

  override render() {
    return html` <slot name="prompt"></slot>
      <slot name="qti-simple-associable-choice"></slot>
      <div part="drop-container">
        ${this._childrenMap.length > 0 &&
        Array.from(Array(Math.ceil(this._childrenMap.length / 2)).keys()).map(
          (_, index) =>
            html`<div part="associables-container">
              <div name="left${index}" part="drop-list" class="dl" identifier="droplist${index}_left"></div>
              <div name="right${index}" part="drop-list" class="dl" identifier="droplist${index}_right"></div>
            </div>`
        )}

        <div role="alert" part="message" id="validation-message"></div>
      </div>`;
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('_childrenMap')) {
      this.cacheInteractiveElements();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('register-qti-simple-associable-choice', this._registerChoiceHandler);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-associate-interaction': QtiAssociateInteraction;
  }
}
