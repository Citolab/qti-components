import { css } from 'lit';

export default css`
  [part='slot'] {
    display: flex;
    flex-direction: column;
    gap: var(--qti-gap-size);
    flex-wrap: wrap;
  }

  ::slotted(qti-simple-choice) {
    flex: 0 0 calc((100% - (var(--qti-gap-size) * var(--choice-interactions-stacking))) / var(--choice-interactions-stacking)) !important; 
    box-sizing: border-box !important;
  }

  :host(.qti-choices-stacking-1) [part='slot'] {
    flex-direction: row;
    --choice-interactions-stacking: 1;
  }

  :host(.qti-choices-stacking-2) [part='slot'] {
    flex-direction: row;
    --choice-interactions-stacking: 2;
  }
  :host(.qti-choices-stacking-3) [part='slot'] {
    flex-direction: row;
    --choice-interactions-stacking: 3;
  }
  :host(.qti-choices-stacking-4) [part='slot'] {
    flex-direction: row;
    --choice-interactions-stacking: 4;
  }
  :host(.qti-choices-stacking-5) [part='slot'] {
    flex-direction: row;
    --choice-interactions-stacking: 5;
  }
  :host([orientation='horizontal']) [part='slot'] {
    flex-direction: row;
  }
`;
