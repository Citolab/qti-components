/**
 * Example: Setting up a ProseMirror editor with QTI Choice Interaction components
 *
 * This story demonstrates how to:
 * 1. Import the QTI custom elements and their ProseMirror schemas
 * 2. Compose a ProseMirror schema from base nodes and QTI node specs
 * 3. Set up plugins (history, keymap)
 * 4. Create an EditorView with the schema
 */

import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';

import 'prosemirror-view/style/prosemirror.css';
// Import the base schema nodes/marks
import { baseNodes, baseMarks } from '../schema/base.schema';
// Import component schemas
import { qtiChoiceInteractionNodeSpec } from '../components/qti-choice-interaction/qti-choice-interaction.schema';
import { qtiPromptNodeSpec } from '../components/qti-prompt/qti-prompt.schema';
import { qtiSimpleChoiceNodeSpec } from '../components/qti-simple-choice/qti-simple-choice.schema';

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
    qtiSimpleChoice: qtiSimpleChoiceNodeSpec
  },
  marks: baseMarks
});

// Configure plugins
const plugins = [history(), keymap(baseKeymap)];

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
      <p>Edit the content below:</p>
      <qti-choice-interaction max-choices="1" class="qti-labels-decimal">
        <qti-prompt>
          <p>Which of the following features are <strong>new</strong> to QTI 3?</p>
        </qti-prompt>
        <qti-simple-choice identifier="A">Option A</qti-simple-choice>
        <qti-simple-choice identifier="B">Option B</qti-simple-choice>
        <qti-simple-choice identifier="C">Option C</qti-simple-choice>
        <qti-simple-choice identifier="D">Option D</qti-simple-choice>
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
          const newState = currentView.state.apply(tr);
          currentView.updateState(newState);
        }
      });
    };

    return html`
      <style>
        .ProseMirror {
          padding: 12px;
          outline: none;
          min-height: 280px;
        }
        .editor-container {
          border: 1px solid #ddd;
        }
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
          Click inside to begin editing. The editor uses ProseMirror with QTI custom element schemas.
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
        <qti-simple-choice identifier="A">First option</qti-simple-choice>
        <qti-simple-choice identifier="B">Second option</qti-simple-choice>
        <qti-simple-choice identifier="C">Third option</qti-simple-choice>
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
      <style>
        .ProseMirror {
          padding: 12px;
          outline: none;
          min-height: 200px;
        }
        .editor-container {
          border: 1px solid #ddd;
        }
        qti-simple-choice {
          user-select: unset;
          cursor: unset;
        }
      </style>
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
