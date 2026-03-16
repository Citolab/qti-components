import { css, html } from 'lit';

import { Interaction } from '@qti-components/base';
export class QtiUploadInteraction extends Interaction {
  #file: File | null = null;
  #base64: string | null = null;

  override reset() {
    this.#file = null;
    this.#base64 = null;
    this.saveResponse(null);
  }

  validate(): boolean {
    return this.#base64 !== null; // Ensure the Base64 string is set
  }

  get response(): string | null {
    return this.#base64; // Return the Base64 string
  }

  set response(base64: string | null) {
    if (typeof base64 === 'string') {
      this.#base64 = base64;
      this.saveResponse(base64); // Save Base64 string as the response
    } else if (base64 === null) {
      this.reset();
    } else {
      throw new Error('Value must be a Base64-encoded string or null');
    }
  }

  static override get properties() {
    return {
      ...Interaction.properties
    };
  }

  static override styles = [
    css`
      :host {
        display: block;
        margin: 1em 0;
      }
      input[type='file'] {
        display: block;
        margin-top: 0.5em;
      }
    `
  ];

  override render() {
    return html`
      <div>
        <slot name="prompt"></slot>
        <input type="file" @change="${this.#onFileChange}" ?disabled="${this.disabled}" ?readonly="${this.readonly}" />
      </div>
    `;
  }

  async #onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.#file = input.files[0];
      this.#base64 = await this.#convertToBase64(this.#file);
      this.saveResponse(this.#base64); // Save the Base64 string
      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          detail: { response: this.#base64 }
        })
      );
    }
  }

  #convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file); // Converts to Base64
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-upload-interaction': QtiUploadInteraction;
  }
}
