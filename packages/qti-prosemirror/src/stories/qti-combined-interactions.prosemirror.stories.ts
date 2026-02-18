import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-gapcursor/style/gapcursor.css';

import { baseMarks, baseNodes } from './schema/base.schema';
import { createBasePlugins } from './plugins/base.plugins';
import { qtiChoiceInteractionNodeSpec } from '../components/qti-choice-interaction/qti-choice-interaction.schema';
import { qtiPromptNodeSpec } from '../components/qti-prompt/qti-prompt.schema';
import {
  qtiSimpleChoiceImageNodeSpec,
  qtiSimpleChoiceNodeSpec,
  qtiSimpleChoiceParagraphNodeSpec
} from '../components/qti-simple-choice/qti-simple-choice.schema';
import { qtiInlineChoiceInteractionNodeSpec } from '../components/qti-inline-choice-interaction/qti-inline-choice-interaction.schema';
import { qtiInlineChoiceNodeSpec } from '../components/qti-inline-choice-interaction/qti-inline-choice.schema';
import { qtiTextEntryInteractionNodeSpec } from '../components/qti-text-entry-interaction/qti-text-entry-interaction.schema';
import { insertChoiceInteraction } from '../components/qti-choice-interaction/qti-choice-interaction.commands';
import { insertInlineChoiceInteraction } from '../components/qti-inline-choice-interaction/qti-inline-choice-interaction.commands';
import {
  canInsertTextEntryInteraction,
  insertTextEntryInteraction
} from '../components/qti-text-entry-interaction/qti-text-entry-interaction.commands';

import '../components/qti-choice-interaction/qti-choice-interaction';
import '../components/qti-prompt/qti-prompt';
import '../components/qti-simple-choice/qti-simple-choice';
import '../components/qti-inline-choice-interaction/qti-inline-choice-interaction';
import '../components/qti-inline-choice-interaction/qti-inline-choice';
import '../components/qti-text-entry-interaction/qti-text-entry-interaction';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const schema = new Schema({
  nodes: {
    ...baseNodes,
    qtiChoiceInteraction: qtiChoiceInteractionNodeSpec,
    qtiPrompt: qtiPromptNodeSpec,
    qtiSimpleChoice: qtiSimpleChoiceNodeSpec,
    qtiSimpleChoiceParagraph: qtiSimpleChoiceParagraphNodeSpec,
    qtiSimpleChoiceImage: qtiSimpleChoiceImageNodeSpec,
    qtiInlineChoiceInteraction: qtiInlineChoiceInteractionNodeSpec,
    qtiInlineChoice: qtiInlineChoiceNodeSpec,
    qtiTextEntryInteraction: qtiTextEntryInteractionNodeSpec
  },
  marks: baseMarks
});

const plugins = createBasePlugins(schema);

const meta: Meta = {
  title: 'QTI ProseMirror/Combined Interactions Editor',
  tags: ['autodocs']
};
export default meta;

type Story = StoryObj;

export const AllInteractionsInOneEditor: Story = {
  render: () => {
    let currentView: EditorView | null = null;
    let textEntryButton: HTMLButtonElement | null = null;

    const initialContent = `
      <h1>QTI Combined Interaction Editor</h1>
      <p>Use the buttons to insert all supported interaction types into this same editor.</p>
      <p>Example text entry: Answer: <qti-text-entry-interaction response-identifier="RESPONSE_1"></qti-text-entry-interaction></p>
      <p>Place your cursor and insert either a choice interaction or an inline choice interaction below.</p>
    `;

    const initEditor = (container: HTMLElement) => {
      if (currentView) currentView.destroy();

      const tempEl = document.createElement('div');
      tempEl.innerHTML = initialContent;
      const doc = DOMParser.fromSchema(schema).parse(tempEl);

      currentView = new EditorView(container, {
        state: EditorState.create({ doc, schema, plugins }),
        dispatchTransaction(tr) {
          if (!currentView) return;
          currentView.updateState(currentView.state.apply(tr));
          syncTextEntryButtonState();
        }
      });

      syncTextEntryButtonState();
    };

    const syncTextEntryButtonState = () => {
      if (!currentView || !textEntryButton) return;
      const canInsert = canInsertTextEntryInteraction(currentView.state);
      textEntryButton.disabled = !canInsert;
      textEntryButton.title = canInsert
        ? 'Insert Text Entry Interaction'
        : 'Cannot insert text entry inside qti-simple-choice';
    };

    const insertChoice = () => {
      if (!currentView) return;
      insertChoiceInteraction(currentView.state, currentView.dispatch);
      currentView.focus();
    };

    const insertInlineChoice = () => {
      if (!currentView) return;
      insertInlineChoiceInteraction(currentView.state, currentView.dispatch);
      currentView.focus();
    };

    const insertTextEntry = () => {
      if (!currentView) return;
      insertTextEntryInteraction(currentView.state, currentView.dispatch);
      currentView.focus();
      syncTextEntryButtonState();
    };

    return html`
      <div style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: system-ui;">
        <h3>Combined QTI Interaction Editor</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
          <button
            @click=${insertChoice}
            style="padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Insert Choice Interaction
          </button>
          <button
            @click=${insertInlineChoice}
            style="padding: 8px 16px; background: #0f8b4c; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Insert Inline Choice Interaction
          </button>
          <button
            @click=${insertTextEntry}
            style="padding: 8px 16px;"
            ${ref(el => {
              textEntryButton = el as HTMLButtonElement;
              syncTextEntryButtonState();
            })}
          >
            Insert Text Entry Interaction
          </button>
        </div>
        <div
          class="editor-container"
          ${ref(el => {
            if (el) initEditor(el as HTMLElement);
          })}
        ></div>
      </div>
    `;
  }
};
