import { StoryFn } from '@storybook/web-components';
import { html, render } from 'lit-html';

export function withShadowRoot(storyFn: StoryFn, csss: string = '') {
  // debugger;
  const element = document.createElement('storybook-shadow-root');
  const shadow = element.attachShadow({ mode: 'open' });
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(csss);
  shadow.adoptedStyleSheets = [sheet];
  element.appendChild(shadow);
  render(storyFn, shadow);
  return html`${element}`;
}
