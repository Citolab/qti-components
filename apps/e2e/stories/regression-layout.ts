import { html } from 'lit';

import type { Decorator } from '@storybook/web-components-vite';

/**
 * Constrain a regression story to the shared item measure (`--regression-item-width`, defined in
 * kennisnet.css).
 *
 * The width lives in CSS rather than in each story so qti-components and qti-editor render the item
 * at exactly the same size and can be compared side by side. qti-editor applies the same
 * `.regression-item` class to its editor column; there it sits inside a `.regression-layout` flex
 * row with the attributes panel to its right.
 *
 * This is a decorator rather than a wrapper written into every render function so the 17 story
 * bodies stay identical — see docs/regression-item-alignment-playbook.md in qti-editor.
 */
export const regressionLayout: Decorator = story => html`<div class="regression-item">${story()}</div>`;
