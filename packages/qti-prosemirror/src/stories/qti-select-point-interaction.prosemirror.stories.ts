import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-gapcursor/style/gapcursor.css';

import { baseMarks, baseNodes } from './schema/base.schema';
import { createBasePlugins } from './plugins/base.plugins';
import { qtiSelectPointInteractionNodeSpec } from '../components/qti-select-point-interaction/qti-select-point-interaction.schema';
import { insertSelectPointInteraction } from '../components/qti-select-point-interaction/qti-select-point-interaction.commands';

import '../components/qti-select-point-interaction/qti-select-point-interaction';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const schema = new Schema({
  nodes: {
    ...baseNodes,
    qtiSelectPointInteraction: qtiSelectPointInteractionNodeSpec
  },
  marks: baseMarks
});

const plugins = createBasePlugins(schema);

const meta: Meta = {
  title: 'QTI ProseMirror/Select Point Interaction Editor',
  tags: ['autodocs']
};
export default meta;

type Story = StoryObj;

export const BasicEditor: Story = {
  render: () => {
    let currentView: EditorView | null = null;

    const initialContent = `
      <h1>QTI Select Point Interaction Example</h1>
      <p>Use the button to insert a select-point interaction block atom.</p>
      <qti-select-point-interaction
        response-identifier="RESPONSE_1"
        max-choices="0"
        min-choices="0"
        area-mappings='[{"id":"A1","shape":"circle","coords":"120,90,30","mappedValue":1,"defaultValue":0}]'
      ></qti-select-point-interaction>
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

    const handleInsert = () => {
      if (!currentView) return;
      insertSelectPointInteraction(currentView.state, currentView.dispatch);
      currentView.focus();
    };

    return html`
      <div style="max-width: 900px; margin: 40px auto; padding: 0 20px; font-family: system-ui;">
        <h3>Select Point Interaction Editor</h3>
        <div style="margin-bottom: 10px;">
          <button
            @click=${handleInsert}
            style="padding: 8px 16px; background: #7c3aed; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Insert Select Point Interaction
          </button>
        </div>
        <div
          class="editor-container"
          ${ref(el => {
            if (el) initEditor(el as HTMLElement);
          })}
        ></div>
        <p style="color: #666; font-size: 0.9rem;">
          Use <kbd>Cmd/Ctrl + Shift + P</kbd> to insert a select-point interaction. Upload an image and draw circle/rect
          area mappings.
        </p>
      </div>
    `;
  }
};
