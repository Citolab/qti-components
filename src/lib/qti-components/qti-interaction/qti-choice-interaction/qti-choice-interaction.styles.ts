import { css } from 'lit';

export default css`
  :host {
    display: block;
  }

  [part='slot'] {
    display: grid;
    gap: 10px;
  }

  /* Define the number of columns dynamically */
  :host([class*='qti-choices-stacking-']) [part='slot'] {
    grid-template-columns: repeat(var(--stacking-count, 1), 1fr);
  }

  /* Apply dynamic stacking count based on class */
  :host(.qti-choices-stacking-1) {
    --stacking-count: 1;
  }
  :host(.qti-choices-stacking-2) {
    --stacking-count: 2;
  }
  :host(.qti-choices-stacking-3) {
    --stacking-count: 3;
  }
  :host(.qti-choices-stacking-4) {
    --stacking-count: 4;
  }
  :host(.qti-choices-stacking-5) {
    --stacking-count: 5;
  }
  :host(.qti-choices-stacking-6) {
    --stacking-count: 6;
  }

  /* Default slot item layout */
  ::slotted(qti-simple-choice) {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  /* Orientation styles */
  :host(.qti-orientation-horizontal) [part='slot'] {
    grid-auto-flow: dense column;
    grid-auto-columns: 1fr;
  }

  :host(.qti-orientation-vertical) [part='slot'] {
    grid-auto-flow: row;
  }

  /* Vertical and horizontal stacking logic */
  :host(.qti-orientation-vertical[class*='qti-choices-stacking-']) [part='slot'] {
    grid-auto-flow: dense column;
    grid-auto-columns: 1fr;
    grid-template-columns: repeat(var(--stacking-count), 1fr);
    grid-template-rows: repeat(calc(var(--item-count) / var(--stacking-count)), 1fr);
  }

  :host(.qti-orientation-horizontal[class*='qti-choices-stacking-']) [part='slot'] {
    grid-auto-flow: row;
    grid-template-columns: repeat(var(--stacking-count), 1fr);
    grid-template-rows: unset;
  }

  /* Ensure even distribution in vertical mode */
  :host(.qti-orientation-vertical) ::slotted(qti-simple-choice:nth-child(even)) {
    grid-row: auto;
  }
`;

// export default css`
//   [part='slot'] {
//     display: flex;
//     flex-direction: column;
//     gap: var(--qti-gap-size);
//     flex-wrap: wrap;
//   }

//   ::slotted(qti-simple-choice) {
//     flex: 0 0
//       calc((100% - (var(--qti-gap-size) * var(--choice-interactions-stacking))) / var(--choice-interactions-stacking)) !important;
//     box-sizing: border-box !important;
//   }

//   :host(.qti-choices-stacking-1) [part='slot'] {
//     flex-direction: row;
//     --choice-interactions-stacking: 1;
//   }

//   :host(.qti-choices-stacking-2) [part='slot'] {
//     flex-direction: row;
//     --choice-interactions-stacking: 2;
//   }
//   :host(.qti-choices-stacking-3) [part='slot'] {
//     flex-direction: row;
//     --choice-interactions-stacking: 3;
//   }
//   :host(.qti-choices-stacking-4) [part='slot'] {
//     flex-direction: row;
//     --choice-interactions-stacking: 4;
//   }
//   :host(.qti-choices-stacking-5) [part='slot'] {
//     flex-direction: row;
//     --choice-interactions-stacking: 5;
//   }
//   :host([orientation='horizontal']) [part='slot'] {
//     flex-direction: row;
//   }

//   :host(.qti-orientation-horizontal) [part='slot'] {
//     flex-direction: row;
//     flex-wrap: nowrap;
//   }

//   :host(.qti-orientation-horizontal) ::slotted(qti-simple-choice) {
//     flex: 1 1 auto !important;
//   }
// `;
