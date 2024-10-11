import '@citolab/qti-components/qti-components';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import packages from '../assets/packages.json';
import { getItemByIndex } from '../lib/qti-loader';

const meta: Meta = {
  title: 'Item',
  argTypes: {
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    disabled: { control: { type: 'boolean' } },
    itemIndex: { control: { type: 'number' } }
  },
  args: {
    serverLocation: '/api',
    qtipkg: 'examples',
    itemIndex: 0
  },
  parameters: {
    controls: {
      expanded: false
    }
  }
};

export default meta;
type Story = StoryObj;

let item;

// export const Div: Story = {
//   render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
//     const onInteractionChangedAction = action('qti-interaction-changed');
//     const onOutcomeChangedAction = action('qti-outcome-changed');
//     const onItemFirstUpdated = ({ detail: qtiAssessmentItem }) => {
//       item = qtiAssessmentItem;
//       action('qti-assessment-item-connected');
//     };

//     item && (item.disabled = disabled);
//     item && (item.view = view);

//     return html`
//       <div
//         class="item"
//         @qti-interaction-changed=${onInteractionChangedAction}
//         @qti-outcome-changed=${onOutcomeChangedAction}
//         @qti-assessment-item-connected=${onItemFirstUpdated}
//       >
//         ${unsafeHTML(xml.itemHTML)}
//       </div>
//       <button @click=${() => item?.processResponse()}>Submit</button>
//     `;
//   },
//   loaders: [
//     async ({ args }) => ({ xml: await getItemByIndex(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })
//   ]
// };

export const QtiItem: Story = {
  render: ({ disabled, view }, { argTypes, loaded: { xml } }) => {
    item && (item.disabled = disabled);
    item && (item.view = view);

    return html`
      <qti-item @qti-item-variables-changed=${action('qti-item-variables-changed')} .xmlDoc=${xml.itemHTMLDoc}>
      </qti-item>
      <button @click=${() => item?.processResponse()}>processResponse</button>
    `;
  },
  loaders: [
    async ({ args }) => ({ xml: await getItemByIndex(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })
  ]
};

// export const QtiItemImperativeDeclarative: Story = {
//   render: (args, { argTypes, loaded: { xml } }) => {
//     return `
//       <qti-item class="item">
//         <template>
//             <style>
//               ${styles}
//             </style>
//         ${xml.itemHTML} </template>
//       </qti-item>
//     `;
//   },
//   loaders: [
//     async ({ args }) => ({ xml: await getItemByIndex(`${args.serverLocation}/${args.qtipkg}`, args.itemIndex) })
//   ]
// };
