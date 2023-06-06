import { html } from 'lit';

import './qti-components.stories.css';

export default {
  title: 'styles/themes'
};

class ButtonComponent extends HTMLElement {
  shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.render();
  }
  render() {
    this.shadow.innerHTML = `<div part="ch"><div part="cha"></div></div><slot></slot><div part="drop"></div>`;
  }
}
window.customElements.define('button-component', ButtonComponent);

const components = (mod: string) => html`<div class="grid grid-cols-6 gap-4 p-4">
  <div class="text-xs">button</div>
  <div class="text-xs">hover</div>
  <div class="text-xs">focus</div>
  <div class="text-xs">active</div>
  <div class="text-xs">active+focus</div>
  <div class="text-xs">disabled</div>

  <button-component role="radio" class="check ${mod}" aria-checked="false">check</button-component>
  <button-component role="radio" class="check hov ${mod}" aria-checked="false">check</button-component>
  <button-component role="radio" class="check foc ${mod}" aria-checked="false">check</button-component>
  <button-component role="radio" class="check act ${mod}" aria-checked="true">check</button-component>
  <button-component role="radio" class="check foc act ${mod}" aria-checked="true">check</button-component>
  <button-component role="radio" class="check dis ${mod}" aria-checked="false">check</button-component>

  <button-component role="checkbox" class="check ${mod}" aria-checked="false">check</button-component>
  <button-component role="checkbox" class="check hov ${mod}" aria-checked="false">check</button-component>
  <button-component role="checkbox" class="check foc ${mod}" aria-checked="false">check</button-component>
  <button-component role="checkbox" class="check act ${mod}" aria-checked="true">check</button-component>
  <button-component role="checkbox" class="check foc act ${mod}" aria-checked="true">check</button-component>
  <button-component role="checkbox" class="check dis ${mod}" aria-checked="false">check</button-component>

  <div class="button ${mod}">button</div>
  <div class="button ${mod} hov ">button</div>
  <div class="button ${mod} foc ">button</div>
  <div class="button ${mod} act ">button</div>
  <div class="button ${mod} foc act ">button</div>
  <div class="button ${mod} dis ">button</div>

  <div class="spot ${mod}"></div>
  <div class="spot ${mod} hov "></div>
  <div class="spot ${mod} foc "></div>
  <div class="spot ${mod} act "></div>
  <div class="spot ${mod} foc act "></div>
  <div class="spot ${mod} dis "></div>

  <div class="drag ${mod}">drag</div>
  <div class="drag hov ${mod}">drag</div>
  <div class="drag foc ${mod}">drag</div>
  <div class="drag act ${mod}">drag</div>
  <div class="drag foc act ${mod}">drag</div>
  <div class="drag dis ${mod}">drag</div>

  <div class="drop ${mod}"></div>
  <div class="drop hov ${mod}"></div>
  <div class="drop foc ${mod}"></div>
  <div class="drop act ${mod}"></div>
  <div class="drop foc act ${mod}"></div>
  <div class="drop dis ${mod}"></div>

  <div class="drop ${mod}"><div class="drag ${mod}">drag</div></div>
  <div class="drop hov ${mod}"><div class="drag ${mod}">drag</div></div>
  <div class="drop foc ${mod}"><div class="drag ${mod}">drag</div></div>
  <div class="drop act ${mod}"><div class="drag ${mod}">drag</div></div>
  <div class="drop foc act ${mod}"><div class="drag ${mod}">drag</div></div>
  <div class="drop dis ${mod}"><div class="drag ${mod}">drag</div></div>

  <div class="drop ${mod}">
    With text
    <div class="drag ${mod}">drag</div>
  </div>
  <div class="drop hov ${mod}">
    With text
    <div class="drag ${mod}">drag</div>
  </div>
  <div class="drop foc ${mod}">
    With text
    <div class="drag ${mod}">drag</div>
  </div>
  <div class="drop act ${mod}">
    With text
    <div class="drag ${mod}">drag</div>
  </div>
  <div class="drop foc act ${mod}">
    With text
    <div class="drag ${mod}">drag</div>
  </div>
  <div class="drop dis ${mod}">
    With text
    <div class="drag ${mod}">drag</div>
  </div>

  <input type="text" class="text ${mod}" value="Button text" />
  <input type="text" class="text hov ${mod}" value="Button text" />
  <input type="text" class="text foc ${mod}" value="Button text" />
  <input type="text" class="text act ${mod}" value="Button text" />
  <input type="text" class="text foc act ${mod}" value="Button text" />
  <input type="text" class="text dis ${mod}" value="Button text" />

  <select class="select ${mod}">
    <option>Button text</option>
  </select>
  <select class="select hov ${mod}">
    <option>Button text</option>
  </select>
  <select class="select foc ${mod}">
    <option>Button text</option>
  </select>
  <select class="select act ${mod}">
    <option>Button text</option>
  </select>
  <select class="select foc act ${mod}">
    <option>Button text</option>
  </select>
  <select class="select dis ${mod}">
    <option>Button text</option>
  </select>
</div>`;

export const Components = args => html` ${components('')} ${components('sm')}`;

// export const Components = args => html`<button class="button">asasd</button> <button class="button-in">asasd</button>`;
