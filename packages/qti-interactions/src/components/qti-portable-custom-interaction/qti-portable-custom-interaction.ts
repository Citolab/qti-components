import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { Interaction, itemContext, qtiContext, removeDoubleSlashes } from '@qti-components/base';

import styles from './qti-portable-custom-interaction.styles';

import type { CSSResultGroup } from 'lit';
import type { BaseType, Cardinality, ItemContext, QtiContext } from '@qti-components/base';
import type { QtiRecordItem, QtiVariableJSON, ResponseVariableType } from './interface';

export class QtiPortableCustomInteraction extends Interaction {
  #value: string | string[];

  protected _iframeLoaded = false;
  protected _pendingMessages: Array<{ method: string; params: any }> = [];
  protected iframe: HTMLIFrameElement;
  protected _iframeMessageOrigin: string | null = null;
  private _iframeObjectUrl: string | null = null;

  // This implementation always renders inside an iframe.
  static override styles: CSSResultGroup = [
    styles,
    css`
      :host {
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

  @property({ type: Boolean, attribute: 'data-use-default-shims' })
  useDefaultShims = false;

  @property({ type: Boolean, attribute: 'data-use-default-paths' })
  useDefaultPaths = false;

  @state()
  private _errorMessage: string = null;

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  @consume({ context: qtiContext, subscribe: true })
  @state()
  protected qtiContext?: QtiContext;

  @state() response: string | string[] | null = null;

  #parsedRequirePaths: Record<string, string | string[]> = null;
  #parsedRequireShim: Record<string, any> = null;

  /**
   * Parse the require paths JSON string into an object
   */
  #getRequirePaths(): Record<string, string | string[]> {
    if (this.#parsedRequirePaths === null && this.requirePathsJson) {
      try {
        // Handle the array format [{name: "path/name", value: "path/value"}, ...]
        // and convert to object format {name: value, ...}
        const parsedJson = JSON.parse(this.requirePathsJson);
        if (Array.isArray(parsedJson)) {
          this.#parsedRequirePaths = {};
          parsedJson.forEach(item => {
            if (item.name && item.value) {
              this.#parsedRequirePaths[item.name] = item.value;
            }
          });
        } else {
          // If it's already in object format, use it directly
          this.#parsedRequirePaths = parsedJson;
        }
      } catch (e) {
        console.error('Error parsing require paths JSON:', e);
        this._errorMessage = `Error parsing require paths JSON: ${e.message}`;
        this.#parsedRequirePaths = {};
      }
    }
    return this.#parsedRequirePaths || {};
  }

  /**
   * Parse the require shim JSON string into an object
   */
  #getRequireShim(): Record<string, any> {
    if (this.#parsedRequireShim === null && this.requireShimJson) {
      try {
        this.#parsedRequireShim = JSON.parse(this.requireShimJson);
      } catch (e) {
        console.error('Error parsing require shim JSON:', e);
        this._errorMessage = `Error parsing require shim JSON: ${e.message}`;
        this.#parsedRequireShim = {};
      }
    }
    return this.#parsedRequireShim || {};
  }

  /**
   * Get the default require paths
   */
  #getDefaultRequirePaths(): Record<string, string | string[]> {
    return {
      'taoQtiItem/portableLib/OAT/util/event': '/assets/pci-scripts/portableLib/OAT/util/event',
      'taoQtiItem/portableLib/OAT/util/html': '/assets/pci-scripts/portableLib/OAT/util/html',
      'taoQtiItem/portableLib/OAT/util/EventMgr': '/assets/pci-scripts/portableLib/OAT/util/EventMgr',
      'taoQtiItem/portableLib/OAT/util/math': '/assets/pci-scripts/portableLib/OAT/util/math',
      'taoQtiItem/portableLib/OAT/util/xml': '/assets/pci-scripts/portableLib/OAT/util/xml',
      'taoQtiItem/portableLib/OAT/util/tooltip': '/assets/pci-scripts/portableLib/OAT/util/tooltip',
      'taoQtiItem/portableLib/OAT/util/tpl': '/assets/pci-scripts/portableLib/OAT/util/tpl',
      'taoQtiItem/portableLib/OAT/util/asset': '/assets/pci-scripts/portableLib/OAT/util/asset',
      'taoQtiItem/portableLib/OAT/waitForMedia': '/assets/pci-scripts/portableLib/OAT/waitForMedia',
      'taoQtiItem/portableLib/OAT/mediaPlayer': '/assets/pci-scripts/portableLib/OAT/mediaPlayer',
      'taoQtiItem/portableLib/OAT/scale.raphael': '/assets/pci-scripts/portableLib/OAT/scale.raphael',
      'taoQtiItem/portableLib/OAT/interact-rotate': '/assets/pci-scripts/portableLib/OAT/interact-rotate',
      'taoQtiItem/portableLib/OAT/promise': '/assets/pci-scripts/portableLib/OAT/promise',
      'taoQtiItem/portableLib/OAT/sts/common': '/assets/pci-scripts/portableLib/OAT/sts/common',
      'taoQtiItem/portableLib/OAT/sts/transform-helper': '/assets/pci-scripts/portableLib/OAT/sts/transform-helper',
      'taoQtiItem/portableLib/OAT/sts/stsEventManager': '/assets/pci-scripts/portableLib/OAT/sts/stsEventManager',
      'taoQtiItem/portableLib/async': '/assets/pci-scripts/portableLib/async',
      'taoQtiItem/portableLib/interact': '/assets/pci-scripts/portableLib/interact',
      'taoQtiItem/portableLib/es6-promise': '/assets/pci-scripts/portableLib/es6-promise',
      'taoQtiItem/portableLib/jquery_2_1_1': '/assets/pci-scripts/portableLib/jquery_2_1_1',
      'taoQtiItem/portableLib/jquery.qtip': '/assets/pci-scripts/portableLib/jquery.qtip',
      'taoQtiItem/portableLib/lodash': '/assets/pci-scripts/portableLib/lodash',
      'taoQtiItem/portableLib/handlebars': '/assets/pci-scripts/portableLib/handlebars',
      'taoQtiItem/portableLib/raphael': '/assets/pci-scripts/portableLib/raphael',
      'taoQtiItem/pci-scripts/portableLib/jquery.qtip': '/assets/pci-scripts/portableLib/jquery.qtip',
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
  #getDefaultRequireShim(): Record<string, any> {
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
  #getFinalRequirePaths(): Record<string, string | string[]> {
    const defaults = this.#getDefaultRequirePaths();
    const userPaths = this.#getRequirePaths();
    if (this.useDefaultPaths) {
      return { ...defaults, ...userPaths };
    }
    return userPaths;
  }

  /**
   * Get the final require shim by combining defaults with user-provided shim
   */
  #getFinalRequireShim(): Record<string, any> {
    const userShim = this.#getRequireShim();
    const defaults = this.#getDefaultRequireShim();
    if (this.useDefaultShims) {
      return { ...defaults, ...userShim };
    }
    return userShim;
  }

  /**
   * Converts QtiVariableJSON to a string or string array
   */
  #convertQtiVariableJSON(input: QtiVariableJSON): string | string[] {
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
   * Get direct child elements by tag name
   */
  private getDirectChildrenByTag(tagName: string): Element[] {
    const needle = tagName.toLowerCase();
    return Array.from(this.children).filter(child => child.tagName.toLowerCase() === needle);
  }

  /**
   * Coerce a scalar value to the expected base-type when possible
   */
  private coerceBaseValue(value: unknown, baseType: BaseType): unknown {
    if (value === null || value === undefined) return value;

    switch (baseType) {
      case 'integer': {
        if (typeof value === 'number') return value;
        const parsed = parseInt(String(value), 10);
        return Number.isNaN(parsed) ? value : parsed;
      }
      case 'float':
      case 'duration': {
        if (typeof value === 'number') return value;
        const parsed = parseFloat(String(value));
        return Number.isNaN(parsed) ? value : parsed;
      }
      case 'boolean': {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lowered = value.toLowerCase();
          if (lowered === 'true') return true;
          if (lowered === 'false') return false;
        }
        return value;
      }
      case 'string':
      case 'identifier':
      default:
        return String(value);
    }
  }

  /**
   * Normalize an input into a list form
   */
  private normalizeListValue(value: unknown): unknown[] {
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }

  /**
   * Convert a variable value to QtiVariableJSON
   */
  private variableToQtiVariableJSON(value: unknown, cardinality: Cardinality, baseType: BaseType): QtiVariableJSON {
    if (cardinality === 'record' || baseType === 'record') {
      return this.recordToQtiVariableJSON(value);
    }

    if (cardinality !== 'single') {
      const listValues = this.normalizeListValue(value).map(v => this.coerceBaseValue(v, baseType));
      return { list: { [baseType]: listValues } };
    }

    return { base: { [baseType]: this.coerceBaseValue(value, baseType) } };
  }

  /**
   * Convert a record object into QtiVariableJSON
   */
  private recordToQtiVariableJSON(value: unknown): QtiVariableJSON {
    if (!value || typeof value !== 'object') {
      return { record: [] };
    }

    const recordEntries: QtiRecordItem[] = [];
    for (const [name, entryValue] of Object.entries(value as Record<string, unknown>)) {
      recordEntries.push(this.recordEntryFromValue(name, entryValue));
    }

    return { record: recordEntries };
  }

  /**
   * Build a record entry from an arbitrary value
   */
  private recordEntryFromValue(name: string, entryValue: unknown): QtiRecordItem {
    if (Array.isArray(entryValue)) {
      const filtered = entryValue.filter(v => v !== null && v !== undefined);

      if (filtered.length && filtered.every(v => typeof v === 'boolean')) {
        return { name, list: { boolean: filtered as boolean[] } };
      }

      if (filtered.length && filtered.every(v => typeof v === 'number')) {
        const numbers = filtered as number[];
        const isIntegers = numbers.every(n => Number.isInteger(n));
        return { name, list: { [isIntegers ? 'integer' : 'float']: numbers } };
      }

      return { name, list: { string: entryValue.map(v => (v === null || v === undefined ? '' : String(v))) } };
    }

    if (typeof entryValue === 'boolean') {
      return { name, base: { boolean: entryValue } };
    }

    if (typeof entryValue === 'number') {
      if (Number.isInteger(entryValue)) return { name, base: { integer: entryValue } };
      return { name, base: { float: entryValue } };
    }

    if (entryValue === null || entryValue === undefined) {
      return { name, base: { string: '' } };
    }

    if (typeof entryValue === 'object') {
      try {
        return { name, base: { string: JSON.stringify(entryValue) } };
      } catch {
        return { name, base: { string: String(entryValue) } };
      }
    }

    return { name, base: { string: String(entryValue) } };
  }

  /**
   * Extract default QTI_CONTEXT values from qti-context-declaration elements
   */
  private getQtiContextDefaultsFromItem(): Record<string, unknown> {
    const itemElement = this.closest('qti-assessment-item');
    if (!itemElement) return {};

    const defaults: Record<string, unknown> = {};
    const contextDeclarations = itemElement.querySelectorAll('qti-context-declaration[identifier="QTI_CONTEXT"]');

    contextDeclarations.forEach(declaration => {
      const defaultValueElement = declaration.querySelector('qti-default-value');
      if (!defaultValueElement) return;

      const valueElements = defaultValueElement.querySelectorAll('qti-value[field-identifier]');
      valueElements.forEach(valueElement => {
        const fieldIdentifier = valueElement.getAttribute('field-identifier');
        if (!fieldIdentifier) return;

        const baseType = (valueElement.getAttribute('base-type') || 'string') as BaseType;
        const textContent = valueElement.textContent?.trim() || '';
        defaults[fieldIdentifier] = this.coerceBaseValue(textContent, baseType);
      });
    });

    return defaults;
  }

  /**
   * Build a QTI_CONTEXT record for PCI consumption
   */
  private getQtiContextRecord(): QtiVariableJSON | null {
    const defaults = this.getQtiContextDefaultsFromItem();
    const runtime = this.qtiContext?.QTI_CONTEXT || {};
    const merged: Record<string, unknown> = { ...defaults, ...runtime };
    if (!Object.keys(merged).length) return null;

    const normalized = {
      candidateIdentifier: merged.candidateIdentifier ?? '',
      testIdentifier: merged.testIdentifier ?? '',
      environmentIdentifier: merged.environmentIdentifier ?? '',
      ...merged
    };

    return this.recordToQtiVariableJSON(normalized);
  }

  /**
   * Collect template variables referenced by qti-template-variable children
   */
  private getTemplateVariables(): Record<string, QtiVariableJSON> {
    const templateVariables: Record<string, QtiVariableJSON> = {};
    const templateVariableElements = this.getDirectChildrenByTag('qti-template-variable');
    if (!templateVariableElements.length) return templateVariables;

    templateVariableElements.forEach(el => {
      const identifier = el.getAttribute('template-identifier') || el.getAttribute('identifier') || '';
      if (!identifier) return;

      const variable = this.context?.variables?.find(v => v.identifier === identifier);
      if (!variable) return;

      const cardinality = (variable.cardinality || 'single') as Cardinality;
      const baseType = (variable.baseType || 'string') as BaseType;
      templateVariables[identifier] = this.variableToQtiVariableJSON(variable.value, cardinality, baseType);
    });

    return templateVariables;
  }

  /**
   * Collect context variables referenced by qti-context-variable children
   */
  private getContextVariables(): Record<string, QtiVariableJSON> {
    const contextVariables: Record<string, QtiVariableJSON> = {};
    const contextVariableElements = this.getDirectChildrenByTag('qti-context-variable');
    if (!contextVariableElements.length) return contextVariables;

    contextVariableElements.forEach(el => {
      const identifier = el.getAttribute('identifier') || '';
      if (!identifier) return;

      if (identifier === 'QTI_CONTEXT') {
        const record = this.getQtiContextRecord();
        if (record) contextVariables[identifier] = record;
        return;
      }

      const variable = this.context?.variables?.find(v => v.identifier === identifier);
      if (!variable) return;

      const cardinality = (variable.cardinality || 'single') as Cardinality;
      const baseType = (variable.baseType || 'string') as BaseType;
      contextVariables[identifier] = this.variableToQtiVariableJSON(variable.value, cardinality, baseType);
    });

    return contextVariables;
  }

  /**
   * Adds hyphenated versions of camelCase keys to properties object
   */
  #addHyphenatedKeys(properties: Record<string, any>): Record<string, any> {
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
    if (this.response === null || this.response === undefined) return false;
    if (Array.isArray(this.response)) {
      if (this.response.length === 0) return false;
      return this.response.some(v => v !== '' && v !== null && v !== undefined);
    }
    return this.response !== '';
  }

  override set value(v: string | null) {
    if (v === null) {
      this.#value = [];
    } else {
      this.#value = Array.isArray(v) ? v : v.split(',');
    }
    // PCI handles response setting via boundTo property during initialization
    // No need to call setResponse directly
  }

  override get value(): string | null {
    if (this.#value === null || this.#value === undefined) return null;
    return Array.isArray(this.#value) ? this.#value.join(',') : String(this.#value);
  }

  set boundTo(newValue: Record<string, ResponseVariableType>) {
    if (!newValue || !newValue[this.responseIdentifier]) {
      return;
    }

    const value = this.#convertQtiVariableJSON(newValue[this.responseIdentifier]);
    this.#value = value;

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
  #unescapeHtml(str: string): string {
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
  #unescapeDataAttributes(obj: Record<string, any>): Record<string, any> {
    const unescaped: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        unescaped[key] = this.#unescapeHtml(value);
      } else {
        unescaped[key] = value;
      }
    }

    return unescaped;
  }

  /**
   * Resolve stylesheet href against baseUrl or document origin
   */
  private resolveStylesheetHref(href: string): string {
    if (!href) return href;

    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }

    if (href.startsWith('//')) {
      return `${window.location.protocol}${href}`;
    }

    const base =
      this.baseUrl && this.baseUrl.length > 0
        ? this.baseUrl.startsWith('http') || this.baseUrl.startsWith('blob') || this.baseUrl.startsWith('base64')
          ? this.baseUrl
          : removeDoubleSlashes(`${window.location.origin}${this.baseUrl}`)
        : window.location.origin;

    const normalizedBase = base.endsWith('/') ? base : `${base}/`;

    try {
      return new URL(href, normalizedBase).toString();
    } catch {
      return href;
    }
  }

  /**
   * Collect qti-stylesheet elements for iframe injection
   */
  private getStylesheetConfigs(): Array<{ href?: string; content?: string; scoped?: boolean; key?: string }> {
    const stylesheets = this.getDirectChildrenByTag('qti-stylesheet');
    if (!stylesheets.length) return [];

    return stylesheets
      .map((el, index) => {
        const href = el.getAttribute('href');
        if (href) {
          const resolved = this.resolveStylesheetHref(href);
          return { href: resolved, scoped: false, key: resolved };
        }
        const content = el.textContent?.trim();
        if (content) {
          return { content, scoped: false, key: `inline-${index}` };
        }
        return null;
      })
      .filter(Boolean);
  }

  private getSharedStylesheetContent(): string | null {
    let cssText = '';
    const seen = new Set<string>();
    const sheets = Array.from(document.styleSheets || []);

    for (const sheet of sheets) {
      try {
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
          continue;
        }
        const ownerNode = sheet.ownerNode as HTMLElement | null;
        if (ownerNode && ownerNode.tagName === 'STYLE') {
          const text = ownerNode.textContent || '';
          if (text && !seen.has(text)) {
            cssText += `${text}\n`;
            seen.add(text);
          }
          continue;
        }
        const rules = sheet.cssRules ? Array.from(sheet.cssRules) : [];
        if (rules.length) {
          const text = rules.map(rule => rule.cssText).join('\n');
          if (text && !seen.has(text)) {
            cssText += `${text}\n`;
            seen.add(text);
          }
        }
      } catch {
        // ignore cross-origin or inaccessible stylesheets
      }
    }

    const trimmed = cssText.trim();
    return trimmed.length ? trimmed : null;
  }

  private getSharedStylesheetConfig(): { content: string; scoped: boolean; key: string } | null {
    const content = this.getSharedStylesheetContent();
    if (!content) return null;
    return { content, scoped: false, key: '__qti_shared_css__' };
  }

  /**
   * IFRAME MODE: Add stylesheets to iframe
   */
  #addStylesheetsToIframe() {
    const stylesheets = this.getStylesheetConfigs();
    const shared = this.getSharedStylesheetConfig();
    const payload = shared ? [shared, ...stylesheets] : stylesheets;
    if (payload.length > 0) {
      this.sendMessageToIframe('setStylesheets', payload);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('message', this.handleIframeMessage);
    if (this._iframeObjectUrl) {
      URL.revokeObjectURL(this._iframeObjectUrl);
      this._iframeObjectUrl = null;
    }
  }

  /**
   * IFRAME MODE: Send message to iframe
   */
  protected sendMessageToIframe(method: string, params: any) {
    const targetWindow = this.iframe?.contentWindow;
    if (!this._iframeLoaded || !targetWindow) {
      this._pendingMessages.push({ method, params });
      return;
    }
    targetWindow.postMessage(
      {
        source: 'qti-portable-custom-interaction',
        responseIdentifier: this.responseIdentifier,
        method,
        params
      },
      '*'
    );
  }

  /**
   * IFRAME MODE: Process pending messages
   */
  #processPendingMessages() {
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
    if (!this.iframe?.contentWindow || event.source !== this.iframe.contentWindow) {
      return;
    }
    if (data.responseIdentifier && data.responseIdentifier !== this.responseIdentifier) {
      return;
    }
    if (this._iframeMessageOrigin === null) {
      this._iframeMessageOrigin = event.origin;
    } else if (event.origin !== this._iframeMessageOrigin) {
      return;
    }
    switch (data.method) {
      case 'iframeReady':
        this.#initializeInteraction();
        this.#processPendingMessages();
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
        const raw = data?.params?.value;
        const converted = raw && typeof raw === 'object' ? this.#convertQtiVariableJSON(raw as QtiVariableJSON) : null;
        // PCI state "should" be an opaque string, but a lot of existing PCIs (including the
        // IMS conformance examples) return a structured object from getState().
        //
        // We store a string in itemContext.state, so we serialize non-string states with a
        // prefix to safely round-trip them without accidentally parsing user-provided strings.
        const stateRaw = data?.params?.state as unknown;
        let state: string | null | undefined;
        if (stateRaw === undefined) {
          state = undefined;
        } else if (stateRaw === null) {
          state = null;
        } else if (typeof stateRaw === 'string') {
          state = stateRaw;
        } else {
          try {
            state = `__qti_json__::${JSON.stringify(stateRaw)}`;
          } catch {
            state = null;
          }
        }

        // Treat null/undefined or unconvertible responses as "cleared".
        // The iframe side is responsible for not emitting an initial clear on load.
        if (converted === null) {
          const emptyResponse = this.responseVariable?.cardinality === 'single' ? '' : [];
          this.response = emptyResponse;
          this.validate();
          this.saveResponse(emptyResponse, state);
          break;
        }

        this.response = converted;
        this.validate();
        this.saveResponse(converted, state);
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
    if (this._iframeObjectUrl) {
      URL.revokeObjectURL(this._iframeObjectUrl);
      this._iframeObjectUrl = null;
    }
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
      if (this._iframeObjectUrl) {
        URL.revokeObjectURL(this._iframeObjectUrl);
        this._iframeObjectUrl = null;
      }
      this.#addMarkupToIframe();
      this.#addStylesheetsToIframe();
      // Send initialization data to iframe
      this.#sendIframeInitData();
    };

    // Create a unique name for the iframe
    const iframeName = `qti-pci-${this.responseIdentifier}-${Date.now()}`;
    this.iframe.name = iframeName;

    // Generate iframe HTML content with all required scripts
    const iframeContent = this.generateIframeContent();

    // Prefer a same-origin blob URL to avoid postMessage target-origin mismatches (e.g. in Storybook).
    try {
      const blob = new Blob([iframeContent], { type: 'text/html' });
      this._iframeObjectUrl = URL.createObjectURL(blob);
      this.iframe.src = this._iframeObjectUrl;
    } catch {
      const encodedContent = encodeURIComponent(iframeContent);
      this.iframe.src = `data:text/html;charset=utf-8,${encodedContent}`;
    }

    // Append iframe to component
    this.appendChild(this.iframe);
  }

  /**
   * IFRAME MODE: Send initialization data to iframe
   */
  #sendIframeInitData() {
    // Once iframe is loaded, send initialization data
    const properties = this.#addHyphenatedKeys(this.#unescapeDataAttributes({ ...this.dataset }));
    const storedStateRaw = this.context?.state?.[this.responseIdentifier];
    const storedState = typeof storedStateRaw === 'string' && storedStateRaw.length > 0 ? storedStateRaw : null;
    const initData = {
      module: this.module,
      customInteractionTypeIdentifier: this.customInteractionTypeIdentifier,
      baseUrl: !this.baseUrl
        ? window.location.origin
        : this.baseUrl.startsWith('http') || this.baseUrl.startsWith('blob') || this.baseUrl.startsWith('base64')
          ? this.baseUrl
          : removeDoubleSlashes(`${window.location.origin}${this.baseUrl}`),
      responseIdentifier: this.responseIdentifier,
      properties,
      contextVariables: this.getContextVariables(),
      templateVariables: this.getTemplateVariables(),
      dataAttributes: { ...this.dataset },
      interactionModules: this.#getInteractionModules(),
      boundTo: storedState ? null : this.boundTo,
      state: storedState
    };

    this.sendMessageToIframe('initialize', initData);
  }

  /**
   * IFRAME MODE: Get interaction modules from DOM
   */
  #getInteractionModules() {
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
  #addMarkupToIframe() {
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
  #initializeInteraction() {
    // No explicit action needed, as the PCI will initialize
    // with the boundTo property already provided
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Reflect any pre-existing response (e.g. restored session) for validation/completionStatus.
    this.response = (this.responseVariable?.value as string | string[] | null) ?? null;
    window.addEventListener('message', this.handleIframeMessage);
    this.createIframe();
  }

  /**
   * IFRAME MODE: Generate iframe HTML content
   */
  protected generateIframeContent(): string {
    const parentStyles = window.getComputedStyle(document.body);

    // Get the configured require paths and shim
    const requirePaths = JSON.stringify(this.#getFinalRequirePaths());
    const requireShim = JSON.stringify(this.#getFinalRequireShim());

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
    }
    qti-interaction-markup {
      display: block;
      width: 100%;
      min-height: 50px;
    }
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
	          responseIdentifier: (window.PCIManager && window.PCIManager.responseIdentifier) || null,
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
      markupEl: null,
      propertiesEl: null,
      customInteractionTypeIdentifier: null,
      responseIdentifier: null,
      pendingBoundTo: null,
      pendingMarkup: null,
      pendingProperties: null,
      pendingState: null,
      pendingStylesheets: null,
      stylesheetKeys: {},
      interactionChangedViaEvent: false,
      eventBridgeAttached: false,
      lastResponseStr: null,
      hadResponse: false,

      initialize: function(config) {
        this.customInteractionTypeIdentifier = config.customInteractionTypeIdentifier;
        this.responseIdentifier = config.responseIdentifier;
        this.container = document.getElementById('pci-container');
        this.container.classList.add('qti-customInteraction');

        function qtiVariableHasValue(qtiVar) {
          if (!qtiVar) return false;
          if (qtiVar.base) {
            for (const k in qtiVar.base) {
              if (!Object.prototype.hasOwnProperty.call(qtiVar.base, k)) continue;
              const v = qtiVar.base[k];
              if (v !== null && v !== undefined && v !== '') return true;
            }
          }
          if (qtiVar.list) {
            for (const k in qtiVar.list) {
              if (!Object.prototype.hasOwnProperty.call(qtiVar.list, k)) continue;
              const v = qtiVar.list[k];
              if (Array.isArray(v) && v.some(x => x !== null && x !== undefined && x !== '')) return true;
            }
          }
          if (Array.isArray(qtiVar.record) && qtiVar.record.length > 0) return true;
          return false;
        }

        const initialBoundTo = config.boundTo && config.boundTo[this.responseIdentifier];
        this.hadResponse = qtiVariableHasValue(initialBoundTo);
        this.lastResponseStr = this.hadResponse ? JSON.stringify(initialBoundTo) : null;
        // Ensure expected DOM structure exists (markup + properties)
        this.markupEl = this.container.querySelector('qti-interaction-markup');
        if (!this.markupEl) {
          this.markupEl = document.createElement('qti-interaction-markup');
          this.container.appendChild(this.markupEl);
        }
        this.markupEl.classList.add('qti-customInteraction');
        this.propertiesEl = this.container.querySelector('properties');
        if (!this.propertiesEl) {
          this.propertiesEl = document.createElement('properties');
          this.propertiesEl.style.display = 'none';
          this.container.appendChild(this.propertiesEl);
        } else {
          this.propertiesEl.style.display = 'none';
        }

        // Apply any markup/properties that arrived before initialization
        if (this.pendingMarkup !== null) {
          this.setMarkup(this.pendingMarkup);
          this.pendingMarkup = null;
        }
        if (this.pendingProperties !== null) {
          this.setProperties(this.pendingProperties);
          this.pendingProperties = null;
        }
        if (this.pendingStylesheets !== null) {
          this.setStylesheets(this.pendingStylesheets);
          this.pendingStylesheets = null;
        }

        // Bridge qti-interaction-changed events (preferred over polling)
        if (!this.eventBridgeAttached) {
          this.eventBridgeAttached = true;
          const self = this;
	          this.container.addEventListener(
	            'qti-interaction-changed',
	            function(evt) {
	              try {
	                self.interactionChangedViaEvent = true;
	                const value = evt && evt.detail ? evt.detail.value : undefined;
	                if (value !== undefined) {
	                  const state = self.pciInstance && typeof self.pciInstance.getState === 'function' ? self.pciInstance.getState() : null;
	                  self.notifyInteractionChanged(value, state);
	                }
	              } catch (e) {
	                // ignore bridge errors, polling fallback may still work
	              }
	            },
            true
          );
        }

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
                properties: config.properties || {},
                contextVariables: config.contextVariables || {},
                templateVariables: config.templateVariables || {},
                onready: pciInstance => {
                  this.pciInstance = pciInstance;
                  // Apply any pending updates that arrived before onready
                  if (this.pendingBoundTo) {
                    this.applyBoundTo(this.pendingBoundTo);
                    this.pendingBoundTo = null;
                  }
                  if (this.pendingState && typeof this.pciInstance.setState === 'function') {
                    this.pciInstance.setState(this.pendingState);
                    this.pendingState = null;
                  }
                  this.notifyReady();
                },
	                ondone: (pciInstance, response, state, status) => {
	                  this.notifyInteractionChanged(response, typeof state === 'string' ? state : null);
	                },
	                responseIdentifier: config.responseIdentifier,
	                boundTo: config.boundTo,
	              };

	              if (pciInstance.getInstance) {
	                const dom = this.markupEl || this.container;
	                // Round-trip support for object states (stored as a prefixed JSON string by the host).
	                // For strict string-based PCIs we pass the original string through unchanged.
	                let restoredState = config.state;
	                if (typeof restoredState === 'string' && restoredState.indexOf('__qti_json__::') === 0) {
	                  try {
	                    restoredState = JSON.parse(restoredState.substring('__qti_json__::'.length));
	                  } catch (e) {
	                    // If parsing fails, fall back to the raw string.
	                    restoredState = config.state;
	                  }
	                }
	                pciInstance.getInstance(dom, pciConfig, restoredState || undefined);
	              } else {
                // TAO custom interaction initialization
                const restoreTAOConfig = (dataset) => {
                    const config = {};
                    const parseDataAttributes = () => {
                      const result = {};

                      // Separate direct attributes from nested ones
                      Object.entries(dataset || {}).forEach(([key, value]) => {
                        if (!key.includes('__')) {
                          // Direct attributes (like version)
                          result[key] = value;
                        }
                      });

                      // Parse nested attributes
                      const nestedData = {};

                      Object.entries(dataset || {}).forEach(([key, value]) => {
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
                (this.markupEl || this.container).firstElementChild || (this.markupEl || this.container),
                Object.keys(taoConfig).length ? taoConfig : null
              );
              }
            },
            notifyReady: () => {
              PCIManager.notifyReady();
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
	          responseIdentifier: this.responseIdentifier,
	          method: 'iframeReady'
	        }, '*');
	      },

	      notifyInteractionChanged: function(response, state) {
	        window.parent.postMessage({
	          source: 'qti-pci-iframe',
	          responseIdentifier: this.responseIdentifier,
	          method: 'interactionChanged',
	          params: { value: response, state: state }
	        }, '*');
	      },

	      notifyError: function(message) {
	        console.error('PCI Error:', message);
	        window.parent.postMessage({
	          source: 'qti-pci-iframe',
	          responseIdentifier: this.responseIdentifier,
	          method: 'error',
	          params: { message: message }
	        }, '*');
	      },

      setMarkup: function(markupHtml) {
        if (!this.container) {
          this.container = document.getElementById('pci-container');
        }
        if (!this.container) {
          this.pendingMarkup = markupHtml;
          return;
        }
        this.markupEl = this.container.querySelector('qti-interaction-markup');
        if (!this.markupEl) {
          this.markupEl = document.createElement('qti-interaction-markup');
          this.container.appendChild(this.markupEl);
        }
        this.markupEl.classList.add('qti-customInteraction');
        this.markupEl.innerHTML = markupHtml || '';
      },

      setProperties: function(propertiesHtml) {
        if (!this.container) {
          this.container = document.getElementById('pci-container');
        }
        if (!this.container) {
          this.pendingProperties = propertiesHtml;
          return;
        }
        this.propertiesEl = this.container.querySelector('properties');
        if (!this.propertiesEl) {
          this.propertiesEl = document.createElement('properties');
          this.container.appendChild(this.propertiesEl);
        }
        this.propertiesEl.style.display = 'none';
        this.propertiesEl.innerHTML = propertiesHtml || '';
      },

      minifyCss: function(cssContent) {
        return cssContent
          .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
          .replace(/\\s+/g, ' ')
          .replace(/\\s*([{}:;])\\s*/g, '$1')
          .trim();
      },

      injectStylesheet: function(cssContent, key, scoped) {
        if (!cssContent) return;
        const head = document.head || document.getElementsByTagName('head')[0] || document.body;
        if (!head) return;
        const resolvedKey = key || '';
        if (resolvedKey && this.stylesheetKeys[resolvedKey]) return;
        const shouldScope = scoped !== false;
        const styleEl = document.createElement('style');
        styleEl.media = 'screen';
        if (resolvedKey) styleEl.setAttribute('data-qti-stylesheet', resolvedKey);
        const minified = this.minifyCss(cssContent);
        styleEl.textContent = shouldScope ? '@scope {' + minified + '}' : minified;
        head.appendChild(styleEl);
        if (resolvedKey) this.stylesheetKeys[resolvedKey] = true;
      },

      setStylesheets: function(stylesheets) {
        if (!Array.isArray(stylesheets)) return;
        stylesheets.forEach((sheet, index) => {
          if (!sheet) return;
          const key = sheet.key || sheet.href || ('inline-' + index);
          const scoped = sheet.scoped !== false;
          if (sheet.content) {
            this.injectStylesheet(sheet.content, key, scoped);
            return;
          }
          if (sheet.href) {
            fetch(sheet.href)
              .then(resp => resp.text())
              .then(css => this.injectStylesheet(css, key, scoped))
              .catch(() => {
                // ignore stylesheet load errors
              });
          }
        });
      },

      applyBoundTo: function(boundTo) {
        if (!this.pciInstance || typeof this.pciInstance.setResponse !== 'function') return;
        const value = boundTo && (boundTo[this.responseIdentifier] || boundTo[Object.keys(boundTo)[0]]);
        if (value) this.pciInstance.setResponse(value);
      },
    };

	    // Set up message listener for communication with parent
	    let expectedParentOrigin = null;
	    window.addEventListener('message', function(event) {
	      const { data } = event;

	      // Ensure the message is from our parent
	      if (event.source !== window.parent || !data || data.source !== 'qti-portable-custom-interaction') {
	        return;
	      }
	      if (expectedParentOrigin === null) {
	        expectedParentOrigin = event.origin;
	      } else if (event.origin !== expectedParentOrigin) {
	        return;
	      }

      function deepQuerySelector(root, selector) {
        if (!root) return null;
        try {
          const direct = root.querySelector ? root.querySelector(selector) : null;
          if (direct) return direct;
        } catch (e) {
          // ignore invalid selector for this root
        }
        if (!root.querySelectorAll) return null;
        const nodes = root.querySelectorAll('*');
        for (const node of nodes) {
          if (node && node.shadowRoot) {
            const found = deepQuerySelector(node.shadowRoot, selector);
            if (found) return found;
          }
        }
        return null;
      }

      function deepFindElementByExactText(root, text) {
        if (!root || !text) return null;
        if (root.querySelectorAll) {
          const nodes = root.querySelectorAll('*');
          for (const node of nodes) {
            if ((node.textContent || '').trim() === text) return node;
            if (node.shadowRoot) {
              const found = deepFindElementByExactText(node.shadowRoot, text);
              if (found) return found;
            }
          }
        }
        return null;
      }

      switch(data.method) {
        case 'initialize':
          PCIManager.initialize(data.params);
          break;

        case 'setMarkup':
          PCIManager.setMarkup(data.params);
          break;

        case 'setBoundTo':
          if (PCIManager.pciInstance) {
            PCIManager.applyBoundTo(data.params);
          } else {
            PCIManager.pendingBoundTo = data.params;
          }
          break;

        case 'setProperties':
          PCIManager.setProperties(data.params);
          break;

        case 'setStylesheets':
          PCIManager.setStylesheets(data.params);
          break;

        case 'setState':
          if (PCIManager.pciInstance && typeof PCIManager.pciInstance.setState === 'function') {
            PCIManager.pciInstance.setState((data.params && data.params.state) || data.params);
          } else {
            PCIManager.pendingState = (data.params && data.params.state) || data.params;
          }
          break;

        case 'getContent': {
          const messageId = data.params && data.params.messageId;
          const collectShadowHtml = root => {
            const parts = [];
            if (!root || !root.querySelectorAll) return parts;
            const nodes = root.querySelectorAll('*');
            for (const node of nodes) {
              if (node && node.shadowRoot) {
                parts.push(node.shadowRoot.innerHTML || '');
                parts.push(...collectShadowHtml(node.shadowRoot));
              }
            }
            return parts;
          };
          const shadowHtml = collectShadowHtml(document).join('\\n');
	          window.parent.postMessage(
	            {
	              source: 'qti-pci-iframe',
	              responseIdentifier: PCIManager.responseIdentifier,
	              method: 'getContentResponse',
	              messageId: messageId,
	              content: (document.documentElement ? document.documentElement.outerHTML : '') + '\\n' + shadowHtml
	            },
	            '*'
	          );
          break;
        }

        case 'simulateClick': {
          const messageId = data.params && data.params.messageId;
          const x = data.params && data.params.x;
          const y = data.params && data.params.y;
          const el = typeof x === 'number' && typeof y === 'number' ? document.elementFromPoint(x, y) : null;
	          if (el && typeof el.click === 'function') el.click();
	          window.parent.postMessage(
	            {
	              source: 'qti-pci-iframe',
	              responseIdentifier: PCIManager.responseIdentifier,
	              method: 'clickResponse',
	              messageId: messageId
	            },
	            '*'
	          );
	          break;
	        }

        case 'clickOnSelector': {
          const messageId = data.params && data.params.messageId;
          const selector = data.params && data.params.selector;
          const el = selector ? deepQuerySelector(document, selector) : null;
	          const success = !!el;
	          if (el && typeof el.click === 'function') el.click();
	          window.parent.postMessage(
	            {
	              source: 'qti-pci-iframe',
	              responseIdentifier: PCIManager.responseIdentifier,
	              method: 'clickSelectorResponse',
	              messageId: messageId,
	              success: success
	            },
	            '*'
	          );
	          break;
	        }

        case 'clickOnElementByText': {
          const messageId = data.params && data.params.messageId;
          const text = data.params && data.params.text;
          const target = text ? deepFindElementByExactText(document, text) : null;
	          const success = !!target;
	          if (target && typeof target.click === 'function') target.click();
	          window.parent.postMessage(
	            {
	              source: 'qti-pci-iframe',
	              responseIdentifier: PCIManager.responseIdentifier,
	              method: 'clickTextResponse',
	              messageId: messageId,
	              success: success
	            },
	            '*'
	          );
	          break;
	        }

        case 'setValueElement': {
          const messageId = data.params && data.params.messageId;
          const selector = data.params && data.params.selector;
          const value = data.params && data.params.value;
          const el = selector ? deepQuerySelector(document, selector) : null;
          let success = false;
          if (el && 'value' in el) {
            try {
              el.value = value;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              success = true;
            } catch (e) {
              success = false;
            }
	          }
	          window.parent.postMessage(
	            {
	              source: 'qti-pci-iframe',
	              responseIdentifier: PCIManager.responseIdentifier,
	              method: 'setValueResponse',
	              messageId: messageId,
	              success: success
	            },
	            '*'
	          );
	          break;
	        }
      }
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
	            responseIdentifier: PCIManager.responseIdentifier,
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
        if (PCIManager.interactionChangedViaEvent) return;
        if (PCIManager.pciInstance && PCIManager.pciInstance.getResponse) {
          const response = PCIManager.pciInstance.getResponse();
	          if (response === undefined) {
	            // Don't emit an initial empty on load; only emit a clear if we previously had a value
	            if (!PCIManager.hadResponse) return;
	            PCIManager.hadResponse = false;
	            PCIManager.lastResponseStr = null;
	            const state = PCIManager.pciInstance && typeof PCIManager.pciInstance.getState === 'function' ? PCIManager.pciInstance.getState() : null;
	            window.parent.postMessage(
	              {
	                source: 'qti-pci-iframe',
	                responseIdentifier: PCIManager.responseIdentifier,
	                method: 'interactionChanged',
	                params: { value: null, state: state }
	              },
	              '*'
	            );
	            return;
	          }

          const responseStr = JSON.stringify(response);

	          if (responseStr !== PCIManager.lastResponseStr) {
	            PCIManager.lastResponseStr = responseStr;
	            PCIManager.hadResponse = true;
	            const state = PCIManager.pciInstance && typeof PCIManager.pciInstance.getState === 'function' ? PCIManager.pciInstance.getState() : null;
	            window.parent.postMessage(
	              {
	                source: 'qti-pci-iframe',
	                responseIdentifier: PCIManager.responseIdentifier,
	                method: 'interactionChanged',
	                params: { value: response, state: state }
	              },
	              '*'
	            );
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
  public override toggleInternalCorrectResponse(show: boolean) {
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

    // Ensure the correct-response viewer is initialized and then configured in the iframe
    const originalConnectedCallback = correctResponseViewer.connectedCallback;
    correctResponseViewer.connectedCallback = function () {
      originalConnectedCallback.call(this);

      const checkIframeLoaded = () => {
        if (!this._iframeLoaded) return false;

        // Set response after a small delay to ensure PCI is ready
        setTimeout(() => {
          const qtiVariableJSON = this.responseVariablesToQtiVariableJSON(
            correctResponseValue,
            responseVariable.cardinality,
            responseVariable.baseType
          );

          this.sendMessageToIframe('setBoundTo', {
            [originalResponseId]: qtiVariableJSON
          });
          this.sendMessageToIframe('setState', { state: 'review' });
        }, 1000);

        return true;
      };

      if (!checkIframeLoaded()) {
        const intervalId = setInterval(() => {
          if (checkIframeLoaded()) clearInterval(intervalId);
        }, 100);

        setTimeout(() => {
          clearInterval(intervalId);
        }, 10000);
      }
    };

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
    this.#previousState = {
      pointerEvents: this.style.pointerEvents,
      position: this.style.position
    };

    this.sendMessageToIframe('setState', { state: 'disabled' });

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
    if (this.#previousState) {
      if (this.#previousState.pointerEvents) {
        this.style.pointerEvents = this.#previousState.pointerEvents;
      }
      if (this.#previousState.position) {
        this.style.position = this.#previousState.position;
      }
      this.#previousState = null;
    }

    this.sendMessageToIframe('setState', { state: 'interacting' });
  }

  // Add this property to store the previous state
  #previousState: {
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
