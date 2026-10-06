import { ContextRoot } from '@lit/context';

const INSTALLED = Symbol.for('qti-components.context-root');

/**
 * Catches context requests nobody answered and asks again when a provider connects, so a component
 * that upgrades before the element providing its context still gets the value.
 *
 * It has to live on the document and not on one of our elements: the case it exists for is the
 * providing element not having upgraded yet, so there is nothing of ours to attach it to. It holds
 * only requests that subscribe, which every `@consume` in this library does, and it holds them
 * weakly, so nothing is kept alive that would not be anyway.
 *
 * Once per page, however many copies of the package the page ends up with.
 */
export const installContextRoot = (): void => {
  if (typeof document === 'undefined') return;
  const page = globalThis as unknown as Record<symbol, ContextRoot | undefined>;
  if (page[INSTALLED]) return;
  page[INSTALLED] = new ContextRoot();
  page[INSTALLED].attach(document.documentElement);
};

installContextRoot();
