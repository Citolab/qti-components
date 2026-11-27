import { expect, userEvent, waitFor } from 'storybook/test';
import { within } from 'shadow-dom-testing-library';

import type { QtiTest } from '@qti-components/test';

/**
 * What a candidate does in a conformance story about a test: read the item on screen, answer it, end
 * the attempt and move on with the buttons the story renders. The suite's sample items show their
 * title as a heading, so the item on screen is found by that text.
 */
export const candidateIn = (canvasElement: HTMLElement) => {
  const screen = within(canvasElement);
  const container = () => canvasElement.querySelector('test-container') as HTMLElement;
  const qtiTest = () => canvasElement.querySelector('qti-test') as QtiTest;

  /** The item-ref of the item on screen, once one is. */
  const current = () =>
    // query-exception: which item-ref and section the item on screen belongs to has no accessible name
    container().shadowRoot?.querySelector<HTMLElement>(
      `qti-assessment-item-ref[identifier="${qtiTest().sessionContext?.navItemRefId}"]`
    );

  return {
    /** Waits until the item whose heading is `title` is on screen. */
    sees: async (title: string) => {
      await waitFor(
        async () => {
          const heading = await screen.findByShadowRole('heading', { name: title }, { timeout: 15000 });
          expect(heading).toBeVisible();
        },
        {
          timeout: 15000,
          onTimeout: () =>
            new Error(
              `"${title}" is not on screen; the item-ref on screen is ${qtiTest().sessionContext?.navItemRefId}`
            )
        }
      );
    },
    /** The identifier of the section the item on screen sits in. */
    section: () => current()?.closest('qti-assessment-section')?.getAttribute('identifier') ?? null,
    /** The identifier of the item-ref on screen. */
    itemRef: () => qtiTest().sessionContext?.navItemRefId ?? null,
    /** Clicks the visible text, e.g. a choice of the item on screen. */
    choose: async (text: string) => {
      const choices = await screen.findAllByShadowText(text);
      const visible = choices.find(choice => choice.checkVisibility()) ?? choices[0];
      await userEvent.click(visible);
    },
    press: async (label: string) => {
      const button = await screen.findByShadowText(label);
      await waitFor(() => expect(button).toBeEnabled(), { timeout: 5000 });
      await userEvent.click(button);
    },
    button: (label: string) => screen.findByShadowText(label),
    test: qtiTest
  };
};
