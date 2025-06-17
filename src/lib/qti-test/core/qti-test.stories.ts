import { html } from 'lit';
// import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';

import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiTest } from './qti-test';
// const { events, args, argTypes, template } = getStorybookHelpers('qti-test');

type Story = StoryObj<QtiTest>;

const meta: Meta<typeof QtiTest> = {
  component: 'qti-test',
  subcomponents: { testContainer: 'test-container' },
  args: {},
  argTypes: {},
  parameters: {
    actions: {
      handles: {}
    },
    controls: { disable: true }
  },
  tags: ['autodocs', 'no-tests']
};
export default meta;

// export const Controls: Story = {
//   parameters: {
//     controls: { disable: false }
//   },
//   render: args => {
//     return html` ${template(
//       args,
//       html`<test-navigation
//         ><test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
//         <nav><test-prev>Vorige</test-prev><test-next>Volgende</test-next></nav></test-navigation
//       >`
//     )}`;
//   }
// };

export const Unstyled: Story = {
  render: args => {
    return html`<qti-test navigate="item"
      ><test-navigation
        ><test-container test-url="/assets/qti-conformance/Basic/T4-T7/assessment.xml"></test-container>
        <nav><test-prev>Vorige</test-prev><test-next>Volgende</test-next></nav></test-navigation
      ></qti-test
    >`;
  }
};

export const BootstrapForTest: Story = {
  render: () => html`
    <qti-test navigate="item" class="d-flex h-100 w-full flex-column">
      <test-navigation>
        <test-container
          test-url="/assets/api/examples/assessment.xml"
          class="overflow-auto aspect-16/9"
        ></test-container>
        <div class="d-flex align-items-center justify-content-between">
          <test-prev class="d-flex flex-nowrap btn  btn-success">
            <i class="bi bi-arrow-left-short me-2"></i>previous
          </test-prev>

          <test-next class="d-flex flex-nowrap btn  btn-success">
            next<i class="bi bi-arrow-right-short ms-2"></i>
          </test-next>
        </div>
      </test-navigation>
    </qti-test>
  `
};

export const CSSVariablesForItem: Story = {
  render: () => html`
    <style>
      test-container {
        --qti-bg-active: #efecff;
        --qti-border-active: #581d70;
        --qti-button-padding-vertical: 0.2rem;
      }
    </style>
    <qti-test navigate="item">
      <test-navigation>
        <test-container test-url="/assets/api/examples/assessment.xml"></test-container>
        <test-prev> previous </test-prev>
        <test-next> next </test-next>
      </test-navigation>
    </qti-test>
  `
};
