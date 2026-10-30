// The layout classes of the demos; Storybook chrome, not a package this app depends on.
// eslint-disable-next-line import/no-relative-packages
import utilitiesCss from '../../../../../.storybook/utilities.css?inline';
import { correctionRegistry } from '../kennisnet/with-correction';

const utilitiesSheet = new CSSStyleSheet();
utilitiesSheet.replaceSync(utilitiesCss);

/**
 * Mounts `markup` with the corrections elements, the way `import '@citolab/qti-components/corrections'`
 * does on a page of its own.
 *
 * Storybook already registered the standard elements globally, and a tag has one constructor per
 * registry, so the demo gets a scoped registry instead: a shadow root whose registry holds the
 * correction classes. The markup is parsed inside that root (`innerHTML`), because an element keeps
 * the registry of the document that created it; built outside and moved in, it would stay standard.
 *
 * A container renders its items with a registry of its own, so each `item-container` and
 * `test-container` gets the same corrections registry.
 *
 * Returns the host element; the demo lives in `host.shadowRoot`.
 */
export const mountWithCorrections = (markup: string): HTMLElement => {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open', customElementRegistry: correctionRegistry() });
  shadow.adoptedStyleSheets = [utilitiesSheet];
  shadow.innerHTML = markup;
  for (const container of shadow.querySelectorAll<HTMLElement & { customElementRegistry: CustomElementRegistry }>(
    'item-container, test-container'
  )) {
    container.customElementRegistry = correctionRegistry();
  }
  return host;
};
