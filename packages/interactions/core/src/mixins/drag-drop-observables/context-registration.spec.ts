import { expect, test, describe } from 'vitest';

import '@qti-components/interactions';

/**
 * A chip announces itself to its interaction, instead of being found by a query.
 *
 * `ContextConsumer` dispatches `context-request` with `bubbles: true, composed: true`, so it
 * crosses shadow boundaries. The interaction listens for it and records `event.contextTarget`.
 *
 * This is what makes Stage B possible. Once a drop target renders its chips into its *own* shadow
 * root, `interaction.querySelectorAll(draggablesSelector)` cannot see them — a query stops at the
 * boundary — and neither can `droppable.contains(chip)`. The registration event does not.
 *
 * Three properties of @lit/context this depends on, each verified in its source and pinned here:
 *
 *   1. the request is `composed`, so it escapes a shadow root;
 *   2. the provider calls `stopPropagation()` when it satisfies a request, so the interaction must
 *      listen in the **capture** phase;
 *   3. `event.target` is retargeted to the shadow host, so the event carries `contextTarget` —
 *      the real requester. The provider itself reads `ev.contextTarget ?? ev.composedPath()[0]`.
 */

const settle = () => new Promise(r => setTimeout(r, 300));
const el = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;

/** A stand-in for a Stage-B drop target: it renders a chip into its own shadow root. */
class ShadowDropTarget extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const chip = document.createElement('qti-gap-text');
    chip.setAttribute('identifier', 'hidden_chip');
    chip.setAttribute('qti-draggable', 'true');
    chip.textContent = 'deep';
    root.append(chip);
  }
}
customElements.define('shadow-drop-target', ShadowDropTarget);

describe('a chip registers itself with its interaction', () => {
  test('a chip one shadow root deep is invisible to querySelectorAll but registers', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <p>In the <qti-gap identifier="G1"></qti-gap> of our discontent.</p>
      </qti-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');

    // Put a chip inside another element's shadow root, still within the interaction's subtree.
    const target = document.createElement('shadow-drop-target');
    interaction.appendChild(target);
    await settle();

    const deepChip = target.shadowRoot!.querySelector('qti-gap-text')!;

    // The query the mixin has always used cannot reach it.
    expect(interaction.querySelectorAll('qti-gap-text'), 'querySelectorAll stops at the shadow boundary').not.toContain(
      deepChip
    );
    expect(target.contains(deepChip), 'and Node.contains does too').toBe(false);

    // The registration event does.
    expect(interaction.registeredMatching('qti-gap-text'), 'the chip announced itself').toContain(deepChip);
  });

  test('the registry is unioned into trackedDraggables, never replaces the query', async () => {
    document.body.innerHTML = `
      <qti-graphic-gap-match-interaction response-identifier="R">
        <img slot="image" alt="" />
        <qti-gap-img identifier="G1" match-max="1"><img alt="" /></qti-gap-img>
        <qti-associable-hotspot coords="0,0,10,10" identifier="H1" match-max="1" shape="rect"></qti-associable-hotspot>
      </qti-graphic-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-graphic-gap-match-interaction');

    // qti-gap-img has no ActiveElementMixin, so it never consumes interactionContext and never
    // registers. It must still be tracked, which is why the registry is a union, not a swap.
    expect(interaction.registeredMatching('qti-gap-img'), 'it does not register').toHaveLength(0);
    expect(interaction.trackedDraggables.map((d: HTMLElement) => d.getAttribute('identifier'))).toContain('G1');
  });

  test('a chip that leaves the DOM is pruned from the registry', async () => {
    document.body.innerHTML = `
      <qti-gap-match-interaction response-identifier="R">
        <qti-gap-text identifier="winter" match-max="1">winter</qti-gap-text>
        <p>In the <qti-gap identifier="G1"></qti-gap> of our discontent.</p>
      </qti-gap-match-interaction>`;
    await settle();

    const interaction = el<any>('qti-gap-match-interaction');
    const chip = el('[identifier="winter"]');

    expect(interaction.registeredMatching('qti-gap-text')).toContain(chip);

    // @lit/context has no "consumer disconnected" event, so the registry prunes by isConnected.
    chip.remove();
    await settle();

    expect(interaction.registeredMatching('qti-gap-text'), 'pruned lazily').not.toContain(chip);
  });
});
