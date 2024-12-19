import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';

@customElement('qti-upload-interaction')
export class QtiUploadInteraction extends Interaction {
  private _file: File | null = null;
  private _base64: string | null = null;

  reset() {
    this._file = null;
    this._base64 = null;
    this.saveResponse(null);
  }

  validate(): boolean {
    return this._base64 !== null; // Ensure the Base64 string is set
  }

  get value(): string | string[] | null {
    return this._base64; // Return the Base64 string
  }

  set value(base64: string | null) {
    if (typeof base64 === 'string') {
      this._base64 = base64;
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
        <input type="file" @change="${this._onFileChange}" ?disabled="${this.disabled}" ?readonly="${this.readonly}" />
      </div>
    `;
  }

  private async _onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this._file = input.files[0];
      this._base64 = await this._convertToBase64(this._file);
      this.saveResponse(this._base64); // Save the Base64 string
      this.dispatchEvent(
        new CustomEvent('qti-interaction-response', {
          detail: { response: this._base64 }
        })
      );
    }
  }

  private _convertToBase64(file: File): Promise<string> {
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
