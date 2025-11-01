import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import styles from './qti-portable-custom-interaction.styles';
import { Interaction } from '../../../exports/interaction';
import { itemContext } from '../../../exports/qti-assessment-item.context';
import { removeDoubleSlashes } from '../../internal/utils';

import type { CSSResultGroup } from 'lit';
import type { ItemContext } from '../../../exports/item.context';
import type { BaseType, Cardinality } from '../../../exports/expression-result';
import type {
  ConfigProperties,
  IMSpci,
  ModuleResolutionConfig,
  QtiVariableJSON,
  ResponseVariableType
} from './interface';

declare const requirejs: any;
declare const define: any;

@customElement('qti-portable-custom-interaction')
export class QtiPortableCustomInteraction extends Interaction {
  private _value: string | string[];

  // Only used in direct mode
  private pci: IMSpci<ConfigProperties<unknown>>;

  // Only used in iframe mode
  protected _iframeLoaded = false;
  protected _pendingMessages: Array<{ method: string; params: any }> = [];
  protected iframe: HTMLIFrameElement;

  private _responseCheckInterval: number | null = null;

  // Define a static style that applies to both direct and iframe modes
  static styles: CSSResultGroup = [
    styles,
    // Add default width/height for direct mode
    css`
      :host {
        display: block;
        width: 100%;
        min-height: 50px;
      }
      .qti-customInteraction {
        display: block;
        width: 100%;
        min-height: 50px;
      }
    `
  ];

  @property({ type: String, attribute: 'module' })
  module: string;

  @property({ type: String, attribute: 'custom-interaction-type-identifier' })
  customInteractionTypeIdentifier: string;

  @property({ type: String, attribute: 'data-require-paths' })
  requirePathsJson: string = '';

  @property({ type: String, attribute: 'data-require-shim' })
  requireShimJson: string = '';

  @property({ type: String, attribute: 'data-require-js-url' })
  requireJsUrl: string = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js';

  @property({ type: String, attribute: 'data-base-url' })
  baseUrl: string = '';

  @property({ type: Boolean, attribute: 'data-use-iframe' })
  useIframe = false;

  @property({ type: Boolean, attribute: 'data-use-default-shims' })
  useDefaultShims = false;

  @property({ type: Boolean, attribute: 'data-use-default-paths' })
  useDefaultPaths = false;

  @state()
  private _errorMessage: string = null;

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  @state() response: string | string[] = [];

  private dom: HTMLElement;

  private _parsedRequirePaths: Record<string, string | string[]> = null;
  private _parsedRequireShim: Record<string, any> = null;

  /**
   * Parse the require paths JSON string into an object
   */
  private getRequirePaths(): Record<string, string | string[]> {
    if (this._parsedRequirePaths === null && this.requirePathsJson) {
      try {
        // Handle the array format [{name: "path/name", value: "path/value"}, ...]
        // and convert to object format {name: value, ...}
        const parsedJson = JSON.parse(this.requirePathsJson);
        if (Array.isArray(parsedJson)) {
          this._parsedRequirePaths = {};
          parsedJson.forEach(item => {
            if (item.name && item.value) {
              this._parsedRequirePaths[item.name] = item.value;
            }
          });
        } else {
          // If it's already in object format, use it directly
          this._parsedRequirePaths = parsedJson;
        }
      } catch (e) {
        console.error('Error parsing require paths JSON:', e);
        this._errorMessage = `Error parsing require paths JSON: ${e.message}`;
        this._parsedRequirePaths = {};
      }
    }
    return this._parsedRequirePaths || {};
  }

  /**
   * Parse the require shim JSON string into an object
   */
  private getRequireShim(): Record<string, any> {
    if (this._parsedRequireShim === null && this.requireShimJson) {
      try {
        this._parsedRequireShim = JSON.parse(this.requireShimJson);
      } catch (e) {
        console.error('Error parsing require shim JSON:', e);
        this._errorMessage = `Error parsing require shim JSON: ${e.message}`;
        this._parsedRequireShim = {};
      }
    }
    return this._parsedRequireShim || {};
  }

  /**
   * Get the default require paths
   */
  private getDefaultRequirePaths(): Record<string, string | string[]> {
    return {
      'taoQtiItem/portableLib/OAT/util/event': '/assets/pci-scripts/portableLib/OAT/util/event',
      'taoQtiItem/portableLib/OAT/util/html': '/assets/pci-scripts/portableLib/OAT/util/html',
      'taoQtiItem/portableLib/OAT/util/EventMgr': '/assets/pci-scripts/portableLib/OAT/util/EventMgr',
      'taoQtiItem/portableLib/OAT/util/math': '/assets/pci-scripts/portableLib/OAT/util/math',
      'taoQtiItem/portableLib/OAT/util/xml': '/assets/pci-scripts/portableLib/OAT/util/xml',
      'taoQtiItem/portableLib/OAT/util/tooltip': '/assets/pci-scripts/portableLib/OAT/util/tooltip',
      'taoQtiItem/portableLib/jquery_2_1_1': '/assets/pci-scripts/portableLib/jquery_2_1_1',
      'taoQtiItem/pci-scripts/portableLib/jquery.qtip': '/assets/portableLib/jquery.qtip',
      'taoQtiItem/pci-scripts/portableLib/lodash': '/assets/pci-scripts/portableLib/lodash',
      'taoQtiItem/pci-scripts/portableLib/raphael': '/assets/pci-scripts/portableLib/raphael',
      'IMSGlobal/jquery_2_1_1': '/assets/pci-scripts/IMSGlobal/jquery_2_1_1',
      'OAT/util/event': '/assets/pci-scripts/legacyPortableSharedLib/OAT/util/event',
      'OAT/util/html': '/assets/pci-scripts/legacyPortableSharedLib/OAT/util/html',
      'OAT/util/EventMgr': '/assets/pci-scripts/legacyPortableSharedLib/OAT/util/EventMgr',
      'OAT/util/math': '/assets/pci-scripts/legacyPortableSharedLib/OAT/util/math',
      'OAT/util/xml': '/assets/pci-scripts/legacyPortableSharedLib/OAT/util/xml',
      'OAT/util/tooltip': '/assets/pci-scripts/legacyPortableSharedLib/OAT/util/tooltip',
      'OAT/lodash': '/assets/pci-scripts/legacyPortableSharedLib/lodash',
      mathJax: '/assets/pci-scripts/mathjax/mathJax',
      css: '/assets/pci-scripts/css/css'
    };
  }

  /**
   * Get the default require shim
   */
  private getDefaultRequireShim(): Record<string, any> {
    return {
      mathJax: {
        exports: 'MathJax',
        init: function () {
          const anyWindow = window as any;
          if (anyWindow.MathJax) {
            anyWindow.MathJax.Hub.Config({
              showMathMenu: false,
              showMathMenuMSIE: false,
              menuSettings: { inTabOrder: false }
            });
            anyWindow.MathJax.Hub.Startup.MenuZoom = function () {
              /* nothing */
            };
            anyWindow.MathJax.Hub.Startup.onload();
            return anyWindow.MathJax;
          }
        }
      }
    };
  }

  /**
   * Get the final require paths by combining defaults with user-provided paths
   */
  private getFinalRequirePaths(): Record<string, string | string[]> {
    const defaults = this.getDefaultRequirePaths();
    const userPaths = this.getRequirePaths();
    if (this.useDefaultPaths) {
      return { ...defaults, ...userPaths };
    }
    return userPaths;
  }

  /**
   * Get the final require shim by combining defaults with user-provided shim
   */
  private getFinalRequireShim(): Record<string, any> {
    const userShim = this.getRequireShim();
    const defaults = this.getDefaultRequireShim();
    if (this.useDefaultShims) {
      return { ...defaults, ...userShim };
    }
    return userShim;
  }

  /**
   * Converts QtiVariableJSON to a string or string array
   */
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

  /**
   * Adds hyphenated versions of camelCase keys to properties object
   */
  private addHyphenatedKeys(properties: Record<string, any>): Record<string, any> {
    const updatedProperties = { ...properties };

    for (const key in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, key)) {
        const hyphenatedKey = key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);
        updatedProperties[hyphenatedKey] = properties[key];
      }
    }

    return updatedProperties;
  }

  /**
   * Converts response variables to QtiVariableJSON
   */
  protected responseVariablesToQtiVariableJSON(
    input: string | string[],
    cardinality: Cardinality,
    baseType: BaseType
  ): QtiVariableJSON {
    if (cardinality !== 'single') {
      const list = { list: {} };
      list.list[baseType] = input;
      return list;
    } else {
      const base = { base: {} };
      base.base[baseType] = input;
      return base;
    }
  }

  validate(): boolean {
    return true;
  }

  set value(v: string | null) {
    if (v === null) {
      this._value = [];
    } else {
      this._value = Array.isArray(v) ? v : v.split(',');
    }
    // PCI handles response setting via boundTo property during initialization
    // No need to call setResponse directly
  }

  get value(): string | null {
    if (this.useIframe) {
      return this._value?.toString() || null;
    } else {
      // Try to get the value from the PCI first for direct mode
      const pciValue = this.pci?.getResponse();
      if (pciValue) {
        const convertedValue = this.convertQtiVariableJSON(pciValue);
        return Array.isArray(convertedValue) ? convertedValue.join(',') : convertedValue;
      }
    }

    // Fallback to stored value
    return Array.isArray(this._value) ? this._value.join(',') : this._value?.toString() || null;
  }

  set boundTo(newValue: Record<string, ResponseVariableType>) {
    if (!newValue || !newValue[this.responseIdentifier]) {
      return;
    }

    const value = this.convertQtiVariableJSON(newValue[this.responseIdentifier]);
    this._value = value;

    // No direct call to setResponse - PCI will handle this during initialization
    // through the boundTo property in the config

    this.saveResponse(value);
  }

  get boundTo(): Record<string, QtiVariableJSON> {
    const responseVariable: Record<string, QtiVariableJSON> = {};
    const variable = this.context?.variables?.find(v => v.identifier === this.responseIdentifier);
    if (variable) {
      const cardinality =
        this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.cardinality || 'single';
      const baseType =
        this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.baseType || 'string';
      const value = this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.value || null;
      const responseVal = this.responseVariablesToQtiVariableJSON(value as string | string[], cardinality, baseType);
      responseVariable[this.responseIdentifier] = responseVal;
    }

    return responseVariable;
  }

  /**
   * Unescape HTML entities in a string
   */
  private unescapeHtml(str: string): string {
    if (!str) return str;

    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#x60;/g, '`')
      .replace(/&#x3D;/g, '=');
  }

  /**
   * Unescape HTML entities in all values of an object
   */
  private unescapeDataAttributes(obj: Record<string, any>): Record<string, any> {
    const unescaped: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        unescaped[key] = this.unescapeHtml(value);
      } else {
        unescaped[key] = value;
      }
    }

    return unescaped;
  }

  /**
   * DIRECT MODE: Register PCI instance
   */
  register(pci: IMSpci<ConfigProperties<unknown>>) {
    this.pci = pci;
    this.dom = this.querySelector('qti-interaction-markup');
    if (!this.dom) {
      this.dom = document.createElement('div');
      this.appendChild(this.dom);
    }
    this.dom.classList.add('qti-customInteraction');

    // Add explicit styling to DOM element for direct mode
    this.dom.style.width = '100%';
    this.dom.style.minHeight = '50px';
    this.dom.style.display = 'block';

    this.dom.addEventListener('qti-interaction-changed', this._onInteractionChanged);
    if (this.querySelector('properties')) {
      (this.querySelector('properties') as HTMLElement).style.display = 'none';
    }

    const config: any = {
      properties: this.addHyphenatedKeys(this.unescapeDataAttributes({ ...this.dataset })),
      contextVariables: {},
      templateVariables: {},
      onready: pciInstance => {
        this.pci = pciInstance;
        // Set up a ResizeObserver to handle dynamic size changes in direct mode
        try {
          const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
              if (entry.contentRect) {
                // Adjust container height based on content
                if (entry.contentRect.height > 0) {
                  // Add a small buffer for padding
                  this.style.height = `${entry.contentRect.height + 20}px`;
                }
              }
            }
          });

          // Observe the DOM element
          resizeObserver.observe(this.dom);

          // Store reference for cleanup
          (this as any)._resizeObserver = resizeObserver;
        } catch (e) {
          console.warn('ResizeObserver not supported, falling back to static sizing');
        }
      },
      ondone: (_pciInstance, response, _state, _status: 'interacting' | 'closed' | 'solution' | 'review') => {
        this.response = this.convertQtiVariableJSON(response);
        this.saveResponse(this.response);
      },
      responseIdentifier: this.responseIdentifier,
      boundTo: this.boundTo
    };

    if (pci.getInstance) {
      pci.getInstance(this.dom, config, undefined);
    } else {
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
        return config;
      };
      const taoConfig = restoreTAOConfig(this);
      (pci as any).initialize(
        this.customInteractionTypeIdentifier,
        this.dom.firstElementChild || this.dom,
        Object.keys(taoConfig).length ? taoConfig : null
      );
    }
  }

  /* ... rest of the code remains the same ... */

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.useIframe) {
      // IFRAME MODE cleanup
      window.removeEventListener('message', this.handleIframeMessage);
    } else {
      // DIRECT MODE cleanup
      // Clean up ResizeObserver if it exists
      // DIRECT MODE cleanup
      // Stop response checking interval
      this.stopResponseCheck();
      if ((this as any)._resizeObserver) {
        (this as any)._resizeObserver.disconnect();
        (this as any)._resizeObserver = null;
      }

      requirejs.undef(this.customInteractionTypeIdentifier);
      // Clear the modules in the context
      const context = requirejs.s.contexts;
      delete context[this.customInteractionTypeIdentifier];
      // Remove the event listener when the component is disconnected
      this.removeEventListener('qti-interaction-changed', this._onInteractionChanged);
    }
  }

  /**
   * IFRAME MODE: Send message to iframe
   */
  protected sendMessageToIframe(method: string, params: any) {
    if (!this._iframeLoaded) {
      this._pendingMessages.push({ method, params });
      return;
    }
    this.iframe.contentWindow.postMessage(
      {
        source: 'qti-portable-custom-interaction',
        method,
        params
      },
      '*'
    );
  }

  /**
   * IFRAME MODE: Process pending messages
   */
  private processPendingMessages() {
    if (this._pendingMessages.length) {
      this._pendingMessages.forEach(message => {
        this.sendMessageToIframe(message.method, message.params);
      });
      this._pendingMessages = [];
    }
  }

  /**
   * IFRAME MODE: Handle iframe messages
   */
  protected handleIframeMessage = (event: MessageEvent) => {
    const { data } = event;
    // Ensure the message is from our iframe
    if (!data || data.source !== 'qti-pci-iframe') {
      return;
    }
    switch (data.method) {
      case 'iframeReady':
        this.initializeInteraction();
        this.processPendingMessages();
        this.dispatchEvent(
          new CustomEvent('qti-portable-custom-interaction-loaded', {
            bubbles: true
          })
        );
        break;

      case 'resize':
        if (typeof data.height === 'number' && this.iframe) {
          this.iframe.style.height = `${data.height}px`;
          this.iframe.style.width = `${data.width}px`;
        }
        break;

      case 'interactionChanged': {
        const value = this.convertQtiVariableJSON(data.params.value);
        this.response = value;
        this.validate();
        this.saveResponse(this.response);
        break;
      }
      case 'error':
        this._errorMessage = data.params.message;
        console.error('Error from PCI iframe:', data.params.message);
        break;
    }
  };

  /**
   * IFRAME MODE: Create iframe element
   */
  protected createIframe() {
    this.iframe = document.createElement('iframe');
    this.iframe.id = `pci-iframe-${this.responseIdentifier}`;
    this.iframe.setAttribute('title', 'QTI PCI Iframe');
    this.iframe.setAttribute('aria-label', 'QTI PCI Iframe');
    this.iframe.setAttribute('aria-hidden', 'false');
    this.iframe.setAttribute('role', 'application');
    this.iframe.style.width = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.display = 'block';

    // Handle iframe load event
    this.iframe.onload = () => {
      this._iframeLoaded = true;
      this.addMarkupToIframe();
      // Send initialization data to iframe
      this.sendIframeInitData();
    };

    // Create a unique name for the iframe
    const iframeName = `qti-pci-${this.responseIdentifier}-${Date.now()}`;
    this.iframe.name = iframeName;

    // Generate iframe HTML content with all required scripts
    const iframeContent = this.generateIframeContent();

    // Set iframe src as data URI
    const encodedContent = encodeURIComponent(iframeContent);
    this.iframe.src = `data:text/html;charset=utf-8,${encodedContent}`;

    // Append iframe to component
    this.appendChild(this.iframe);
  }

  /**
   * IFRAME MODE: Send initialization data to iframe
   */
  private sendIframeInitData() {
    // Once iframe is loaded, send initialization data
    const initData = {
      module: this.module,
      customInteractionTypeIdentifier: this.customInteractionTypeIdentifier,
      baseUrl: !this.baseUrl
        ? window.location.origin
        : this.baseUrl.startsWith('http') || this.baseUrl.startsWith('blob') || this.baseUrl.startsWith('base64')
          ? this.baseUrl
          : removeDoubleSlashes(`${window.location.origin}${this.baseUrl}`),
      responseIdentifier: this.responseIdentifier,
      dataAttributes: { ...this.dataset },
      interactionModules: this.getInteractionModules(),
      boundTo: this.boundTo
    };

    this.sendMessageToIframe('initialize', initData);
  }

  /**
   * IFRAME MODE: Get interaction modules from DOM
   */
  private getInteractionModules() {
    const modules = [];
    const interactionModules = this.querySelector('qti-interaction-modules');

    if (interactionModules) {
      const moduleElements = interactionModules.querySelectorAll('qti-interaction-module');
      for (const module of moduleElements) {
        modules.push({
          id: module.getAttribute('id'),
          primaryPath: module.getAttribute('primary-path'),
          fallbackPath: module.getAttribute('fallback-path')
        });
      }
    }

    return modules;
  }

  /**
   * IFRAME MODE: Add markup and properties to iframe
   */
  private addMarkupToIframe() {
    // Get interaction markup if any
    const markup = this.querySelector('qti-interaction-markup');
    if (markup) {
      this.sendMessageToIframe('setMarkup', markup.innerHTML);
    }
    // Get properties if any
    const properties = this.querySelector('properties');
    if (properties) {
      this.sendMessageToIframe('setProperties', properties.innerHTML);
    }
  }

  /**
   * IFRAME MODE: Initialize the interaction
   */
  private initializeInteraction() {
    // No explicit action needed, as the PCI will initialize
    // with the boundTo property already provided
  }

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.useIframe) {
      // IFRAME MODE
      window.addEventListener('message', this.handleIframeMessage);
      this.createIframe();
    } else {
      // DIRECT MODE
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
      if (config) {
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
            require([this.module], () => {}, err => {
              console.error('Error loading module:', err);
            });
          } catch (error) {
            console.error('Error in require call:', error);
          }
        });
      }
    }
  }

  /**
   * Stop checking for response changes
   */
  private stopResponseCheck(): void {
    if (this._responseCheckInterval !== null) {
      window.clearInterval(this._responseCheckInterval);
      this._responseCheckInterval = null;
    }
  }

  private _onInteractionChanged = (event: CustomEvent) => {
    // Prevent further propagation of the event
    event.stopPropagation();

    // Optionally, handle the event here (e.g., update internal state)
    const value = this.convertQtiVariableJSON(event.detail.value);
    this.response = value;
    this.saveResponse(value);
  };

  /**
   * DIRECT MODE: Build RequireJS configuration
   */
  buildRequireConfig() {
    // Set RequireJS paths and shim configuration if available
    const config: ModuleResolutionConfig = {
      context: this.customInteractionTypeIdentifier,
      catchError: true,
      paths: { ...this.getFinalRequirePaths(), ...(window['requirePaths'] || {}) },
      shim: { ...this.getFinalRequireShim(), ...(window['requireShim'] || {}) }
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

  /**
   * DIRECT MODE: Helper method to combine require paths
   */
  private combineRequireResolvePaths(path1: string | string[], path2: string | string[]) {
    const path1Array = Array.isArray(path1) ? path1 : [path1];
    const path2Array = Array.isArray(path2) ? path2 : [path2];
    return path1Array.concat(path2Array).filter((value, index, self) => self.indexOf(value) === index);
  }

  /**
   * DIRECT MODE: Helper method to remove double slashes
   */
  private removeDoubleSlashes(str: string) {
    const singleForwardSlashes = str
      .replace(/([^:]\/)\/+/g, '$1')
      .replace(/\/\//g, '/')
      .replace('http:/', 'http://')
      .replace('https:/', 'https://');
    return singleForwardSlashes;
  }

  /**
   * DIRECT MODE: Load config from URL
   */
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

  /**
   * DIRECT MODE: Helper method to get resolvable path string
   */
  getResolvablePathString = (path: string, basePath?: string) => {
    path = path.replace(/\.js$/, '');
    return path?.toLocaleLowerCase().startsWith('http') || !basePath
      ? path
      : this.removeDoubleSlashes(`${basePath}/${path}`);
  };

  /**
   * DIRECT MODE: Helper method to get resolvable path
   */
  getResolvablePath = (path: string | string[], basePath?: string) => {
    return Array.isArray(path)
      ? path.map(p => this.getResolvablePathString(p, basePath))
      : this.getResolvablePathString(path, basePath);
  };

  /**
   * IFRAME MODE: Generate iframe HTML content
   */
  protected generateIframeContent(): string {
    const parentStyles = window.getComputedStyle(document.body);

    // Get the configured require paths and shim
    const requirePaths = JSON.stringify(this.getFinalRequirePaths());
    const requireShim = JSON.stringify(this.getFinalRequireShim());

    // Extract just the font-related properties you want to copy
    const fontStyles = `
    font-family: ${parentStyles.getPropertyValue('font-family')};
    font-size: ${parentStyles.getPropertyValue('font-size')};
    line-height: ${parentStyles.getPropertyValue('line-height')};
    font-weight: ${parentStyles.getPropertyValue('font-weight')};
    color: ${parentStyles.getPropertyValue('color')};
  `;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>QTI PCI Container</title>
   <base href="${window.location.origin}" />
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: auto;
      overflow: hidden;
        /* Add the extracted font styles here */
      ${fontStyles}
    }
    .qti-customInteraction {
      width: 100%;
      height: 100%;
    }
    #pci-container {
      width: 100%;
  </style>
  <script src="${this.requireJsUrl}"></script>
  <script>
    // Define standard paths and shims
    window.requirePaths = ${requirePaths};

    window.requireShim = ${requireShim};

    // Single initial RequireJS configuration with error handling
    window.requirejs.config({
      catchError: true,
      waitSeconds: 30,
      paths: window.requirePaths,
      baseUrl: '${this.dataset.baseUrl}',
      shim: window.requireShim,
      onNodeCreated: function(node, config, moduleName, url) {
        console.log('RequireJS creating node for module:', moduleName, 'URL:', url);

        // Add error handler to script node
        node.addEventListener('error', function(evt) {
          console.error('Script load error for module:', moduleName, 'URL:', url, 'Event:', evt);
        });
      },
      onError: function(err) {
        console.error('RequireJS error:', {
          type: err.requireType,
          modules: err.requireModules,
          error: err
        });

        if (err.requireType === 'scripterror') {
          console.error('Script error usually indicates a network or CORS issue with:', err.requireModules);
        }

        // Notify parent window about the error
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'error',
          params: {
            message: 'RequireJS ' + err.requireType + ' error for modules: ' + err.requireModules,
            details: {
              type: err.requireType,
              modules: err.requireModules,
              error: err.toString()
            }
          }
        }, '*');
      }
    });

    // PCI Manager for iframe implementation
    window.PCIManager = {
      pciInstance: null,
      container: null,
      customInteractionTypeIdentifier: null,

      initialize: function(config) {
        this.customInteractionTypeIdentifier = config.customInteractionTypeIdentifier;
        this.container = document.getElementById('pci-container');
        this.container.classList.add('qti-customInteraction');

        function getResolvablePath(path, basePath) {
          if (Array.isArray(path)) {
            return path.map(p => getResolvablePathString(p, basePath));
          } else {
            return getResolvablePathString(path, basePath);
          }
        }

        function removeDoubleSlashes(str) {
          return str
            .replace(/([^:\\/])\\/\\/+/g, '$1/')
            .replace(/\\/\\//g, '/')
            .replace('http:/', 'http://')
            .replace('https:/', 'https://');
        }

        function getResolvablePathString(path, basePath) {
            path = path.replace(/\\.js$/, '');
            return path?.toLocaleLowerCase().startsWith('http') || !basePath
              ? path
              : removeDoubleSlashes(\`\${basePath}/\${path}\`);
        }

        function combineRequireResolvePaths(path1, path2, baseUrl) {
          path1 = getResolvablePath(path1, baseUrl);
          const path1Array = Array.isArray(path1) ? path1 : [path1];
          if (!path2) {
            return path1Array;
          }
          path2 = getResolvablePath(path2, baseUrl);
          const path2Array = Array.isArray(path2) ? path2 : [path2];
          return path1Array.concat(path2Array).filter((value, index, self) => self.indexOf(value) === index);
        }

        // Update paths with modules from the config
        if (config.interactionModules && config.interactionModules.length > 0) {
          config.interactionModules.forEach(module => {
            if (module.id && module.primaryPath) {
              const currentPath = window.requirePaths[module.id] || [];
              const currentPaths = Array.isArray(currentPath) ? currentPath : [currentPath];
              const newPath =  combineRequireResolvePaths(
                module.primaryPath, module.fallbackPath, config.baseUrl
              );
              window.requirePaths[module.id] = currentPaths.concat(newPath).filter((value, index, self) => self.indexOf(value) === index);
            }
          });
        }

        // The ONLY other requirejs.config call - with the context for this specific PCI
        window.requirejs.config({
          context: this.customInteractionTypeIdentifier,
          paths: window.requirePaths,
          shim: window.requireShim
        });

        // Define qtiCustomInteractionContext for the PCI
        define('qtiCustomInteractionContext', () => {
          return {
            register: pciInstance => {
              this.pciInstance = pciInstance;
              // Configure PCI instance
              const pciConfig = {
                properties: this.addHyphenatedKeys(this.unescapeDataAttributes({ ...config.dataAttributes })),
                contextVariables: config.contextVariables || {},
                templateVariables: config.templateVariables || {},
                onready: pciInstance => {
                  this.pciInstance = pciInstance;
                  this.notifyReady();
                },
                ondone: (pciInstance, response, state, status) => {
                  this.notifyInteractionChanged(response);
                },
                responseIdentifier: config.responseIdentifier,
                boundTo: config.boundTo,
              };

              if (pciInstance.getInstance) {
                pciInstance.getInstance(this.container, pciConfig, undefined);
              } else {
                // TAO custom interaction initialization
                const restoreTAOConfig = (dataset) => {
                    const config = {};
                    const parseDataAttributes = () => {
                      const result = {};

                      // Separate direct attributes from nested ones
                      Object.entries(dataset || []).forEach(([key, value]) => {
                        if (!key.includes('__')) {
                          // Direct attributes (like version)
                          result[key] = value;
                        }
                      });

                      // Parse nested attributes
                      const nestedData = {};

                      Object.entries(dataset || []).forEach(([key, value]) => {
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
                const data = parseDataAttributes();
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
                return config;
              };
              const taoConfig = restoreTAOConfig(config.dataAttributes);

              this.pciInstance.initialize(
                this.customInteractionTypeIdentifier,
                this.container.firstElementChild || this.container,
                Object.keys(taoConfig).length ? taoConfig : null
              );
              }
            },
            notifyReady: () => {
              // Notify parent that the PCI is ready
              window.parent.postMessage({
                source: 'qti-pci-iframe',
                method: 'pciReady'
              }, '*');
            }
          };
        });

        // Load the PCI module
        this.loadModule(config.module);
      },

      loadModule: function(modulePath) {
        try {
          // Get the context-specific require
          const contextRequire = window.requirejs.config({
            context: this.customInteractionTypeIdentifier
          });
          contextRequire(['require'], require => {
             // Now load the actual module
              require([modulePath], () => {
              }, err => {
                console.error('Error loading module:', modulePath, err);
                this.notifyError('Module load error: ' + err.toString());
              });
          });
        } catch (error) {
          console.error('Exception in loadModule:', modulePath);
          console.error(error);
          this.notifyError('Error in require call: ' + error.toString());
        }
      },

      notifyReady: function() {
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'iframeReady'
        }, '*');
      },

      notifyInteractionChanged: function(response) {
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'interactionChanged',
          params: { value: response }
        }, '*');
      },

      notifyError: function(message) {
        console.error('PCI Error:', message);
        window.parent.postMessage({
          source: 'qti-pci-iframe',
          method: 'error',
          params: { message: message }
        }, '*');
      },

      setMarkup: function(markupHtml) {
        this.container = document.getElementById('pci-container');
        this.container.innerHTML = markupHtml;
      },

      addHyphenatedKeys: function(properties) {
        const updatedProperties = { ...properties };
        for (const key in properties) {
          if (Object.prototype.hasOwnProperty.call(properties, key)) {
            const hyphenatedKey = key.replace(/[A-Z]/g, char => \`-\${char.toLowerCase()}\`);
            updatedProperties[hyphenatedKey] = properties[key];
          }
        }
        return updatedProperties;
      },
      unescapeDataAttributes: function(obj) {
        const unescaped = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            unescaped[key] = value
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&#x2F;/g, '/')
              .replace(/&#x60;/g, '\`')
              .replace(/&#x3D;/g, '=');
          } else {
            unescaped[key] = value;
          }
        }
        return unescaped;
      },
    };

    // Set up message listener for communication with parent
    window.addEventListener('message', function(event) {
      const { data } = event;

      // Ensure the message is from our parent
      if (!data || data.source !== 'qti-portable-custom-interaction') {
        return;
      }

      switch(data.method) {
        case 'initialize':
          PCIManager.initialize(data.params);
          break;

        case 'setMarkup':
          PCIManager.setMarkup(data.params);
          break;

        case 'setBoundTo':
          // Handle setting boundTo
          break;

        case 'setProperties':
          // Handle setting properties
          break;
      }
    });

    // Notify parent that iframe has loaded
    window.addEventListener('load', function() {
      window.parent.postMessage({
        source: 'qti-pci-iframe',
        method: 'iframeLoaded'
      }, '*');
    });
    let resizeTimeout;
    let previousHeight = 0;
    const notifyResize = () => {
      const container = document.getElementById('pci-container');
      const newHeight = container.scrollHeight + 100;
      if (newHeight !== previousHeight) {
        previousHeight = newHeight;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          window.parent.postMessage({
            source: 'qti-pci-iframe',
            method: 'resize',
            height: newHeight,
            width: container.scrollWidth
          }, '*');
        }, 100); // Adjust debounce time as needed
      }
    };

    function setupResizeObserver() {
        const container = document.getElementById('pci-container');
        if (!container || !(container instanceof Element)) {
          console.warn('ResizeObserver: document.container is not an Element');
          return;
        }

        const resizeObserver = new ResizeObserver(() => {
          notifyResize();
        });

        resizeObserver.observe(container);
      }

      // Run setup once DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          notifyResize(); // initial resize
          setupResizeObserver();
        });
      } else {
        notifyResize();
        setupResizeObserver();
      }

      window.addEventListener('load', () => {
        notifyResize();
      });
      let lastResponseStr = '';
      setInterval(() => {
        if (PCIManager.pciInstance && PCIManager.pciInstance.getResponse) {
          const response = PCIManager.pciInstance.getResponse();
          const responseStr = JSON.stringify(response);

          if (responseStr !== lastResponseStr) {
            lastResponseStr = responseStr;
              window.parent.postMessage({
                source: 'qti-pci-iframe',
                method: 'interactionChanged',
                params: { value: response }
              }, '*');
          }
        }
      }, 500); // Check every 500ms
  </script>
</head>
<body>
  <div id="pci-container"></div>
</body>
</html>`;
  }

  /**
   * Toggle the display of the correct response
   * @param responseVariable The response variable containing the correct response
   * @param show Whether to show or hide the correct response
   */
  public toggleInternalCorrectResponse(show: boolean) {
    const responseVariable = this.responseVariable;

    // Store the correct response or clear it based on the show parameter
    this.correctResponse = show
      ? responseVariable?.correctResponse
      : responseVariable.cardinality === 'single'
        ? ''
        : [];

    // Get unique identifiers for this PCI's correct response elements
    const containerId = `correct-response-container-${this.responseIdentifier}`;

    // Check the parent element for any existing containers with this ID
    const existingContainers = this.parentElement?.querySelectorAll(`#${containerId}`);
    if (existingContainers) {
      existingContainers.forEach(existingContainer => {
        existingContainer.remove();
      });
    }

    // Handle the current interaction's state
    if (show) {
      // Disable the current interaction when showing correct response
      this.disable();
    } else {
      // Enable the current interaction when hiding correct response
      this.enable();
      return; // Exit early, nothing else to do
    }

    // If there's no correct response to show, exit
    if (!show || !responseVariable?.correctResponse) {
      return;
    }

    // Create a container for the correct response viewer
    const correctResponseContainer = document.createElement('div');
    correctResponseContainer.id = containerId;
    correctResponseContainer.className = 'pci-correct-response-container';
    correctResponseContainer.style.position = 'relative';
    correctResponseContainer.style.marginTop = '20px';
    correctResponseContainer.style.border = '2px solid green';
    correctResponseContainer.style.padding = '16px';
    correctResponseContainer.style.borderRadius = '4px';
    correctResponseContainer.style.backgroundColor = 'rgba(0, 128, 0, 0.05)';

    // Add a label for the correct response
    const label = document.createElement('div');
    label.textContent = 'Correct Response:';
    label.style.fontWeight = 'bold';
    label.style.marginBottom = '10px';
    label.style.color = 'green';
    correctResponseContainer.appendChild(label);

    // Instead of cloning, we'll create a new instance and copy necessary attributes
    const correctResponseViewer = document.createElement(
      'qti-portable-custom-interaction'
    ) as QtiPortableCustomInteraction;

    // Copy all attributes from the original PCI
    Array.from(this.attributes).forEach(attr => {
      if (attr.name !== 'id' && attr.name !== 'response-identifier') {
        correctResponseViewer.setAttribute(attr.name, attr.value);
      }
    });

    // Set a unique response identifier to avoid conflicts
    const originalResponseId = this.responseIdentifier;
    correctResponseViewer.responseIdentifier = `${originalResponseId}-correct`;

    // Copy any light DOM content from the original PCI
    // This includes markup and properties
    Array.from(this.children).forEach(child => {
      const clonedChild = child.cloneNode(true);
      correctResponseViewer.appendChild(clonedChild);
    });

    // Store the correct response value
    const correctResponseValue = responseVariable.correctResponse;

    // Different initialization based on mode
    if (this.useIframe) {
      // For iframe mode, add a custom connected callback
      const originalConnectedCallback = correctResponseViewer.connectedCallback;
      correctResponseViewer.connectedCallback = function () {
        // Call the original connected callback to set up the iframe
        originalConnectedCallback.call(this);

        // Wait for iframe to load then set the correct response
        const checkIframeLoaded = () => {
          if (this._iframeLoaded) {
            // Set response after a small delay to ensure PCI is ready
            setTimeout(() => {
              const qtiVariableJSON = this.responseVariablesToQtiVariableJSON(
                correctResponseValue,
                responseVariable.cardinality,
                responseVariable.baseType
              );

              // Send the correct response to the iframe
              this.sendMessageToIframe('setBoundTo', {
                [originalResponseId]: qtiVariableJSON
              });

              // Disable interaction with the correct response viewer
              this.sendMessageToIframe('setState', { state: 'review' });
            }, 1000);

            return true;
          }
          return false;
        };

        // Try immediately
        if (!checkIframeLoaded()) {
          // If not loaded yet, set up an interval to check
          const intervalId = setInterval(() => {
            if (checkIframeLoaded()) {
              clearInterval(intervalId);
            }
          }, 100);

          // Safety timeout to clear interval after 10 seconds
          setTimeout(() => {
            clearInterval(intervalId);
          }, 10000);
        }
      };
    } else {
      // For direct mode, add a custom register method
      const originalRegister = correctResponseViewer.register;
      correctResponseViewer.register = function (pci) {
        // Call the original register method
        originalRegister.call(this, pci);

        // Once registered, set the correct response
        const setCorrectResponse = () => {
          if (this.pci) {
            if (typeof this.pci.setResponse === 'function') {
              // Convert to the format expected by the PCI
              const pciResponse = this.responseVariablesToQtiVariableJSON(
                correctResponseValue,
                responseVariable.cardinality,
                responseVariable.baseType
              );

              // Set the response
              this.pci.setResponse(pciResponse);

              // Disable interaction if the PCI supports it
              if (typeof this.pci.setState === 'function') {
                this.pci.setState('review');
              }

              return true;
            }
          }
          return false;
        };

        // Try to set response after a delay to ensure PCI is fully initialized
        setTimeout(() => {
          if (!setCorrectResponse()) {
            // If not successful, try again with a longer delay
            const intervalId = setInterval(() => {
              if (setCorrectResponse()) {
                clearInterval(intervalId);
              }
            }, 200);

            // Safety timeout to clear interval after 5 seconds
            setTimeout(() => {
              clearInterval(intervalId);
            }, 5000);
          }
        }, 500);
      };
    }

    // Make sure the viewer is not interactive
    correctResponseViewer.style.pointerEvents = 'none';

    // Add the correct response viewer to the container
    correctResponseContainer.appendChild(correctResponseViewer);

    // Append the container after this PCI
    this.after(correctResponseContainer);
  }
  /**
   * Method to disable the PCI for review mode
   * This can be used when showing the correct response
   */
  public disable() {
    // First, store the current state of the PCI
    this._previousState = {
      pointerEvents: this.style.pointerEvents,
      position: this.style.position
    };

    if (this.useIframe) {
      // For iframe mode, send a message to disable interaction
      this.sendMessageToIframe('setState', { state: 'disabled' });
    } else {
      // // For direct mode, use the PCI's disable method if available
      // if (this.pci && typeof this.pci.setState === 'function') {
      //   this.pci.setState('disabled');
      // }
    }

    // Add an overlay to prevent interaction if not already there
    const existingOverlay = this.querySelector('.pci-interaction-overlay');
    if (!existingOverlay) {
      const overlay = document.createElement('div');
      overlay.className = 'pci-interaction-overlay';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(200, 200, 200, 0.3)';
      overlay.style.zIndex = '100';
      overlay.style.pointerEvents = 'all';
      overlay.style.cursor = 'not-allowed';

      // Make sure the container is relatively positioned
      if (getComputedStyle(this).position === 'static') {
        this.style.position = 'relative';
      }

      this.appendChild(overlay);
    }
  }

  /**
   * Method to enable the PCI for interactive mode
   */
  public enable() {
    // Remove any overlays
    const overlay = this.querySelector('.pci-interaction-overlay');
    if (overlay) {
      overlay.remove();
    }

    // Restore previous state if available
    if (this._previousState) {
      if (this._previousState.pointerEvents) {
        this.style.pointerEvents = this._previousState.pointerEvents;
      }
      if (this._previousState.position) {
        this.style.position = this._previousState.position;
      }
      this._previousState = null;
    }

    if (this.useIframe) {
      // For iframe mode, send a message to enable interaction
      this.sendMessageToIframe('setState', { state: 'interacting' });
    } else {
      // // For direct mode, use the PCI's enable method if available
      // if (this.pci && typeof this.pci.setState === 'function') {
      //   this.pci.setState('interacting');
      // }
    }
  }

  // Add this property to store the previous state
  private _previousState: {
    pointerEvents?: string;
    position?: string;
  } = null;

  override render() {
    return html`
      <slot></slot>
      ${this._errorMessage
        ? html`<div style="color:red">
            <h1>Error</h1>
            ${this._errorMessage}
          </div>`
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-portable-custom-interaction': QtiPortableCustomInteraction;
  }
}
