import { expect, fireEvent, waitFor } from 'storybook/test';
import { html } from 'lit';
import { findByShadowText, queryAllByShadowText } from 'shadow-dom-testing-library';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { spread } from '@open-wc/lit-helpers';

import { getAssessmentItemFromTestContainerByDataTitle } from '../../../../../tools/testing/test-utils';

import type { TestBookmark } from './test-bookmark';
import type { QtiTest } from '../qti-test/qti-test';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-bookmark');

type Story = StoryObj<TestBookmark & typeof args>;

const meta: Meta<TestBookmark> = {
  component: 'test-bookmark',
  args,
  argTypes,
  parameters: {
    actions: {
      handles: events
    }
  }
};
export default meta;

export const Default: Story = {
  tags: ['no-tests'],
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        ${template(args)}
      </test-navigation>
    </qti-test>`
};

/** Marks stay with their item, and are part of the state a host stores. */
export const BookmarkFollowsTheItem: Story = {
  render: args => html`
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        <test-prev>Vorige</test-prev>
        <test-bookmark ${spread(args)}>Bookmark</test-bookmark>
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const qtiTest = canvasElement.querySelector('qti-test') as QtiTest;
    const bookmark = canvasElement.querySelector('test-bookmark') as TestBookmark;

    // 1 Wait for the first item ("Info Start"); nothing is marked yet
    await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start');
    await waitFor(() => expect(bookmark).not.toHaveAttribute('disabled'));
    expect(bookmark).toHaveAttribute('aria-pressed', 'false');
    expect(qtiTest.state.session.plugins).toBeUndefined();

    // 2 Mark it: the button shows it and so does the state a host stores
    await fireEvent.click(bookmark);
    await waitFor(() => expect(bookmark).toHaveAttribute('aria-pressed', 'true'));
    const marked = qtiTest.state.session.plugins?.bookmarks;
    expect(marked).toHaveLength(1);

    // 3 The next item is not marked
    await fireEvent.click(canvasElement.querySelector('test-next')!);
    await waitFor(() => expect(bookmark).toHaveAttribute('aria-pressed', 'false'));

    // 4 Back on the first item the mark is still there
    await fireEvent.click(canvasElement.querySelector('test-prev')!);
    await waitFor(() => expect(bookmark).toHaveAttribute('aria-pressed', 'true'));
  }
};

/** In `<template item-ref>` every item gets its own button, which marks that item. */
export const InItemRefTemplate: Story = {
  render: () => html`
    <qti-test navigate="item">
      <template item-ref>
        <test-bookmark>Bookmark</test-bookmark>
        {{ xmlDoc }}
      </template>
      <test-navigation>
        <test-container test-url="/assets/qti-test-package/assessment.xml"></test-container>
        <test-next>Volgende</test-next>
      </test-navigation>
    </qti-test>
  `,
  play: async ({ canvasElement }) => {
    const qtiTest = canvasElement.querySelector('qti-test') as QtiTest;

    const info = await getAssessmentItemFromTestContainerByDataTitle(canvasElement, 'Info Start');
    const itemRef = info.closest('qti-assessment-item-ref')!;
    const bookmark = itemRef.querySelector<TestBookmark>('test-bookmark')!;
    expect(bookmark).toBeInTheDocument();
    expect(bookmark).not.toHaveAttribute('disabled');

    await fireEvent.click(bookmark);
    await waitFor(() => expect(bookmark).toHaveAttribute('aria-pressed', 'true'));
    expect(qtiTest.state.session.plugins?.bookmarks).toEqual([itemRef.getAttribute('identifier')]);

    // The next item has its own button, not marked
    await fireEvent.click(await findByShadowText(canvasElement, 'Volgende'));
    await waitFor(() => {
      const next = queryAllByShadowText(canvasElement, 'Bookmark').find(b => b !== bookmark);
      expect(next).toBeTruthy();
      expect(next).toHaveAttribute('aria-pressed', 'false');
    });
  }
};
