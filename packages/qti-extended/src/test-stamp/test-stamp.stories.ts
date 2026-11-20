import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { html } from 'lit';
import { expect, waitFor } from 'storybook/test';

import { SHOWCASE_TEST } from '../showcase.fixtures';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { TestStamp } from './test-stamp';

import './test-stamp';
import '../test-print-context/test-print-context';

const { events, args, argTypes, template } = getStorybookHelpers('test-stamp');

type Story = StoryObj<TestStamp & typeof args>;

/**
 * The **stamp** plugin renders a template from the state of the test, so a page can show where the
 * candidate is without writing a component.
 *
 * `<test-stamp>` renders its `<template>` with the active item (`activeItem`), section
 * (`activeSection`), test part (`activeTestpart`) and the test (`test`, with `test.plugins`). Inside
 * it, `<template type="repeat" repeat="{{ activeTestpart.items }}">` makes one entry per item, and
 * `repeat="{{ activeTestpart.sections }}"` one per section, for example a `<test-item-link>` or a
 * `<test-section-link>`.
 */
const meta: Meta<TestStamp> = {
  tags: ['autodocs'],
  title: 'QTI Test/Plugins/Stamp/test-stamp',
  component: 'test-stamp',
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
  render: args =>
    html` <qti-test navigate="item">
      <test-navigation>
        <!-- <test-print-context></test-print-context> -->
        ${template(args, html`<template>{{ test.title }}</template>`)}
        ${template(
          args,
          html`
            <template>
              <ul>
                <li>{{ test.identifier }}</li>
                <li>{{ test.title }}</li>
              </ul>

              <ul>
                <li>{{ testpart.items }}</li>
                <li>{{ testpart.active }}</li>
                <li>{{ testpart.identifier }}</li>
                <li>{{ testpart.navigationMode }}</li>
                <li>{{ testpart.submissionMode }}</li>
              </ul>

              <ul>
                <li>{{ section.title }}</li>
                <li>{{ section.active }}</li>
                <li>{{ section.identifier }}</li>

                <li>{{required}}</li>
                <li>{{fixed}}</li>
                <li>{{visible}}</li>
                <li>{{keepTogether}}</li>

                <li>{{ section.items }}</li>
              </ul>
              <template type="if" if="{{ testpart.items }}">
                <template type="repeat" repeat="{{ testpart.items }}">
                  <p>{{ item.identifier }}</p>
                </template>
              </template>
            </template>
          `
        )}
        ${template(
          args,
          html`
            <template>
              <template type="if" if="{{ section.items }}">
                <template type="repeat" repeat="{{ section.items }}">
                  <p>{{ item.identifier }}</p>
                </template>
              </template>
            </template>
          `
        )}
        ${template(args, html`<template>{{ item.identifier }}</template>`)}

        <test-container test-url=${SHOWCASE_TEST}></test-container>
        <test-next>Next</test-next>
      </test-navigation>
    </qti-test>`,
  play: async ({ canvasElement }) => {
    // The stamp fills its template from the test: the test's title and identifier.
    const stamps = [...canvasElement.querySelectorAll('test-stamp')];
    await waitFor(
      () => {
        const text = stamps.map(stamp => stamp.shadowRoot?.textContent || stamp.textContent).join(' ');
        expect(text).toContain('Showcase');
        expect(text).toContain('showcase');
      },
      { timeout: 15000 }
    );
  }
};
