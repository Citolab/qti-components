import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { Interaction } from '../../../exports/interaction';

import type { IMSpci, ModuleResolutionConfig, QtiVariableJSON } from './interface';

declare const requirejs: any;
declare const define: any;

@customElement('qti-portable-custom-interaction')
export class QtiPortableCustomInteraction extends Interaction {
  private intervalId: any;
  private rawResponse: string;

  private pci: IMSpci<unknown>;

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
      const stringified = JSON.stringify(response);
      if (stringified !== this.rawResponse) {
        this.rawResponse = stringified;
        const value = this.convertQtiVariableJSON(response);
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
  set value(_: string | string[]) {
    // Only set state is supported in a PCI
  }
  get value(): string | string[] {
    return this.rawResponse;
  }

  register(pci: IMSpci<unknown>) {
    this.pci = pci;
    const dom: HTMLElement = this.querySelector('qti-interaction-markup');
    dom.classList.add('qti-customInteraction');

    if (this.querySelector('properties')) {
      (this.querySelector('properties') as HTMLElement).style.display = 'none';
    }

    const config: any = {
      properties: this.dataset,
      onready: () => {
        console.log('onready');
      }
    };
    if (pci.getInstance)
      // try {
      pci.getInstance(dom, config, undefined);
    else {
      // Try the TAO custom interaction initialization.
      const restoreTAOConfig = (element: HTMLElement): any => {
        const config: any = {};

        const parseDataAttributes = (element: HTMLElement) => {
          const result: Record<string, any> = {};

          // Separate direct attributes from nested ones
          Object.entries(element.dataset).forEach(([key, value]) => {
            if (!key.includes('__')) {
              // Direct attributes (like version)
              result[key] = value;
            }
          });

          // Parse nested attributes
          const nestedData: Record<string, Record<string, any>> = {};

          Object.entries(element.dataset).forEach(([key, value]) => {
            const parts = key.split('__');
            if (parts.length > 1) {
              const [group, index, prop] = parts;
              nestedData[group] = nestedData[group] || {};
              nestedData[group][index] = nestedData[group][index] || {};
              nestedData[group][index][prop] = value;
            }
          });

          // Convert nested groups to arrays
          Object.entries(nestedData).forEach(([key, group]) => {
            result[key] = Object.values(group);
          });

          return result;
        };

        const data = parseDataAttributes(element);
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (key === 'config') {
              config[key] = JSON.parse(value);
            } else {
              config[key] = value;
            }
          }
        }
        config.boundTo = {
          [this.responseIdentifier]: this.value
        };
        return config;
      };
      const taoConfig = restoreTAOConfig(this);
      (pci as any).initialize(
        this.customInteractionTypeIdentifier,
        dom.firstElementChild,
        Object.keys(taoConfig).length ? taoConfig : null
      );
    }

    this.startChecking();
  }

  override connectedCallback(): void {
    super.connectedCallback();

    console.log('connectedCallback');
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
    requirejs.onError = function (err) {
      console.error('RequireJS error:', err);
      if (err.requireType === 'timeout') {
        console.error('Modules that timed out:', err.requireModules);
      }
      throw err;
    };
    requirePCI(['require'], require => {
      try {
        // eslint-disable-next-line import/no-dynamic-require
        require([this.module], () => {}, err => {
          console.error('Error loading module:', err);
        });
      } catch (error) {
        console.error('Error in require call:', error);
      }
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
    return path1Array.concat(path2Array).filter((value, index, self) => self.indexOf(value) === index);
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
