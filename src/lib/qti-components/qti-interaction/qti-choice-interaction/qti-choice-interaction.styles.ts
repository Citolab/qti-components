import { css } from 'lit';

export default css`
  [part='slot'] {
    /* display: flex; */
    /* flex-direction: column; */
    /* gap: var(--qti-gap-size); */
    --choice-interactions-stacking: 1;
    display: grid; /* grid */
    grid-template-columns: repeat(var(--choice-interactions-stacking), minmax(0, 1fr)); /* grid-cols-2 */
    gap: var(--qti-gap-size); /* gap-4 */
    /* qti-prompt {
      grid-column: span var(--choice-interactions-stacking) / span var(--choice-interactions-stacking); 
    } */
  }

  :host(.qti-choices-stacking-1) [part='slot'] {
    --choice-interactions-stacking: 1;
  }

  :host(.qti-choices-stacking-2) [part='slot'] {
    --choice-interactions-stacking: 2;
  }
  :host(.qti-choices-stacking-3) [part='slot'] {
    --choice-interactions-stacking: 3;
  }
  :host(.qti-choices-stacking-4) [part='slot'] {
    --choice-interactions-stacking: 4;
  }
  :host(.qti-choices-stacking-5) [part='slot'] {
    --choice-interactions-stacking: 5;
  }
  :host()[part='slot'] {
    &.qti-orientation-horizontal {
      /* is the default layout */
    }
  }
  :host()[part='slot'] {
    &[orientation='horizontal'] {
      flex-direction: row;
    }
  }
`;
