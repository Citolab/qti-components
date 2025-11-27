import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Interaction, InteractionReviewController } from '@qti-components/base';

import { DragDropInteractionMixin } from '../../mixins/drag-drop';
import styles from './qti-order-interaction.styles';
import { toggleOrderInteractionCorrectResponse } from './qti-order-interaction-review.helpers';

import type { PropertyValueMap } from 'lit';
import type { QtiSimpleChoice } from '../../elements/qti-simple-choice';
@customElement('qti-order-interaction')
export class QtiOrderInteraction extends DragDropInteractionMixin(
  Interaction,
  `qti-simple-choice`,
  'drop-list',
  `slot[part='drags']`
) {
  static override styles = styles;
  protected childrenMap: Element[];

  @state() protected nrChoices: number = 0;
  @state() correctResponses: string[] = [];
  @state() showCorrectResponses: boolean = false;

  /** orientation of choices */
  @property({ type: String })
  public orientation: 'horizontal' | 'vertical';

  constructor() {
    super();
    this.reviewController = new InteractionReviewController(this);
  }

  override render() {
    const choices = Array.from(this.querySelectorAll('qti-simple-choice'));
    if (this.nrChoices < choices.length) {
      this.nrChoices = choices.length;
    }

    return html` <slot name="prompt"> </slot>
      <div part="container">
        <slot part="drags"> </slot>
        <div part="drops">
          ${[...Array(this.nrChoices)].map(
            (_, i) => html`<drop-list role="region" part="drop-list" identifier="droplist${i}"></drop-list>`
          )}
        </div>
      </div>`;
  }

  public override toggleCorrectResponse(show: boolean): void {
    toggleOrderInteractionCorrectResponse(
      {
        responseVariable: this.responseVariable,
        shadowRoot: this.shadowRoot,
        choices: this.querySelectorAll('qti-simple-choice')
      },
      show
    );
  }

  // some interactions have a different way of getting the response
  // this is called from the drag and drop mixin class
  // you have to implement your own getResponse method in the superclass
  // cause they are different for some interactions.
  getValue(val: string[]) {
    return val?.map((v, i) => `${v} droplist${i}`) || [];
  }

  // some interactions have a different way of getting the response
  // this is called from the drag and drop mixin class
  // you have to implement your own getResponse method in the superclass
  // cause they are different for some interactions.
  // MH: is this function called? Shouldn't we use getValue?
  protected getResponse(): string[] {
    const droppables = Array.from<QtiSimpleChoice>(this.shadowRoot.querySelectorAll('drop-list'));

    const response = droppables.map(droppable => {
      const dragsInDroppable = droppable.querySelectorAll('[qti-draggable="true"]');
      const identifiers = Array.from(dragsInDroppable).map(d => d.getAttribute('identifier'));
      return [...identifiers].join(' ');
    });
    return response;
  }

  override async firstUpdated(changedProps: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.firstUpdated(changedProps);
    this.childrenMap = Array.from(this.querySelectorAll('qti-simple-choice'));
    this.childrenMap.forEach(el => el.setAttribute('part', 'qti-simple-choice'));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-order-interaction': QtiOrderInteraction;
  }
}
