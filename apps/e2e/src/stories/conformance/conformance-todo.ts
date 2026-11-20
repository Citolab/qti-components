import { html } from 'lit';

import type { StoryObj } from '@storybook/web-components-vite';

/** The suite commit the placeholders were written from. */
const SUITE = 'https://github.com/1EdTech/qti-conformance/blob/b058156e3d7c7bcc45e18b1c5cb334d8e556c5e2/';

/**
 * The body of a placeholder story: the criterion of the 1EdTech QTI 3 conformance suite that nothing tests
 * yet. `name` stays literal in each export, because the story indexer cannot read a computed one.
 */
export const todo = (id: string, text: string, readme: string): StoryObj => ({
  parameters: { docs: { description: { story: text } } },
  render: () => html`
    <p><strong>${id}</strong> has no test yet.</p>
    <p>${text}</p>
    <p><a href=${SUITE + encodeURI(readme)} target="_blank" rel="noreferrer">The criterion in the suite</a></p>
  `
});
