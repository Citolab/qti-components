import { ContextConsumer, ContextProvider } from '@lit/context';
import { LitElement } from 'lit';
import { expect, waitFor } from 'storybook/test';

import { qtiContext } from '../qti.context';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiContext } from '../qti.context';

/**
 * A component that asks for a context before anything provides it still gets the value once a
 * provider appears. The library attaches a `ContextRoot` to the page for that: it holds the
 * requests nobody answered and asks again when a provider connects.
 *
 * The elements here are defined in the story, in the order that matters: the consumer first, the
 * provider after it has already been placed around the consumer in the page. The tags are unique
 * per run because a custom element can only be defined once.
 */
const meta: Meta = {
  title: 'qti-base/Context root',
  parameters: { testTimeout: 15000 }
};
export default meta;

const VALUE: QtiContext = {
  QTI_CONTEXT: { testIdentifier: 'late', candidateIdentifier: 'c', environmentIdentifier: 'default' }
};

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

export const ProviderDefinedAfterTheConsumer: StoryObj = {
  render: () => document.createElement('div'),
  play: async ({ canvasElement }) => {
    const { consumerTag, providerTag, defineProvider } = lateElements();
    canvasElement.innerHTML = `<${providerTag}><${consumerTag}></${consumerTag}></${providerTag}>`;
    const consumer = canvasElement.querySelector<HTMLElement & { received?: QtiContext }>(consumerTag);

    // The consumer is connected and has asked; the provider is still a plain unknown element.
    await Promise.resolve();
    expect(consumer.received).toBeUndefined();

    defineProvider();

    await waitFor(() => expect(consumer.received).toEqual(VALUE));
  }
};

/** The same, with the consumer inside a shadow root, which the request has to cross as well. */
export const ProviderDefinedAfterTheConsumerInAShadowRoot: StoryObj = {
  render: () => document.createElement('div'),
  play: async ({ canvasElement }) => {
    const { consumerTag, providerTag, defineProvider } = lateElements();
    canvasElement.innerHTML = `<${providerTag}><div id="wrapper"></div></${providerTag}>`;
    const wrapper = canvasElement.querySelector('#wrapper');
    wrapper.attachShadow({ mode: 'open' }).innerHTML = `<${consumerTag}></${consumerTag}>`;
    const consumer = wrapper.shadowRoot.querySelector<HTMLElement & { received?: QtiContext }>(consumerTag);

    await Promise.resolve();
    expect(consumer.received).toBeUndefined();

    defineProvider();

    await waitFor(() => expect(consumer.received).toEqual(VALUE));
  }
};
