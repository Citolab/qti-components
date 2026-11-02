import { ContextConsumer, ContextProvider } from '@lit/context';
import { LitElement } from 'lit';

import { installContextRoot } from './context-root';
import { qtiContext } from './qti.context';

import type { QtiContext } from './qti.context';

/**
 * A component that asks for a context before anything provides it still gets the value once a
 * provider appears. The library attaches a `ContextRoot` to the page for that: it holds the
 * requests nobody answered and asks again when a provider connects.
 *
 * The elements here are defined in the test, in the order that matters: the consumer first, the
 * provider after it has already been placed around the consumer in the page. The tags are unique
 * per run because a custom element can only be defined once.
 */
const VALUE: QtiContext = {
  QTI_CONTEXT: { testIdentifier: 'late', candidateIdentifier: 'c', environmentIdentifier: 'default' }
};

type Received = HTMLElement & { received?: QtiContext };

let run = 0;

/** A consumer of the real `qtiContext`, and a provider of it, under tags unique to this run. */
const lateElements = () => {
  const id = `${Date.now().toString(36)}-${run++}`;
  const consumerTag = `late-consumer-${id}`;
  const providerTag = `late-provider-${id}`;

  class Consumer extends LitElement {
    received?: QtiContext;
    // Must subscribe: only a subscribing request is held for a provider that is not there yet.
    constructor() {
      super();
      new ContextConsumer(this, {
        context: qtiContext,
        subscribe: true,
        callback: value => (this.received = value)
      });
    }
  }
  class Provider extends LitElement {
    constructor() {
      super();
      new ContextProvider(this, { context: qtiContext, initialValue: VALUE });
    }
  }
  customElements.define(consumerTag, Consumer);
  return { consumerTag, providerTag, defineProvider: () => customElements.define(providerTag, Provider) };
};

describe('context root', () => {
  let host: HTMLElement;

  beforeEach(() => {
    installContextRoot();
    host = document.createElement('div');
    document.body.append(host);
  });

  afterEach(() => host.remove());

  it('delivers the context to a consumer whose provider is defined after it', async () => {
    const { consumerTag, providerTag, defineProvider } = lateElements();
    host.innerHTML = `<${providerTag}><${consumerTag}></${consumerTag}></${providerTag}>`;
    const consumer = host.querySelector<Received>(consumerTag);

    // The consumer is connected and has asked; the provider is still a plain unknown element.
    await Promise.resolve();
    expect(consumer.received).toBeUndefined();

    defineProvider();

    await vi.waitFor(() => expect(consumer.received).toEqual(VALUE));
  });

  it('does the same when the consumer sits inside a shadow root, which the request has to cross as well', async () => {
    const { consumerTag, providerTag, defineProvider } = lateElements();
    host.innerHTML = `<${providerTag}><div id="wrapper"></div></${providerTag}>`;
    const wrapper = host.querySelector('#wrapper');
    wrapper.attachShadow({ mode: 'open' }).innerHTML = `<${consumerTag}></${consumerTag}>`;
    const consumer = wrapper.shadowRoot.querySelector<Received>(consumerTag);

    await Promise.resolve();
    expect(consumer.received).toBeUndefined();

    defineProvider();

    await vi.waitFor(() => expect(consumer.received).toEqual(VALUE));
  });
});
