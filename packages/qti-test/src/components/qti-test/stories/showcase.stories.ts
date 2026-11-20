import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import '../../../../../../.storybook/utilities.css';
import { SHOWCASE_TEST } from '../showcase.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { ModuleResolutionConfig, transformItemApi } from '@qti-components/transformers';
import type { QtiTest } from '../qti-test';

/**
 * The showcase test (`public/assets/tests/showcase/`). Its play function opens every item, so a
 * missing item, image, sound or module fails here.
 */
const meta: Meta = {
  title: 'Fixtures/Showcase',
  component: 'qti-test'
};
export default meta;

/** Every item in the test, in test order. */
const ITEMS = [
  'ITEM001', 'ITEM002', 'ITEM028', 'ITEM006', 'ITEM010', 'ITEM011', 'ITEM012',
  'ITEM003', 'ITEM004', 'ITEM005',
  'ITEM007', 'ITEM008', 'ITEM009', 'ITEM017', 'ITEM022', 'ITEM015', 'ITEM013', 'ITEM014',
  'ITEM018', 'ITEM016', 'ITEM020', 'ITEM021', 'ITEM019', 'ITEM025',
  'ITEM023', 'ITEM024', 'ITEM026', 'ITEM027'
]; // prettier-ignore

/**
 * A PCI resolves its modules against `data-base-url`, which only `configurePci` sets, so a host with
 * a PCI in its test passes a callback like this one. The showcase PCI has no `module_resolution.js`.
 */
const configurePci = (transformer: transformItemApi, itemRef: { href: string }) => {
  const path = new URL(itemRef.href, window.location.origin).pathname;
  const baseUrl = path.substring(0, path.lastIndexOf('/'));
  const noModuleResolution = async (): Promise<ModuleResolutionConfig> => null;
  return transformer.configurePci(baseUrl, noModuleResolution);
};

const loadedItem = (canvasElement: HTMLElement, identifier: string) =>
  waitFor(
    () => {
      const container = canvasElement.querySelector('test-container');
      const item = container?.shadowRoot?.querySelector<HTMLElement>(`qti-assessment-item[identifier="${identifier}"]`);
      if (!item) throw new Error(`${identifier} is not loaded yet`);
      return item;
    },
    { timeout: 15000 }
  );

export const Showcase: StoryObj = {
  parameters: { testTimeout: 180000, chromatic: { disableSnapshot: true } },
  render: () => html`
    <qti-test navigate="item" .postLoadTransformCallback=${configurePci}>
      <test-navigation class="flex flex-col gap-3" style="max-width: 60rem; margin-inline: auto">
        <!-- With navigate="item", a test-section-link leaves no item active (Next stays disabled), so each
             section button is a link to that section's first item. -->
        <test-stamp class="flex flex-wrap gap-1">
          <template>
            <template type="repeat" repeat="{{ activeTestpart.sections }}">
              <test-item-link item-id="{{ item.items[0].identifier }}" class="{{ item.active ? 'active' : '' }}"
                >{{ item.title }}</test-item-link
              >
            </template>
          </template>
        </test-stamp>
        <test-stamp class="flex flex-wrap gap-1">
          <template>
            <template type="repeat" repeat="{{ activeSection.items }}">
              <test-item-link item-id="{{ item.identifier }}" class="{{ item.active ? 'active' : '' }}"
                >{{ item.identifier }}</test-item-link
              >
            </template>
          </template>
        </test-stamp>
        <test-container class="block h-100 overflow-auto border rounded p-3" test-url=${SHOWCASE_TEST}></test-container>
        <nav class="flex justify-between">
          <test-prev>Previous</test-prev>
          <test-next>Next</test-next>
        </nav>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement, step }) => {
    const test = canvasElement.querySelector<QtiTest>('qti-test');
    await loadedItem(canvasElement, ITEMS[0]);

    for (const identifier of ITEMS) {
      await step(identifier, async () => {
        // Navigating to the item that is already open would reload it, so only move when needed.
        const container = canvasElement.querySelector('test-container');
        if (!container?.shadowRoot?.querySelector(`qti-assessment-item[identifier="${identifier}"]`)) {
          test.navigateTo('item', identifier);
        }
        const item = await loadedItem(canvasElement, identifier);

        // Every interaction in the item is a defined, rendered custom element.
        const interactions = Array.from(item.querySelectorAll('*')).filter(el =>
          /^qti-.*-interaction$/.test(el.localName)
        );
        expect(interactions.length, `${identifier} has an interaction`).toBeGreaterThan(0);
        for (const interaction of interactions) {
          expect(customElements.get(interaction.localName), `${interaction.localName} is defined`).toBeDefined();
        }

        // Every image loads (a wrong path in the package shows up here, not as a broken picture).
        await waitFor(
          async () => {
            const current = await loadedItem(canvasElement, identifier);
            for (const img of Array.from(current.querySelectorAll('img'))) {
              expect(img.complete && img.naturalWidth > 0, `${img.getAttribute('src')} loads`).toBe(true);
            }
          },
          { timeout: 10000 }
        );

        // Sound files are not fetched until played, so ask for them.
        const sources = Array.from(item.querySelectorAll('audio source, video source'));
        if (item.querySelector('qti-media-interaction'))
          expect(sources.length, 'the media has a source').toBeGreaterThan(0);
        for (const source of sources) {
          const response = await fetch((source as HTMLSourceElement).src, { method: 'HEAD' });
          expect(response.ok, `${source.getAttribute('src')} exists`).toBe(true);
        }

        // The portable custom interaction loads its module and the module reports ready. Only the
        // test subclass exposes `waitForReady()`; the real element keeps the flag protected.
        const pci = item.querySelector('qti-portable-custom-interaction') as unknown as {
          _interactionReady: boolean;
        } | null;
        if (pci) await waitFor(() => expect(pci._interactionReady, 'the PCI is ready').toBe(true), { timeout: 10000 });
      });
    }

    // Leave the story on the first item, so a reader starts at the beginning.
    test.navigateTo('item', ITEMS[0]);
    await loadedItem(canvasElement, ITEMS[0]);
  }
};
