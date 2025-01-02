import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';
import { IMSpci, ModuleResolutionConfig, QtiVariableJSON } from './interface';

declare const requirejs: any;
declare const define: any;

@customElement('qti-portable-custom-interaction')
export class QtiPortableCustomInteraction extends Interaction {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private rawResponse: string = '';
  private pci: IMSpci<unknown>;

  @property({ type: String, attribute: 'module' })
  module!: string;

  @property({ type: String, attribute: 'custom-interaction-type-identifier' })
  customInteractionTypeIdentifier!: string;

  @state()
  private _errorMessage: string | null = null;

  private convertQtiVariableJSON(input: QtiVariableJSON): string | string[] | null {
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const nestedObject = input[key as 'list' | 'base'];
        if (nestedObject) {
          for (const nestedKey in nestedObject) {
            if (Object.prototype.hasOwnProperty.call(nestedObject, nestedKey)) {
              const value = nestedObject[nestedKey as keyof typeof nestedObject];
              return Array.isArray(value) ? value.map(String) : value ? String(value) : null;
            }
          }
        }
      }
    }
    return null;
  }

  private startChecking(): void {
    this.intervalId = setInterval(() => {
      const response = this.pci.getResponse();
      const stringifiedResponse = JSON.stringify(response);

      if (stringifiedResponse !== this.rawResponse) {
        this.rawResponse = stringifiedResponse;
        const value = this.convertQtiVariableJSON(response);
        this.saveResponse(value);
      }
    }, 200);
  }

  private stopChecking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  validate(): boolean {
    return true; // Add validation logic here if necessary
  }

  set value(_: string | string[]) {
    // No direct state setting supported
  }

  get value(): string | string[] {
    return this.rawResponse;
  }

  private registerPCI(pci: IMSpci<unknown>): void {
    this.pci = pci;

    const dom = this.querySelector('qti-interaction-markup') as HTMLElement | null;
    if (!dom) {
      this._errorMessage = 'Required DOM element not found';
      return;
    }

    dom.classList.add('qti-customInteraction');

    const config = {
      properties: this.dataset,
      onready: () => console.log('PCI ready')
    };

    pci.getInstance(dom, config, undefined);

    this.startChecking();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (!globalThis.require) {
      this._errorMessage = 'RequireJS is not available. Please include it via CDN.';
      return;
    }

    const baseUrl = this.dataset.baseUrl || '/';
    const requireConfig: ModuleResolutionConfig = {
      context: this.customInteractionTypeIdentifier,
      baseUrl,
      catchError: true,
      paths: window['requirePaths'] || {},
      shim: window['requireShim'] || {}
    };

    const requirePCI = requirejs.config(requireConfig);

    requirePCI(['require'], require => {
      if (!require.defined('qtiCustomInteractionContext')) {
        define('qtiCustomInteractionContext', () => ({
          register: (ctx: IMSpci<unknown>) => this.registerPCI(ctx)
        }));
      }

      // eslint-disable-next-line import/no-dynamic-require
      require([this.module], (pci: IMSpci<unknown>) => {
        this.registerPCI(pci);
      }, (error: any) => {
        this._errorMessage = `Error loading PCI module: ${error.message}`;
      });
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopChecking();
    requirejs.undef(this.customInteractionTypeIdentifier);
    delete requirejs.s.contexts[this.customInteractionTypeIdentifier];
  }

  override render() {
    return html`
      <slot></slot>
      ${this._errorMessage
        ? html`
            <div style="color: red;">
              <h1>Error</h1>
              <p>${this._errorMessage}</p>
            </div>
          `
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-portable-custom-interaction': QtiPortableCustomInteraction;
  }
}
