import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';
import { IMSpci, ModuleResolutionConfig, QtiVariableJSON } from './interface';

declare const requirejs: any;
declare const define: any;

@customElement('qti-portable-custom-interaction')
export class QtiPortableCustomInteraction extends Interaction {
  private intervalId: any;
  private rawResponse: string;

  private pci: IMSpci<unknown>;

  @property({ type: String, attribute: 'response-identifier' })
  responseIdentifier: string;

  @property({ type: String, attribute: 'module' })
  module: string;

  @property({ type: String, attribute: 'custom-interaction-type-identifier' })
  customInteractionTypeIdentifier: string;

  @state()
  private _errorMessage: string = null;

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
        this.value = value;
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
  set value(val: string | string[]) {
    // Only set state is supported in a PCI
  }
  get value(): string | string[] {
    return this.rawResponse;
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
    if (type == 'IMS') {
      pci.getInstance(dom, config, undefined);
    } else {
      (pci as any).initialize(this.customInteractionTypeIdentifier, dom.firstElementChild, config);
    }
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

    const config = this.buildRequireConfig();
    const requirePCI = requirejs.config(config);
    requirePCI(['require'], require => {
      // eslint-disable-next-line import/no-dynamic-require
      require([this.module]);
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    requirejs.undef(this.customInteractionTypeIdentifier);
    // Clear the modules in the context
    const context = requirejs.s.contexts;
    delete context[this.customInteractionTypeIdentifier];
    this.stopChecking();
  }

  buildRequireConfig() {
    // Set RequireJS paths and shim configuration if available
    const config: ModuleResolutionConfig = {
      context: this.customInteractionTypeIdentifier,
      catchError: true,
      paths: window['requirePaths'] || {},
      shim: window['requireShim'] || {}
    };
    // Check if RequireJS is available, if not, set an error message
    if (!globalThis.require) {
      this._errorMessage = `RequireJS not found. Please load it via CDN: https://cdnjs.com/libraries/require.js`;
      return null;
    }
    const baseUrl = this.getAttribute('data-base-url');
    const interactionModules = this.querySelector('qti-interaction-modules');

    if (interactionModules) {
      const modules = interactionModules.querySelectorAll('qti-interaction-module');
      for (const module of modules) {
        const moduleId = module.getAttribute('id');
        const primaryPath = module.getAttribute('primary-path');
        const fallbackPath = module.getAttribute('fallback-path');

        if (moduleId && primaryPath) {
          // Set the paths using RequireJS's fallback array
          const paths = fallbackPath
            ? this.combineRequireResolvePaths(
                this.getResolvablePath(primaryPath, baseUrl),
                this.getResolvablePath(fallbackPath, baseUrl)
              )
            : this.getResolvablePath(primaryPath, baseUrl);
          const existingPath = config.paths[moduleId] || [];
          config.paths[moduleId] = this.combineRequireResolvePaths(existingPath, paths);
        }
      }
    }
    return config;
  }

  private combineRequireResolvePaths(path1: string | string[], path2: string | string[]) {
    const path1Array = Array.isArray(path1) ? path1 : [path1];
    const path2Array = Array.isArray(path2) ? path2 : [path2];
    return path1Array.concat(path2Array);
  }

  private removeDoubleSlashes(str: string) {
    const singleForwardSlashes = str
      .replace(/([^:]\/)\/+/g, '$1')
      .replace(/\/\//g, '/')
      .replace('http:/', 'http://')
      .replace('https:/', 'https://');
    return singleForwardSlashes;
  }

  loadConfig = async (url: string, baseUrl?: string): Promise<ModuleResolutionConfig> => {
    url = this.removeDoubleSlashes(url);
    try {
      const requireConfig = await fetch(url);
      if (requireConfig.ok) {
        const config = await requireConfig.json();
        const moduleCong = config as ModuleResolutionConfig;
        for (const moduleId in moduleCong.paths) {
          if (baseUrl) {
            moduleCong.paths[moduleId] = this.getResolvablePath(moduleCong.paths[moduleId], baseUrl);
          }
        }
        return moduleCong;
      }
    } catch (e) {
      // do nothing
    }
    return null;
  };

  getResolvablePathString = (path: string, basePath?: string) => {
    path = path.replace(/\.js$/, '');
    return path?.toLocaleLowerCase().startsWith('http') || !basePath
      ? path
      : this.removeDoubleSlashes(`${basePath}/${path}`);
  };

  getResolvablePath = (path: string | string[], basePath?: string) => {
    return Array.isArray(path)
      ? path.map(p => this.getResolvablePathString(p, basePath))
      : this.getResolvablePathString(path, basePath);
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
