import { LitElement, html } from 'lit';

declare const requirejs: any;
declare const define: any;
export class QtiPortableCustomInteraction extends LitElement {
  private responseIdentifier: string;
  private module: string;
  private customInteractionTypeIdentifier: string;
  private baseUrl: string;
  private _errorMessage: string = null;

  static override get properties() {
    return {
      responseIdentifier: {
        type: String,
        attribute: 'response-identifier'
      },
      module: { type: String, attribute: 'module' },
      customInteractionTypeIdentifier: {
        type: String,
        attribute: 'custom-interaction-type-identifier'
      },
      baseUrl: {
        type: String,
        attribute: 'base-url'
      },
      _errorMessage: {
        type: String,
        state: true
      }
    };
  }

  getTAOConfig(node): {} | void {
    const a = node.querySelectorAll('properties');
    let config = {};

    const getPropertyValue = el => {
      const property = {};
      const key = el.getAttribute('key');
      if (key) {
        const children = Array.from(el.children);
        const allKey = children.map((c: HTMLElement) => c.getAttribute('key'));
        const isArray = allKey.length > 0 && !allKey.find(k => !Number.isInteger(+k));
        if (isArray) {
          property[key] = children.map(c => getChildProperties(c));
        } else {
          property[key] = el.textContent;
        }
      }
      return property;
    };

    const getChildProperties = (el): {} | void => {
      if (el) {
        let properties = {};
        for (const child of el.children) {
          properties = { ...properties, ...getPropertyValue(child) };
        }
        return properties;
      }
    };

    for (const properties of a) {
      const key = properties.getAttribute('key');
      if (!key) {
        config = { ...config, ...getChildProperties(properties) };
      }
      return config;
    }
    console.log('Can not find qti-custom-interaction config');
  }

  register(item) {
    const type = this.parentElement.tagName === 'QTI-CUSTOM-INTERACTION' ? 'TAO' : 'IMS';

    const dom = type == 'IMS' ? this.querySelector('qti-interaction-markup') : this.querySelector('markup');
    dom.classList.add('qti-customInteraction');

    if (type == 'TAO' && this.querySelector('properties')) {
      (this.querySelector('properties') as HTMLElement).style.display = 'none';
    }

    const config =
      type == 'IMS'
        ? {
            properties: this.dataset
          }
        : this.getTAOConfig(this);

    type == 'IMS'
      ? item.getInstance(dom, config, undefined)
      : item.initialize(this.customInteractionTypeIdentifier, dom.firstElementChild, config);

    if (type == 'TAO') {
      const links = Array.from(this.querySelectorAll('link')).map(acc => acc.getAttribute('href'));
      links.forEach(link => {
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.type = 'text/css';
        styles.media = 'screen';
        styles.href = link;
        dom.appendChild(styles);
      });
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const requireConfig = {
      context: this.customInteractionTypeIdentifier,
      baseUrl: this.baseUrl,
      catchError: true
    };
    // pk: c'est tres ugly.. typescript whyunospread add props?!?
    if (window['requirePaths'] && window['requireShim']) {
      requireConfig['paths'] = window['requirePaths'];
      requireConfig['shim'] = window['requireShim'];
    }
    if (!globalThis.require) {
      this._errorMessage = `requirejs not found, load with cdn: https://cdnjs.com/libraries/require.js`;
      return;
    }

    const requirePCI = requirejs.config(requireConfig);
    requirePCI(
      ['require'],
      require => {
        define('qtiCustomInteractionContext', () => {
          return {
            register: ctxA => {
              this.register(ctxA);
            },
            notifyReady: () => {
              /* only used in the TAO version */
            }
          };
        });
        require([this.module], () => {
          /* nothing */
        }, err => {
          this._errorMessage = err;
        });
      },
      err => {
        this._errorMessage = err;
      }
    );
  }

  override render() {
    return html`<slot></slot>${this._errorMessage &&
      html`<div style="color:red">
        <h1>Error</h1>
        ${this._errorMessage}
      </div>`}`;
  }
}

customElements.define('qti-portable-custom-interaction', QtiPortableCustomInteraction);
