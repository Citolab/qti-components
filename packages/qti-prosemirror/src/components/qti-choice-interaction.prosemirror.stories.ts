// import './qti-choice-interaction/qti-choice-interaction';
// import './qti-prompt/qti-prompt';
// import './qti-simple-choice/qti-simple-choice';

import { html } from 'lit';
import { getStorybookHelpers } from '@wc-toolkit/storybook-helpers';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { DOMParser } from 'prosemirror-model';
import { ref } from 'lit/directives/ref.js';
import 'prosemirror-view/style/prosemirror.css';

import { createQtiChoiceInteraction, qtiChoiceInteractionSchema } from './qti-choice-interaction.prosemirror';

import type { InputType } from 'storybook/internal/types';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import type { QtiChoiceInteraction } from '../../../qti-interactions/src/components/qti-choice-interaction/qti-choice-interaction';

// const { events, args, argTypes, template } = getStorybookHelpers('qti-choice-interaction', {
//   // excludeCategories: ['cssParts', 'cssProps', 'cssStates', 'events', 'properties', 'slots', 'methods']
// });

type Story = StoryObj<QtiChoiceInteraction>; // & typeof args>;

const meta: Meta<
  QtiChoiceInteraction & { classLabel: InputType; classLabelSuffix: InputType; classOrientation: InputType }
> = {
  component: 'qti-choice-interaction',
  title: '02 Choice Interaction/Prosemirror',
  // args,
  // argTypes,
  // parameters: {
  //   actions: {
  //     handles: events
  //   }
  // },
  tags: ['autodocs']
};
export default meta;

const Test: Story = {
  render: () => {
    return html` <qti-choice-interaction>
      <qti-prompt>
        <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
      </qti-prompt>
      <qti-simple-choice identifier="A">Option A</qti-simple-choice>
      <qti-simple-choice identifier="B">Option B</qti-simple-choice>
      <qti-simple-choice identifier="C">Option C</qti-simple-choice>
      <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>`;
  }
};

export const ContentEditable = {
  render: (args, context) => {
    return html`
      <style>
        qti-simple-choice {
          user-select: unset;
          cursor: unset;
        }
      </style>

      <div contenteditable="true">${Test.render(args, context)}</div>
    `;
  }
};

export const ProseMirror = {
  render: () => {
    let currentView: EditorView | null = null;

    const initialContent = `
<h1>Hello this is a choice example</h1>
<p>please edit this</p>

        <qti-choice-interaction max-choices="0" class="qti-labels-decimal">
    <qti-prompt>
    <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
    </qti-prompt>
    <qti-simple-choice identifier="A">Option A</qti-simple-choice>
    <qti-simple-choice identifier="B">Option B</qti-simple-choice>
    <qti-simple-choice identifier="C">Option C</qti-simple-choice>
    <qti-simple-choice identifier="D">Option D</qti-simple-choice>
    </qti-choice-interaction>

    `;

    const initEditor = async (container: HTMLElement) => {
      if (currentView) currentView.destroy();

      try {
        const { qtiChoiceInteractionSchema, qtiChoiceInteractionPlugins } = await import(
          './qti-choice-interaction.prosemirror'
        );

        const tempEl = document.createElement('div');
        tempEl.innerHTML = initialContent;
        const doc = DOMParser.fromSchema(qtiChoiceInteractionSchema).parse(tempEl);

        currentView = new EditorView(container, {
          state: EditorState.create({
            doc,
            schema: qtiChoiceInteractionSchema,
            plugins: qtiChoiceInteractionPlugins
          }),
          dispatchTransaction(tr) {
            if (!currentView) return;
            const newState = currentView.state.apply(tr);
            currentView.updateState(newState);
          }
        });
      } catch (err) {
        container.innerText = `Failed to load: ${err.message}`;
      }
    };

    return html`
      <style>
        /* 1. Fix the cursor visibility by adding padding inside the editable area */
        .ProseMirror {
          padding: 12px;
          outline: none !important; /* Removes the default thick blue border if you prefer */
          min-height: 280px;
        }

        /* 2. Style the container to look like a clean paper surface */
        .editor-container {
          border: 1px solid #ddd;
        }

        /* 3. Optional: Add a custom focus state that doesn't hide the cursor */
        .editor-container:focus-within {
          border-color: #0066cc;
          box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
        }

        qti-simple-choice {
          user-select: unset;
          cursor: unset;
        }
      </style>

      <div style="max-width: 850px; margin: 40px auto; padding: 0 20px; font-family: system-ui;">
        <h3>Interactive QTI Editor</h3>

        <div
          class="editor-container"
          ${ref(el => {
            if (el) initEditor(el as HTMLElement);
          })}
        ></div>

        <p style="color: #666; font-size: 0.9rem;">
          The editor above is pre-loaded with QTI components. Click inside to begin editing.
        </p>
      </div>
    `;
  }
};
