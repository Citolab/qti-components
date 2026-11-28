import { html } from 'lit';

import { Interaction } from '@qti-components/base';

/**
 * The example from the "Creating an extended interaction" guide: a rating from 1 to 5. It is a real
 * subclass of `Interaction`, imported the way a host imports it (`@citolab/qti-components/qti-base`),
 * and it is the only thing the guide asks you to write. It lives in its own file, not in the story,
 * so the guide's code is what the story runs.
 */
export class ExampleRatingInteraction extends Interaction {
  #rating = '';

  /** Is the interaction in a valid state? The item asks, and publishes the verdict. */
  validate(): boolean {
    return this.#rating !== '';
  }

  get response(): string | null {
    return this.#rating || null;
  }

  /** Called with a value restored or assigned from outside. Never for the candidate's own answer. */
  set response(value: string | string[] | null) {
    this.#rating = typeof value === 'string' ? value : '';
    this.internals.setFormValue(this.#rating || null);
    this.requestUpdate();
  }

  /** Your own UI calls this when the candidate answers. */
  #rate(rating: string) {
    this.#rating = rating;
    this.internals.setFormValue(rating);
    this.saveResponse(rating);
    this.requestUpdate();
  }

  override render() {
    return html`
      <div role="group" aria-label="Rating">
        ${['1', '2', '3', '4', '5'].map(
          rating => html`
            <button
              type="button"
              aria-pressed=${String(this.#rating === rating)}
              ?disabled=${this.disabled}
              @click=${() => this.#rate(rating)}
            >
              ${rating}
            </button>
          `
        )}
      </div>
    `;
  }
}

if (!customElements.get('example-rating-interaction')) {
  customElements.define('example-rating-interaction', ExampleRatingInteraction);
}
