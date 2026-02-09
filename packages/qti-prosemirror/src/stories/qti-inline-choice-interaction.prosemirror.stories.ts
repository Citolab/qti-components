import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import 'prosemirror-view/style/prosemirror.css';
import 'prosemirror-gapcursor/style/gapcursor.css';

import { baseNodes, baseMarks } from './schema/base.schema';
import { createBasePlugins } from './plugins/base.plugins';
import { qtiInlineChoiceInteractionNodeSpec } from '../components/qti-inline-choice-interaction/qti-inline-choice-interaction.schema';
import { qtiInlineChoiceNodeSpec } from '../components/qti-inline-choice-interaction/qti-inline-choice.schema';
import { insertInlineChoiceInteraction } from '../components/qti-inline-choice-interaction/qti-inline-choice-interaction.commands';

import '../components/qti-inline-choice-interaction/qti-inline-choice-interaction';
import '../components/qti-inline-choice-interaction/qti-inline-choice';

import type { Meta, StoryObj } from '@storybook/web-components-vite';

const schema = new Schema({
  nodes: {
    ...baseNodes,
    qtiInlineChoiceInteraction: qtiInlineChoiceInteractionNodeSpec,
    qtiInlineChoice: qtiInlineChoiceNodeSpec
  },
  marks: baseMarks
});

const plugins = createBasePlugins(schema);

const meta: Meta = {
  title: 'QTI ProseMirror/Inline Choice Interaction Editor',
  tags: ['autodocs']
};
export default meta;

type Story = StoryObj;

export const BasicEditor: Story = {
  render: () => {
    let currentView: EditorView | null = null;

    const initialContent = `<h1>QTI Inline Choice Interaction Example</h1><p>Use Enter inside a choice to split/create another choice node.</p><qti-inline-choice-interaction response-identifier="RESPONSE" shuffle="false"><qti-inline-choice identifier="G">Gloucester</qti-inline-choice><qti-inline-choice identifier="L">Lancaster</qti-inline-choice><qti-inline-choice identifier="Y">York</qti-inline-choice></qti-inline-choice-interaction>`;

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

    const handleInsertInlineChoice = () => {
      if (!currentView) return;
      insertInlineChoiceInteraction(currentView.state, currentView.dispatch);
      currentView.focus();
    };

    return html`
      <div style="max-width: 850px; margin: 40px auto; padding: 0 20px; font-family: system-ui;">
        <h3>Inline Choice Interaction Editor</h3>
        <div style="margin-bottom: 10px;">
          <button
            @click=${handleInsertInlineChoice}
            style="padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Insert Inline Choice Interaction
          </button>
        </div>
        <div
          class="editor-container"
          ${ref(el => {
            if (el) initEditor(el as HTMLElement);
          })}
        ></div>
        <p style="color: #666; font-size: 0.9rem;">
          Position the cursor, then click the button to insert a <code>qti-inline-choice-interaction</code>.
        </p>
      </div>
    `;
  }
};
