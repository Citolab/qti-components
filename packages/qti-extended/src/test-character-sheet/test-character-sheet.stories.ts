import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import '../../../../.storybook/utilities.css';
import { SHOWCASE_TEST } from '../showcase.fixtures';

import type { TestCharacterSheet } from './test-character-sheet';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

const { events, args, argTypes, template } = getStorybookHelpers('test-character-sheet');

type Story = StoryObj<TestCharacterSheet & typeof args>;

/**
 * `<test-character-sheet>` is a button that opens a sheet of characters that are not on the keyboard
 * (`é`, `€`, `²`, …) and types the one the candidate picks into the answer field they were writing in: the
 * last text field or text area of a rendered item that had focus. Until such a field had focus it is
 * `disabled`.
 *
 * `characters` is the sheet, as a string with the characters separated by spaces. The sheet opens in the
 * top layer below the button and closes on Escape, on a click outside it, and when another item comes on
 * screen. Style the sheet with `::part(sheet)` and its keys with `::part(key)`.
 *
 * Click in a text field of the item below, then open the sheet and pick a character.
 */
const meta: Meta<TestCharacterSheet> = {
  tags: ['autodocs'],
  title: 'QTI Test/Plugins/Character sheet',
  component: 'test-character-sheet',
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
        <nav class="flex items-center gap-1 mb-2">
          ${template(args)}
          <test-prev class="ml-auto">Vorige</test-prev>
          <test-next>Volgende</test-next>
        </nav>
        <test-container test-url=${SHOWCASE_TEST} class="block h-[32rem] overflow-auto border rounded"></test-container>
      </test-navigation>
    </qti-test>`
};
