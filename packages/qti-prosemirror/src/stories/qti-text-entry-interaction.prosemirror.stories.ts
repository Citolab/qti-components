/**
 * Example: Setting up a ProseMirror editor with QTI Text Entry Interaction
 *
 * This story demonstrates how to:
 * 1. Import the QTI text entry custom element and its ProseMirror schema
 * 2. Compose a ProseMirror schema with inline text entry nodes
 * 3. Set up plugins including base plugins and custom keymap
 * 4. Create an EditorView with the schema
 *
 * Keyboard shortcuts:
 * - Mod-b: Toggle bold
 * - Mod-i: Toggle italic
 * - Mod-z: Undo
 * - Mod-Shift-z / Mod-y: Redo
 * - Mod-Shift-T: Insert text entry field
 */

import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-gapcursor/style/gapcursor.css';

// Import the base schema nodes/marks and plugins
import { baseNodes, baseMarks } from '../schema/base.schema';
import { createBasePlugins } from '../plugins/base.plugins';
// Import component schema and keymap
import { qtiTextEntryInteractionNodeSpec } from '../components/qti-text-entry-interaction/qti-text-entry-interaction.schema';
import { createTextEntryInteractionKeymap } from '../components/qti-text-entry-interaction/qti-text-entry-interaction.keymap';

// Import and register the custom element (side effect)
import '../components/qti-text-entry-interaction/qti-text-entry-interaction';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

// Compose the schema from base nodes and QTI text entry node
const schema = new Schema({
  nodes: {
    ...baseNodes,
    qtiTextEntryInteraction: qtiTextEntryInteractionNodeSpec
  },
  marks: baseMarks
});

// Configure plugins: base plugins + text entry keymap
const plugins = [...createBasePlugins(schema), createTextEntryInteractionKeymap()];

const meta: Meta = {
  title: 'QTI ProseMirror/Text Entry Interaction Editor',
  tags: ['autodocs']
};
export default meta;

type Story = StoryObj;

export const BasicEditor: Story = {
  render: () => {
    let currentView: EditorView | null = null;

    const initialContent = `
      <h1>QTI Text Entry Interaction Example</h1>
      <p>Fill in the blank: The capital of France is <qti-text-entry-interaction response-identifier="RESPONSE_1"></qti-text-entry-interaction>.</p>
      <p>Press <strong>Cmd/Ctrl + Shift + T</strong> to insert a new text entry field.</p>
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
        .editor-container:focus-within {
          border-color: #0066cc;
          box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
        }
      </style>

      <div style="max-width: 850px; margin: 40px auto; padding: 0 20px; font-family: system-ui;">
        <h3>Text Entry Interaction Editor</h3>
        <div
          class="editor-container"
          ${ref(el => {
            if (el) initEditor(el as HTMLElement);
          })}
        ></div>
        <p style="color: #666; font-size: 0.9rem;">
          The text entry field is an inline atom node. Use <kbd>Cmd/Ctrl + Shift + T</kbd> to insert new ones.
        </p>
      </div>
    `;
  }
};

export const MultipleBlanks: Story = {
  render: () => {
    let currentView: EditorView | null = null;

    const initialContent = `
      <p>Complete the sentence:</p>
      <p>The <qti-text-entry-interaction response-identifier="RESPONSE_1"></qti-text-entry-interaction> brown <qti-text-entry-interaction response-identifier="RESPONSE_2"></qti-text-entry-interaction> jumps over the lazy <qti-text-entry-interaction response-identifier="RESPONSE_3"></qti-text-entry-interaction>.</p>
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
          min-height: 150px;
        }
        .editor-container {
          border: 1px solid #ddd;
        }
      </style>
      <div style="max-width: 850px; margin: 40px auto;">
        <h3>Multiple Text Entry Fields</h3>
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
