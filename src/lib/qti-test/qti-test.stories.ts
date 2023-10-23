import { html } from 'lit';
import { createRef, ref } from 'lit-html/directives/ref.js';
import { useEffect, useRef, virtual, useState } from 'haunted';
import { action } from '@storybook/addon-actions';

import '../qti-components/index';
import './index';

import packages from '../../assets/api/packages.json';

import { QtiAssessmentTest } from './qti-assessment-test';
import { QtiAssessmentItemRef } from './qti-assessment-item-ref';

export default {
  title: 'qti-test',
  argTypes: {
    view: {
      options: ['candidate', 'scorer'],
      control: { type: 'radio' }
    },
    qtipkg: {
      options: packages.packages,
      control: { type: 'radio' }
    },
    readonly: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    'navigation-mode': {
      control: { type: 'radio' },
      options: ['linear', 'nonlinear']
    },
    'submission-mode': {
      control: { type: 'radio' },
      options: ['individual', 'simultaneous']
    }
  },
  args: {
    serverLocation: 'http://localhost:6006/api',
    qtipkg: 'biologie'
  },
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      values: [{ name: 'gray', value: '#eeeeee', default: true }]
    }
  },
  decorators: [story => html`${virtual(story)()}`]
};

export const QtiTestStory = {
  render: args => {
    const testEl = createRef<QtiAssessmentTest>();

    return html`
      <qti-test
        ${ref(testEl)}
        @qti-outcome-changed=${e => {
          localStorage.setItem('context', JSON.stringify(testEl.value.context));
          action('qti-outcome-changed')(e);
        }}
        @qti-interaction-changed=${e => {
          localStorage.setItem('context', JSON.stringify(testEl.value.context));
          action('qti-interaction-changed')(e);
        }}
        @qti-assessment-first-updated="${(e: CustomEvent<QtiAssessmentTest>) => {
          if (JSON.parse(localStorage.getItem('context'))) {
            e.detail.context = JSON.parse(localStorage.getItem('context'));
          }
        }}"
        package-uri="${args.serverLocation}/${args.qtipkg}/"
      >
      </qti-test>
    `;
  }
};
