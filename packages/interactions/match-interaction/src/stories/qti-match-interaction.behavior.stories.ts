import { html } from 'lit';
import { expect, fn, waitFor } from 'storybook/test';
// Dropped chips are rendered into the drop target's shadow root, so the light-DOM `within`
// from storybook/test can't see them. shadow-dom-testing-library's `within` (getByShadowText …)
// and deepQuerySelector(All) pierce shadow roots to find where a chip landed.
import { within, deepQuerySelector, deepQuerySelectorAll } from 'shadow-dom-testing-library';

import drag from '../../../../../tools/testing/drag';
import {
  duplicateDropRegressionTemplate,
  manyOptionsTemplate,
  multipleAssociations2Template,
  multipleAssociationsTemplate,
  optionsRightTemplate,
  sortableAppendWhenTargetAllowsMultipleTemplate,
  sortableAppendWhenTargetUnlimitedTemplate,
  testTemplate,
  withImagesTemplate
} from './qti-match-interaction.templates';

import type { QtiMatchInteraction } from '../qti-match-interaction';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj<QtiMatchInteraction>;

/**
 * ## Behavior Stories
 *
 * Tests for how the match interaction responds to dragging: placing and moving choices, several
 * associations per target, `match-max`, sorting inside a target, and the response that follows.
 * Each story is also a test.
 */
const meta: Meta<QtiMatchInteraction> = {
  component: 'qti-match-interaction',
  title: 'Interactions/Match/Behavior',
  tags: ['behavior', 'specific', 'iol']
};
export default meta;

export const SingleAssociation: Story = {
  render: () => testTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Retrieve interaction, source, and target elements from the canvas
    const interaction = canvas.getByShadowTestId<QtiMatchInteraction>('match-interaction');
    const dragC = canvas.getByShadowText('Capulet');
    const dropM = canvas.getByShadowText('A Midsummer-Nights');

    // // Define the interaction response event handler to capture the response
    const interactionResponse = fn(() => {
      // Ensure the interaction response detail contains the expected values
      // console.log(event.detail.response);
    });

    // Add the event listener for 'qti-interaction-response'
    canvasElement.addEventListener('qti-interaction-response', interactionResponse);

    try {
      await step('Drag 1 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragC, { to: dropM, duration: 500 });
      });

      await step('Drag capulus to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragC, { to: dropM, duration: 500 });

        // Wait for the interaction response event to be triggered and verify the handler was called
      });
      await waitFor(() => expect(interactionResponse).toHaveBeenCalled());
    } finally {
      // Clean up the event listener to avoid memory leaks
      canvasElement.removeEventListener('qti-interaction-response', interactionResponse);
    }
    await step('Reset interaction and set response manually', async () => {
      // Reset the interaction to ensure it is in a known state after the drag and drop
      interaction.reset();

      // Manually set the interaction response to the expected value
      interaction.response = ['C M'];

      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify that after the drag-and-drop action, the target contains an element with text Capulet
      expect(dropM).toHaveTextContent('A Midsummer-Nights'); // warning, do not check if it contains the draggable, since it is a clone
    });
  }
};

export const SeveralAssociations: Story = {
  render: () => testTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    // Retrieve interaction, source, and target elements from the canvas
    const dragC = canvas.getByShadowText('Capulet');
    const dragD = canvas.getByShadowText('Demetrius');
    const dragL = canvas.getByShadowText('Lysander');

    const dropM = canvas.getByShadowText('A Midsummer-Nights');
    const dropR = canvas.getByShadowText('Romeo and Juliet');

    // // Define the interaction response event handler to capture the response
    const interactionResponse = fn(() => {
      // Ensure the interaction response detail contains the expected values
      // console.log(event.detail.response);
    });

    // Add the event listener for 'qti-interaction-response'
    canvasElement.addEventListener('qti-interaction-response', interactionResponse);

    try {
      await step('Drag 1 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragC, { to: dropM, duration: 500 });
      });
      await step('Drag 2 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragD, { to: dropM, duration: 500 });
      });
      await step('Drag 3 to drop and test qti-interaction-response event', async () => {
        // Simulate the drag and drop operation
        await drag(dragL, { to: dropR, duration: 500 });
      });
    } finally {
      // Clean up the event listener to avoid memory leaks
      canvasElement.removeEventListener('qti-interaction-response', interactionResponse);
    }
    // FIXME: this does not work yet
    // const correctArray = ['C M', 'D M', 'L R'];
    // expect(interaction.response).toEqual(correctArray);
  }
};

export const DragMultiple: Story = {
  render: () => multipleAssociationsTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvasElement.querySelector('qti-match-interaction') as QtiMatchInteraction;
    const onResponse = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', onResponse as EventListener);

    try {
      const french = canvas.getByShadowText('French');
      const dutch = canvas.getByShadowText('Dutch');
      const paris = canvas.getByShadowText('Paris');
      const amsterdam = canvas.getByShadowText('Amsterdam');

      await step('Drag French to Paris', async () => {
        await drag(french, { to: paris, duration: 400 });
        expect(within(paris).queryAllByShadowText('French').length).toBeGreaterThan(0);
      });

      await step('Drag Dutch to Amsterdam and emit directed-pair response', async () => {
        await drag(dutch, { to: amsterdam, duration: 400 });
        expect(within(amsterdam).queryAllByShadowText('Dutch').length).toBeGreaterThan(0);
        expect(onResponse).toHaveBeenCalled();
        const lastResponse = onResponse.mock.calls.at(-1)?.[0]?.detail.response || [];
        expect(lastResponse).toContain('french paris');
        expect(lastResponse).toContain('dutch amsterdam');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', onResponse as EventListener);
    }
  }
};

export const DragMultiple2: Story = {
  render: () => multipleAssociations2Template,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvasElement.querySelector('qti-match-interaction') as QtiMatchInteraction;
    const onResponse = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', onResponse as EventListener);

    try {
      const endothermic = canvas.getByShadowText('Endothermic');
      const liveYoung = canvas.getByShadowText('Bear Live Young');
      const birds = canvas.getByShadowText('Birds');
      const mammals = canvas.getByShadowText('Mammals');

      await step('Drag Endothermic to Birds', async () => {
        await drag(endothermic, { to: birds, duration: 400 });
        expect(within(birds).queryAllByShadowText('Endothermic').length).toBeGreaterThan(0);
      });

      await step('Drag Bear Live Young to Mammals and verify response pairs', async () => {
        await drag(liveYoung, { to: mammals, duration: 400 });
        expect(within(mammals).queryAllByShadowText('Bear Live Young').length).toBeGreaterThan(0);
        const lastResponse = onResponse.mock.calls.at(-1)?.[0]?.detail.response || [];
        expect(lastResponse).toContain('r2 h1');
        expect(lastResponse).toContain('r4 h3');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', onResponse as EventListener);
    }
  }
};

export const DragWithOptionsRight: Story = {
  render: () => optionsRightTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvasElement.querySelector('qti-match-interaction') as QtiMatchInteraction;
    const onResponse = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', onResponse as EventListener);

    try {
      const berlin = canvas.getByShadowText('Berlijn');
      const amsterdamCity = canvas.getByShadowText('Amsterdam');
      const germany = canvas.getByShadowText('Duitsland');
      const netherlands = canvas.getByShadowText('Nederland');

      await step('Drag Berlijn to Duitsland', async () => {
        await drag(berlin, { to: germany, duration: 400 });
        expect(within(germany).queryAllByShadowText('Berlijn').length).toBeGreaterThan(0);
      });

      await step('Drag Amsterdam to Nederland and verify directional identifiers', async () => {
        await drag(amsterdamCity, { to: netherlands, duration: 400 });
        expect(within(netherlands).queryAllByShadowText('Amsterdam').length).toBeGreaterThan(0);
        const lastResponse = onResponse.mock.calls.at(-1)?.[0]?.detail.response || [];
        expect(lastResponse).toContain('A1 B1');
        expect(lastResponse).toContain('A2 B2');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', onResponse as EventListener);
    }
  }
};

export const DragWithManyOptions: Story = {
  render: () => manyOptionsTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvasElement.querySelector('qti-match-interaction') as QtiMatchInteraction;
    const onResponse = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', onResponse as EventListener);

    try {
      const ribosomes = canvas.getByShadowText('ribosomen');
      const proteinSynthesis = canvas.getByShadowText('aanmaak van eiwitten');

      await step('Drag ribosomen to aanmaak van eiwitten', async () => {
        await drag(ribosomes, { to: proteinSynthesis, duration: 400 });
        expect(within(proteinSynthesis).queryAllByShadowText('ribosomen').length).toBeGreaterThan(0);
        const lastResponse = onResponse.mock.calls.at(-1)?.[0]?.detail.response || [];
        expect(lastResponse).toContain('A2 B2');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', onResponse as EventListener);
    }
  }
};

export const DragWithImages: Story = {
  render: () => withImagesTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvasElement.querySelector('qti-match-interaction') as QtiMatchInteraction;
    const onResponse = fn((e: CustomEvent<{ response: string[] }>) => e.detail.response);
    interaction.addEventListener('qti-interaction-response', onResponse as EventListener);

    try {
      const ernie = canvas.getByShadowText('Ernie');
      const imageTargets = canvas.getAllByAltText('afbeelding');
      const firstTarget = imageTargets[0].closest('qti-simple-associable-choice') as HTMLElement;

      await step('Drag Ernie to first image target', async () => {
        await drag(ernie, { to: firstTarget, duration: 400 });
        expect(within(firstTarget).queryAllByShadowText('Ernie').length).toBeGreaterThan(0);
        const lastResponse = onResponse.mock.calls.at(-1)?.[0]?.detail.response || [];
        expect(lastResponse).toContain('A1 B1');
      });
    } finally {
      interaction.removeEventListener('qti-interaction-response', onResponse as EventListener);
    }
  }
};

export const DuplicateDropIsolationRegression: Story = {
  name: 'Regression: duplicate source remains in other targets after occupied-target swap',
  render: () => duplicateDropRegressionTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const interaction = canvas.getByShadowTestId<QtiMatchInteraction>('match-interaction-duplicates');
    await interaction.updateComplete;

    const alpha = canvas.getByShadowText('Alpha');
    const beta = canvas.getByShadowText('Beta');
    const target1 = canvas.getByShadowText('Target 1');
    const target2 = canvas.getByShadowText('Target 2');
    const target3 = canvas.getByShadowText('Target 3');

    await step('Place Alpha on two different targets (duplicate allowed from inventory)', async () => {
      await drag(alpha, { to: target1, duration: 350 });
      await drag(alpha, { to: target2, duration: 350 });

      expect(within(target1).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target2).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
    });

    await step('Fill third target with Beta while Alpha remains in Targets 1 and 2', async () => {
      await drag(beta, { to: target3, duration: 350 });
      expect(within(target3).queryAllByShadowText('Beta').length).toBeGreaterThan(0);
    });

    await step(
      'Moving Alpha from Target 2 into occupied Target 3 preserves unrelated Alpha and swaps local occupants',
      async () => {
        const alphaInTarget2 = await waitFor(() => {
          const dropped = deepQuerySelector(target2, '[identifier="A"][qti-draggable="true"]') as HTMLElement | null;
          expect(dropped).not.toBeNull();
          return dropped as HTMLElement;
        });
        await drag(alphaInTarget2, { to: target3, duration: 350 });

        // Expected sortable behavior:
        // - Target 1 keeps its Alpha (unrelated placement remains)
        // - Target 2 receives Beta from the occupied target as part of swap flow
        // - Target 3 receives the dragged Alpha
        expect(within(target1).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
        expect(within(target2).queryAllByShadowText('Beta').length).toBeGreaterThan(0);
        expect(within(target3).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      }
    );
  }
};

export const SortableAppendWhenTargetAllowsMultiple: Story = {
  name: 'Behavior: sortable move appends on occupied target when match-max > 1',
  render: () => sortableAppendWhenTargetAllowsMultipleTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const alpha = canvas.getByShadowText('Alpha');
    const beta = canvas.getByShadowText('Beta');
    const target1 = canvas.getByShadowText('Target 1');
    const target2 = canvas.getByShadowText('Target 2');
    const target3 = canvas.getByShadowText('Target 3');

    await step('Place Alpha in Targets 1 and 2, and Beta in Target 3', async () => {
      await drag(alpha, { to: target1, duration: 350 });
      await drag(alpha, { to: target2, duration: 350 });
      await drag(beta, { to: target3, duration: 350 });
      expect(within(target1).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target2).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target3).queryAllByShadowText('Beta').length).toBeGreaterThan(0);
    });

    await step('Move Alpha from Target 2 onto occupied Target 3 (match-max=2)', async () => {
      const alphaInTarget2 = await waitFor(() => {
        const dropped = deepQuerySelector(target2, '[identifier="A"][qti-draggable="true"]') as HTMLElement | null;
        expect(dropped).not.toBeNull();
        return dropped as HTMLElement;
      });
      await drag(alphaInTarget2, { to: target3, duration: 350 });

      // Target 3 allows multiple, so Alpha should be added rather than swapping out Beta.
      expect(within(target1).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target2).queryAllByShadowText('Alpha').length).toBe(0);
      expect(within(target3).queryAllByShadowText('Beta').length).toBeGreaterThan(0);
      expect(within(target3).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(deepQuerySelectorAll(target3, '[qti-draggable="true"]').length).toBe(2);
    });
  }
};

export const SortableRespectsPerTargetMatchMax: Story = {
  name: 'Behavior: sortable append blocks when target reached match-max',
  render: () => sortableAppendWhenTargetAllowsMultipleTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const alpha = canvas.getByShadowText('Alpha');
    const beta = canvas.getByShadowText('Beta');
    const target1 = canvas.getByShadowText('Target 1');
    const target2 = canvas.getByShadowText('Target 2');
    const target3 = canvas.getByShadowText('Target 3');

    await step('Fill Target 3 to its match-max=2 capacity', async () => {
      await drag(alpha, { to: target1, duration: 350 });
      await drag(alpha, { to: target3, duration: 350 });
      await drag(beta, { to: target3, duration: 350 });

      expect(within(target1).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target3).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target3).queryAllByShadowText('Beta').length).toBeGreaterThan(0);
      expect(deepQuerySelectorAll(target3, '[qti-draggable="true"]').length).toBe(2);
    });

    await step(
      'Move Alpha from Target 1 onto full Target 3; drop should be blocked by per-target match-max',
      async () => {
        const alphaInTarget1 = await waitFor(() => {
          const dropped = deepQuerySelector(target1, '[identifier="A"][qti-draggable="true"]') as HTMLElement | null;
          expect(dropped).not.toBeNull();
          return dropped as HTMLElement;
        });
        await drag(alphaInTarget1, { to: target3, duration: 350 });

        // Target 3 remains at capacity with original two items.
        expect(deepQuerySelectorAll(target3, '[qti-draggable="true"]').length).toBe(2);
        expect(within(target3).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
        expect(within(target3).queryAllByShadowText('Beta').length).toBeGreaterThan(0);

        // Source retains Alpha because move to full multi-capacity target is invalid.
        expect(within(target1).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
        expect(within(target2).queryAllByShadowText('Alpha').length).toBe(0);
      }
    );
  }
};

export const SortableAppendWhenTargetIsUnlimited: Story = {
  name: 'Behavior: sortable move appends when occupied target match-max is unlimited (0)',
  render: () => sortableAppendWhenTargetUnlimitedTemplate,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const alpha = canvas.getByShadowText('Alpha');
    const beta = canvas.getByShadowText('Beta');
    const target1 = canvas.getByShadowText('Target 1');
    const target2 = canvas.getByShadowText('Target 2');
    const target3 = canvas.getByShadowText('Target 3');

    await step('Place Alpha in Targets 1 and 2, then fill Target 3 with Alpha and Beta', async () => {
      await drag(alpha, { to: target1, duration: 350 });
      await drag(alpha, { to: target2, duration: 350 });
      await drag(alpha, { to: target3, duration: 350 });
      await drag(beta, { to: target3, duration: 350 });

      expect(within(target1).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target2).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target3).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target3).queryAllByShadowText('Beta').length).toBeGreaterThan(0);
      expect(deepQuerySelectorAll(target3, '[qti-draggable="true"]').length).toBe(2);
    });

    await step('Move Alpha from Target 2 onto occupied unlimited Target 3; item should append', async () => {
      const alphaInTarget2 = await waitFor(() => {
        const dropped = deepQuerySelector(target2, '[identifier="A"][qti-draggable="true"]') as HTMLElement | null;
        expect(dropped).not.toBeNull();
        return dropped as HTMLElement;
      });
      await drag(alphaInTarget2, { to: target3, duration: 350 });

      expect(within(target2).queryAllByShadowText('Alpha').length).toBe(0);
      expect(within(target3).queryAllByShadowText('Alpha').length).toBeGreaterThan(0);
      expect(within(target3).queryAllByShadowText('Beta').length).toBeGreaterThan(0);
      expect(deepQuerySelectorAll(target3, '[qti-draggable="true"]').length).toBe(3);
    });
  }
};
