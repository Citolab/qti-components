import { css } from 'lit';

export default css`
  :host {
    display: block;
    --show-bounds: true;
    --show-ticks: true;
    --show-value: true;
  }

  [part='slider'] {
    margin-left: 2rem; /* mx-8 */
    margin-right: 2rem;
    padding-bottom: 1rem; /* pb-4 */
    padding-top: 1.25rem; /* pt-5 */
  }

  [part='bounds'] {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 0.5rem; /* mb-2 */
  }

  [part='ticks'] {
    margin-left: 0.125rem; /* mx-0.5 */
    margin-right: 0.125rem;
    margin-bottom: 0.25rem; /* mb-1 */
    height: 0.5rem; /* h-2 */
    background: linear-gradient(to right, var(--qti-border-color) var(--qti-border-thickness), transparent 1px) repeat-x
      0 center / calc(calc(100% - var(--qti-border-thickness)) / ((var(--max) - var(--min)) / var(--step))) 100%;
  }

  [part='rail'] {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 0.375rem; /* h-1.5 */
    width: 100%;
    cursor: pointer;
    border-radius: 9999px; /* rounded-full */
    border: 1px solid #d1d5db; /* border-gray-300 */
    background-color: #e5e7eb; /* bg-gray-200 */
  }

  [part='knob'] {
    background-color: var(--qti-bg-active);
    border: 2px solid var(--qti-border-active);
    position: relative;
    height: 1rem; /* h-4 */
    width: 1rem; /* w-4 */
    transform-origin: center;
    transform: translateX(-50%);
    cursor: pointer;
    border-radius: 9999px; /* rounded-full */
    left: var(--value-percentage);
  }
  [part='knob-correct'] {
    background-color: #c8e6c9;
    border: 2px solid #66bb6a;
    position: relative;
    height: 1rem; /* h-4 */
    width: 1rem; /* w-4 */
    transform-origin: center;
    transform: translateX(-50%);
    cursor: pointer;
    border-radius: 9999px; /* rounded-full */
    left: var(--value-percentage-correct);
  }

  [part='value'] {
    position: absolute;
    bottom: 2rem; /* bottom-8 */
    left: 0.5rem; /* left-2 */
    transform: translateX(-50%);
    cursor: pointer;
    border-radius: 0.25rem; /* rounded */
    background-color: #f3f4f6; /* bg-gray-100 */
    padding: 0.25rem 0.5rem; /* px-2 py-1 */
    text-align: center;
    color: #6b7280; /* text-gray-500 */
  }
`;
