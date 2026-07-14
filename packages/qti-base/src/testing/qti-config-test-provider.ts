import { provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { configContext } from '../context/config.context';

import type { ConfigContext } from '../context/config.context';

/**
 * Test-only wrapper that provides `configContext` to slotted descendants.
 *
 * Usage:
 * ```ts
 * html`<qti-config-test-provider .config=${{ disableAfterMaxReached: true }}>...</qti-config-test-provider>`
 * ```
 */
@customElement('qti-config-test-provider')
export class QtiConfigTestProvider extends LitElement {
  @state()
  @provide({ context: configContext })
  public configContext: ConfigContext = {};

  @property({ attribute: false })
  get config(): ConfigContext {
    return this.configContext;
  }

  set config(value: ConfigContext) {
    this.configContext = value ?? {};
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-config-test-provider': QtiConfigTestProvider;
  }
}
