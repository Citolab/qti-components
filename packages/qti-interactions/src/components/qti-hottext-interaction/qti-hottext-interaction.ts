import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';

import { ChoicesMixin } from '../../mixins/choices/choices.mixin';

import type { PropertyValues } from 'lit';
export class QtiHottextInteraction extends ChoicesMixin(Interaction, 'qti-hottext') {
  @property({ type: String, reflect: true })
  class = '';

  // NOTE: there is no way to get the variant with radiobuttons or checkboxes
  // as the QTI standard does not define a way to specify this.
  // The default is to not show any radio or checkbox buttons just like amp-up does.
  // If they should be shown in the future, we should make a configuration option for it.
  get #classObject() {
    const classes: { [key: string]: boolean } = {
      'qti-input-control-hidden': true
    };

    if (this.class) {
      this.class.split(' ').forEach(className => {
        if (className.trim()) {
          classes[className.trim()] = true;
        }
      });
    }

    return classes;
  }

  override render = () =>
    html`<slot></slot>
      <div part="message" role="alert" id="validation-message"></div>`;

  override connectedCallback() {
    super.connectedCallback();
    this.#updateHostClasses();
  }

  override updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
    this.#updateHostClasses();
  }

  #updateHostClasses() {
    // Clear existing classes and apply merged ones
    const classString = Object.keys(this.#classObject).join(' ');
     
    this.className = classString;
  }
}
