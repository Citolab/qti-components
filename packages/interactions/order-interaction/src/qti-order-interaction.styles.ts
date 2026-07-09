import { css } from 'lit';

import { boxSizing } from '@qti-components/base';
// import componentStyles from '../../utilities/styles/component.styles';
// :host {
//   display: inline-block;
//   position: relative;
// }
/* ${componentStyles} */
export default [
  boxSizing,
  css`
    [part='drags'] {
      display: flex;
      align-items: flex-start;
      flex: 1;
      flex-wrap: wrap;
    }

    [part='drops'] {
      flex: 1;
      display: grid;
      grid-auto-flow: row;
      grid-template-columns: repeat(auto-fit, minmax(var(--qti-drop-min-width, 120px), 1fr));
      gap: 0.5rem;
    }

    :host([orientation='horizontal']) [part='drags'] {
      flex-direction: row;
    }
    :host([orientation='horizontal']) [part='drops'] {
      grid-auto-flow: column;
    }
    :host([orientation='vertical']) [part='drags'] {
      flex-direction: column;
    }
    :host([orientation='vertical']) [part='drops'] {
      grid-template-columns: 1fr;
    }

    /* Drop target. The interaction measures its chips and publishes the result as a custom
     property on its host; the property itself lives here, not in a style attribute. */
    [part~='drop'] {
      display: block;
      flex: 1;
      min-height: var(--qti-dropzone-min-height, 0);
    }

    [part~='drop'][active],
    [part~='drop'][enabled],
    [part='drops']:has([part~='drop'] > [part='drag']) {
      background-color: var(--qti-background-color-active-droplist);
    }

    [part~='drop'][active] {
      border-color: var(--qti-border-active);
      background-color: var(--qti-bg-active);
    }

    [part~='drop'][enabled] {
      background-color: var(--qti-bg-active) !important;
    }

    [part~='drop'][data-cross-slot-target] {
      border-color: var(--qti-border-active, #0066cc) !important;
      background-color: var(--qti-bg-active, rgba(0, 102, 204, 0.1)) !important;
      outline: 2px dashed var(--qti-border-active, #0066cc);
      outline-offset: -2px;
    }

    [part~='drop']:has([part='drag']) {
      --qti-drop-border: none;
      --qti-drop-bg-img: none;
    }

    /* Candidate correction colors for choices placed inside drop targets. */
    [part~='drop'] [qti-draggable='true']:state(candidate-correct),
    [part='drag']:state(candidate-correct) {
      background-color: var(--qti-correct-response, --qti-correct);
    }

    [part~='drop'] [qti-draggable='true']:state(candidate-incorrect),
    [part='drag']:state(candidate-incorrect) {
      background-color: var(--qti-incorrect);
    }

    [part='container'] {
      display: flex;
      gap: 0.5rem;
    }
    :host(.qti-choices-top) [part='container'] {
      flex-direction: column;
    }
    :host(.qti-choices-bottom) [part='container'] {
      flex-direction: column-reverse;
    }
    :host(.qti-choices-left) [part='container'] {
      flex-direction: row;
    }
    :host(.qti-choices-right) [part='container'] {
      flex-direction: row-reverse;
    }
  `
];
