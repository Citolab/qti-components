import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';
import { Configuration, IMSpci, ModuleResolutionConfig, QtiVariableJSON } from './interface';

declare const requirejs: any;
declare const define: any;

@customElement('qti-portable-custom-interaction')
export class QtiPortableCustomInteraction extends Interaction {
  private module: string;
  private customInteractionTypeIdentifier: string;
  private _errorMessage: string = null;
  private intervalId: any;
  private rawResponse: string;

  private pci: IMSpci<unknown>;

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
      _errorMessage: {
        type: String,
        state: true
      }
    };
  }
  private convertQtiVariableJSON(input: QtiVariableJSON): string | string[] {
    for (const topLevelKey in input) {
      // eslint-disable-next-line no-prototype-builtins
      if (input.hasOwnProperty(topLevelKey)) {
        const nestedObject = input[topLevelKey as 'list' | 'base'];
        if (nestedObject) {
          for (const nestedKey in nestedObject) {
            // eslint-disable-next-line no-prototype-builtins
            if (nestedObject.hasOwnProperty(nestedKey)) {
              const value = nestedObject[nestedKey as keyof typeof nestedObject];
              if (Array.isArray(value)) {
                return value.map(String); // Convert each element in the array to string
              } else if (value !== undefined && value !== null) {
                return String(value); // Convert the single value to string
              }
            }
          }
        }
      }
    }
    return null;
  }

  private startChecking(): void {
    // because the pci doesn't have a method to check for changes we'll use an interval
    // to check if the response has changed. If changed we'll save the response
    this.intervalId = setInterval(() => {
      const response = this.pci.getResponse();
      const newResponse = this.pci.getResponse();
      const stringified = JSON.stringify(response);
      if (stringified !== this.rawResponse) {
        this.rawResponse = stringified;
        const value = this.convertQtiVariableJSON(newResponse);
        this.response = value;
        this.saveResponse(value);
      }
    }, 200);
  }

  private stopChecking(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }
  }

  validate(): boolean {
    return true; // FOR NOW
  }
  set response(val: Readonly<string | string[]>) {
    // Only set state is supported in a PCI
  }

  getTAOConfig(node) {
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
    return null;
  }

  register(pci: IMSpci<unknown>) {
    this.pci = pci;

    const type = this.parentElement.tagName === 'QTI-CUSTOM-INTERACTION' ? 'TAO' : 'IMS';
    const dom: HTMLElement =
      type == 'IMS' ? this.querySelector('qti-interaction-markup') : this.querySelector('markup');
    dom.classList.add('qti-customInteraction');

    if (type == 'TAO' && this.querySelector('properties')) {
      (this.querySelector('properties') as HTMLElement).style.display = 'none';
    }

    const config: any =
      type == 'IMS'
        ? {
            properties: this.dataset,
            onready: () => {
              console.log('onready');
            }
          }
        : this.getTAOConfig(this);

    type == 'IMS'
      ? pci.getInstance(dom, config, undefined)
      : (pci as any).initialize(this.customInteractionTypeIdentifier, dom.firstElementChild, config);

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
    this.startChecking();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const requireConfig: ModuleResolutionConfig = {
      context: this.customInteractionTypeIdentifier,
      catchError: true,
      paths: {}
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
    // Initial check in case the children are already present
    this.registerModules(requireConfig).then(() => {
      const requirePCI = requirejs.config(requireConfig);

      requirePCI(
        ['require'],
        require => {
          !require.defined('qtiCustomInteractionContext') &&
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
          // PK: this is a hack to make sure that the interaction is only registered once
          // If it was previsouly loaded, the register will nog kick in, because the class is already defined
          // and in the constructor of the PCI, the register is called.
          // So now it is alreadly defined, we just register it ourselves.

          const wasPreviouslyLoaded = require.defined(this.module);

          require([this.module], ctxA => {
            // register it because it was previously loaded
            wasPreviouslyLoaded && this.register(ctxA);
          }, err => {
            this._errorMessage = err;
          });
        },
        err => {
          this._errorMessage = err;
        }
      );
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopChecking();
  }

  async registerModules(config: ModuleResolutionConfig) {
    // get the value of attribute: data-base-url
    const baseUrl = this.getAttribute('data-base-url');
    if (baseUrl) {
      const moduleResolutionPath = `${this.getAttribute('data-base-url')}/modules/module_resolution.js`;
      const moduleResolutionFallbackPath = `${this.getAttribute('data-base-url')}/modules/modules_resolution.js`;
      if (moduleResolutionPath) {
        const primaryConfig = await this.loadConfig(moduleResolutionPath);
        const fallbackConfig = await this.loadConfig(moduleResolutionFallbackPath);
        await this.mergeConfigs(config, primaryConfig, fallbackConfig);
      }
    }
    // Get the qti-interaction-modules element
    const interactionModules = this.querySelector('qti-interaction-modules');
    if (interactionModules) {
      // Get all qti-interaction-module elements
      const modules = interactionModules.querySelectorAll('qti-interaction-module');
      // Loop through each module and register it with RequireJS
      for (const module of modules) {
        const moduleId = module.getAttribute('id');
        const primaryPath = module.getAttribute('primary-path');
        const fallbackPath = module.getAttribute('fallback-path');
        const primaryConfig: ModuleResolutionConfig = primaryPath
          ? {
              paths: { ...config['paths'], ...{ [moduleId]: primaryPath } }
            }
          : null;
        const fallbackConfig: ModuleResolutionConfig = fallbackPath
          ? {
              paths: { ...config['paths'], ...{ [moduleId]: fallbackPath } }
            }
          : null;
        if (moduleId && primaryConfig) {
          await this.mergeConfigs(config, primaryConfig, fallbackConfig);
        }
      }
    }
  }

  private removeDoubleSlashes(str: string) {
    const singleForwardSlashes = str
      .replace(/([^:]\/)\/+/g, '$1')
      .replace(/\/\//g, '/')
      .replace('http:/', 'http://')
      .replace('https:/', 'https://');
    return singleForwardSlashes;
  }

  loadConfig = async (url: string): Promise<ModuleResolutionConfig> => {
    url = this.removeDoubleSlashes(url);
    try {
      const requireConfig = await fetch(url);
      if (requireConfig.ok) {
        const config = await requireConfig.json();
        return config as ModuleResolutionConfig;
      }
    } catch (e) {
      // do nothing
    }
    return null;
  };

  mergeConfigs = async (
    config: ModuleResolutionConfig,
    primaryConfig: ModuleResolutionConfig,
    fallbackConfig: ModuleResolutionConfig
  ) => {
    for (const moduleId in primaryConfig?.paths) {
      // Check if the key is already in the config
      if (!config.paths[moduleId]) {
        // check if file exists
        let failedToResolve = false;
        try {
          const pathWithExtension = primaryConfig.paths[moduleId].endsWith('.js')
            ? primaryConfig.paths[moduleId]
            : primaryConfig.paths[moduleId] + '.js';
          const m = await fetch(pathWithExtension);
          if (m.ok) {
            config.paths[moduleId] = primaryConfig.paths[moduleId].replace(/\.js$/, '');
          } else {
            failedToResolve = true;
          }
        } catch {
          failedToResolve = true;
        }
        if (failedToResolve && fallbackConfig?.paths[moduleId]) {
          config.paths[moduleId] = fallbackConfig.paths[moduleId].replace(/\.js$/, '');
        } else if (failedToResolve) {
          console.error('Failed to resolve module: ' + moduleId);
        }
      }
    }
  };

  override render() {
    return html`<slot></slot>${this._errorMessage &&
      html`<div style="color:red">
        <h1>Error</h1>
        ${this._errorMessage}
      </div>`}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-portable-custom-interaction': QtiPortableCustomInteraction;
  }
}
