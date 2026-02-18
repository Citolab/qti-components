/**
 * Example: Setting up a ProseMirror editor with QTI Choice Interaction components
 *
 * This story demonstrates how to:
 * 1. Import the QTI custom elements and their ProseMirror schemas
 * 2. Compose a ProseMirror schema from base nodes and QTI node specs
 * 3. Set up plugins with base functionality
 * 4. Create an EditorView with the schema
 *
 * Keyboard shortcuts:
 * - Mod-b: Toggle bold
 * - Mod-i: Toggle italic
 * - Mod-z: Undo
 * - Mod-Shift-z / Mod-y: Redo
 */

import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-gapcursor/style/gapcursor.css';

// Import the base schema nodes/marks and plugins
import { baseNodes, baseMarks } from './schema/base.schema';
import { createBasePlugins } from './plugins/base.plugins';
// Import component schemas
import { qtiChoiceInteractionNodeSpec } from '../components/qti-choice-interaction/qti-choice-interaction.schema';
import { qtiPromptNodeSpec } from '../components/qti-prompt/qti-prompt.schema';
import {
  qtiSimpleChoiceImageNodeSpec,
  qtiSimpleChoiceNodeSpec,
  qtiSimpleChoiceParagraphNodeSpec
} from '../components/qti-simple-choice/qti-simple-choice.schema';
// Import command
import { insertChoiceInteraction } from '../components/qti-choice-interaction/qti-choice-interaction.commands';

// Import and register the custom elements (side effect)
import '../components/qti-choice-interaction/qti-choice-interaction';
import '../components/qti-prompt/qti-prompt';
import '../components/qti-simple-choice/qti-simple-choice';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

// Compose the schema from base nodes and QTI-specific nodes
const schema = new Schema({
  nodes: {
    ...baseNodes,
    qtiChoiceInteraction: qtiChoiceInteractionNodeSpec,
    qtiPrompt: qtiPromptNodeSpec,
    qtiSimpleChoice: qtiSimpleChoiceNodeSpec,
    qtiSimpleChoiceParagraph: qtiSimpleChoiceParagraphNodeSpec,
    qtiSimpleChoiceImage: qtiSimpleChoiceImageNodeSpec
  },
  marks: baseMarks
});

// Configure plugins with base functionality
const plugins = createBasePlugins(schema);

const meta: Meta = {
  title: 'QTI ProseMirror/Choice Interaction Editor',
  tags: ['autodocs']
};
export default meta;

type Story = StoryObj;

export const BasicEditor: Story = {
  render: () => {
    let currentView: EditorView | null = null;

    const initialContent = `
      <h1>QTI Choice Interaction Example</h1>
      <p>Click the button below to insert a choice interaction using the ProseMirror command.</p>
      <p>Position your cursor where you want to insert the interaction and click "Insert Choice Interaction".</p>
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
          const newState = currentView.state.apply(tr);
          currentView.updateState(newState);
        }
      });
    };

    const handleInsertChoice = () => {
      if (currentView) {
        insertChoiceInteraction(currentView.state, currentView.dispatch);
        currentView.focus();
      }
    };

    return html`
      <div style="max-width: 850px; margin: 40px auto; padding: 0 20px; font-family: system-ui;">
        <h3>Interactive QTI Editor</h3>
        <div style="margin-bottom: 10px;">
          <button
            @click=${handleInsertChoice}
            style="padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Insert Choice Interaction
          </button>
        </div>
        <div
          class="editor-container"
          ${ref(el => {
            if (el) initEditor(el as HTMLElement);
          })}
        ></div>
        <p style="color: #666; font-size: 0.9rem;">
          Click inside to position cursor, then use the button or press <strong>Cmd/Ctrl + Shift + C</strong> to insert
          a choice interaction.
        </p>
      </div>
    `;
  }
};

export const MultipleChoiceEditor: Story = {
  render: () => {
    let currentView: EditorView | null = null;

    const initialContent = `
      <qti-choice-interaction max-choices="0">
        <qti-prompt>
          <p>Select all that apply:</p>
        </qti-prompt>
        <qti-simple-choice identifier="A"><p>First option</p></qti-simple-choice>
        <qti-simple-choice identifier="B"><p>Second option</p></qti-simple-choice>
        <qti-simple-choice identifier="C"><p>Third option</p></qti-simple-choice>
      </qti-choice-interaction>
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
        }
      });
    };

    return html`
      <div style="max-width: 850px; margin: 40px auto;">
        <h3>Multiple Choice (checkboxes)</h3>
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
