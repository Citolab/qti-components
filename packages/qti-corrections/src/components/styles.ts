import { css } from 'lit';

/*
 * The look sits on an inner element, not on the host: a page's reset (Tailwind's preflight: `* { padding: 0 }`) is a page
 * rule and beats the `:host` rules of a shadow root, so a host that paints its own padding loses it. The inner element
 * is in the shadow tree, out of reach of the page's `*`. The host keeps its display, cursor and radius.
 */
export const hostBox = css`
  display: inline-flex;
  cursor: pointer;
  border-radius: 0.25rem;
  user-select: none;
`;

export const form = css`
  display: flex;
  flex: 1 1 auto;
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
