import { expect } from 'storybook/test';
import { html } from 'lit';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../../tools/testing/test-utils';

import type { QtiAssessmentItemRef } from './qti-assessment-item-ref';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

type Story = StoryObj<QtiAssessmentItemRef>;

const meta: Meta<QtiAssessmentItemRef & { 'test-url': string }> = {
  component: 'qti-assessment-item-ref',
  args: { 'test-url': '/assets/qti-conformance/Basic/T4-T7/assessment.xml' }
};
export default meta;

/**
 * A `<template item-ref>` in the light DOM of `<qti-test>` renders every item in
 * the test, so a host can put its own chrome around each one — a bookmark, an
 * index number, a score badge — without replacing the element.
 *
 * The template is the whole render, so it places `{{ xmlDoc }}` itself; leaving
 * it out renders the chrome and no item. Everything that varies per item comes
 * through the model: `xmlDoc`, `identifier`, `href`, `category`, and `itemRef`
 * for anything else.
 */
export const WithItemRefTemplate: Story = {
  render: args => html`
    <qti-test navigate="item">
      <template item-ref>
        <div class="item-chrome">
          <span class="item-chrome__badge">{{ identifier }}</span>
          {{ xmlDoc }}
        </div>
      </template>
      <test-navigation>
        <test-container test-url=${args['test-url']}></test-container>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const item = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'T1 - Test Entry - Item 1');
    expect(item).toBeInTheDocument();

    const itemRef = item.closest('qti-assessment-item-ref');
    expect(itemRef?.querySelector('.item-chrome__badge')?.textContent).toBe(itemRef?.getAttribute('identifier'));
  }
};
