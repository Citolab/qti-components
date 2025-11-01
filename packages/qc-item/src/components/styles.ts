// /* eslint-disable lit-plugin(no-invalid-css) */
import { css } from 'lit';

export const form = css`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  user-select: none;
`;

export const btn = css`
  background-color: lightgray;
  ${form};
`;

export const dis = css`
  cursor: not-allowed;
  opacity: 0.8;
`;

export const ind = css`
  ${form};
  border: 1px solid gray;
`;
