import { ContextRoot } from '@lit/context';

import { qtiInteractionElements } from './elements';

// Interaction containers (providers) and their children (consumers) can upgrade in either
// order depending on how the host page renders them (e.g. static SSR markup vs. Storybook's
// eager module import), so a plain @provide/@consume pair can miss its context-request event.
// ContextRoot buffers unanswered requests at the document root and replays them once the
// matching provider connects. See https://lit.dev/docs/data/context/#contextroot
new ContextRoot().attach(document.documentElement);

for (const { tag, ctor } of qtiInteractionElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
