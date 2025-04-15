import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import styles from './qti-portable-custom-interaction.styles';
import { Interaction } from '../../../exports/interaction';
import { itemContext } from '../../../exports/qti-assessment-item.context';
import { removeDoubleSlashes } from '../../internal/utils';

import type { CSSResultGroup } from 'lit';
import type { ItemContext } from '../../../exports/item.context';
import type { BaseType, Cardinality } from '../../../exports/expression-result';
import type { QtiVariableJSON } from './interface';

@customElement('qti-portable-custom-interaction-iframe')
export class QtiPortableCustomInteractionIFrame extends Interaction {
  private _value: string | string[];
  protected _iframeLoaded = false;
  protected _pendingMessages: Array<{ method: string; params: any }> = [];
  static styles: CSSResultGroup = styles;

  @property({ type: String, attribute: 'module' })
  module: string;

  @property({ type: String, attribute: 'custom-interaction-type-identifier' })
  customInteractionTypeIdentifier: string;

  @property({ type: String, attribute: 'data-base-url' })
  baseUrl: string = '';

  @state()
  private _errorMessage: string = null;

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  @state() response: string | string[] = [];

  protected iframe: HTMLIFrameElement;

  private convertQtiVariableJSON(input: QtiVariableJSON): string | string[] {
    for (const topLevelKey in input) {
      if (Object.prototype.hasOwnProperty.call(input, topLevelKey)) {
        const nestedObject = input[topLevelKey as 'list' | 'base'];
        if (nestedObject) {
          for (const nestedKey in nestedObject) {
            if (Object.prototype.hasOwnProperty.call(nestedObject, nestedKey)) {
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
    this._value = v;
    const cardinality =
      this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.cardinality || 'single';
    const baseType = this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.baseType || 'string';
    this.sendMessageToIframe('setValue', this.responseVariablesToQtiVariableJSON(this._value, cardinality, baseType));
  }

  get value(): string | null {
    return this._value?.toString() || null;
  }

  // Send message to iframe
  protected sendMessageToIframe(method: string, params: any) {
    if (!this._iframeLoaded) {
      // || !this._iframeReady) {
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

  // Process pending messages
  private processPendingMessages() {
    if (this._pendingMessages.length) {
      this._pendingMessages.forEach(message => {
        this.sendMessageToIframe(message.method, message.params);
      });
      this._pendingMessages = [];
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();

    // Setup message listener for iframe communication
    window.addEventListener('message', this.handleIframeMessage);

    // Create the iframe
    this.createIframe();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('message', this.handleIframeMessage);
  }

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
        if (typeof data.height === 'number') {
          this.iframe.style.height = `${data.height}px`;
          this.iframe.style.width = `${data.width}px`;
        }
        break;

      case 'interactionChanged': {
        const value = this.convertQtiVariableJSON(data.params.value);
        console.log('Interaction changed:', value);
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

  private sendIframeInitData() {
    // Build the boundTo structure similar to the getter
    const responseVal = this.responseVariablesToQtiVariableJSON(
      this._value,
      this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.cardinality || 'single',
      this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.baseType || 'string'
    );

    const boundTo: Record<string, QtiVariableJSON> = {};
    boundTo[this.responseIdentifier] = responseVal;
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
      boundTo: boundTo
    };

    this.sendMessageToIframe('initialize', initData);
  }

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

  private initializeInteraction() {
    // Send boundTo data if available
    if (this._value) {
      const cardinality =
        this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.cardinality || 'single';
      const baseType =
        this.context?.variables?.find(v => v.identifier === this.responseIdentifier)?.baseType || 'string';
      const responseVal = this.responseVariablesToQtiVariableJSON(this._value, cardinality, baseType);
      this.sendMessageToIframe('setValue', responseVal);
    }
  }

  protected generateIframeContent(): string {
    const parentStyles = window.getComputedStyle(document.body);

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
      height: 100%;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
  <script>
    // Define standard paths and shims
    window.requirePaths = {
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
      'mathJax': '/assets/pci-scripts/mathjax/mathJax',
      'css': '/assets/pci-scripts/css/css'
    };
    
    window.requireShim = {
      mathJax: {
        exports: 'MathJax',
        init: function () {
          if (window.MathJax) {
            window.MathJax.Hub.Config({
              showMathMenu: false,
              showMathMenuMSIE: false,
              menuSettings: { inTabOrder: false },
            });
            window.MathJax.Hub.Startup.MenuZoom = function () { /* nothing */ };
            window.MathJax.Hub.Startup.onload();
            return window.MathJax;
          }
        },
      },
    };

    // Single initial RequireJS configuration with error handling
    window.requirejs.config({
      catchError: true,
      waitSeconds: 30,
      paths: window.requirePaths,
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
                properties: this.addHyphenatedKeys({ ...config.dataAttributes }),
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
      
      setupRequireJsConfig: function(config) {
        // This function is no longer needed as we handle config in initialize
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
                console.error('Error loading module after tap loaded:', modulePath, err);
                this.notifyError('Module load error: ' + err.toString());
              });
          });
        } catch (error) {
          console.error('Exception in loadModule:', error);
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
      
      setValue: function(value) {
        if (this.pciInstance && this.pciInstance.setResponse) {
          this.pciInstance.setResponse(value);
        }
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
          
        case 'setValue':
          PCIManager.setValue(data.params);
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
    'qti-portable-custom-interaction-iframe': QtiPortableCustomInteractionIFrame;
  }
}
