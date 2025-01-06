import { Meta } from '@storybook/web-components';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../../lib/qti-components';

const meta: Meta<QtiAssessmentItem> = {
  title: 'Theme/Controls'
};
export default meta;

class ButtonComponent extends LitElement {
  @property({ type: String }) ch: string;
  @property({ type: String }) cha: string;
  private placeChild = this.firstChild;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  constructor() {
    super();
    this.placeChild?.remove();
  }

  render() {
    return html`<div class=${this.ch}><div class=${`check-size ${this.cha}`}></div></div>
      <div>${this.placeChild}</div>
      <div part="drop"></div>`;
  }
}
window.customElements.define('button-component', ButtonComponent);

// grid grid-cols-6 gap-4
export const Controls = (_mod: string) => html`
  <css-variable-editor></css-variable-editor>
  <div style="display:grid;grid-template-columns: repeat(7, minmax(0, 1fr));gap:2rem;">
    <style>
      button-component {
        display: flex;
        align-items: center;
      }
      @scope {
        [clip] {
          width: 100%;
          height: 50px;
          clip-path: polygon(50% 0, 0% 100%, 100% 100%);
        }
      }
    </style>

    <div>button</div>
    <div>hover</div>
    <div>focus</div>
    <div>active</div>
    <div>active+focus</div>
    <div>disabled</div>
    <div>dragging</div>

    <button-component ch="check-radio" cha="" class="check">check</button-component>
    <button-component ch="check-radio" cha="" class="check hov">check</button-component>
    <button-component ch="check-radio" cha="" class="check foc">check</button-component>
    <button-component ch="check-radio" cha="check-radio-checked" class="check act">check</button-component>
    <button-component ch="check-radio" cha="check-radio-checked" class="check foc act">check</button-component>
    <button-component ch="check-radio" cha="check-radio-checked dis" class="check dis">check</button-component>
    <div></div>

    <button-component ch="check-checkbox" cha="" class="check">check</button-component>
    <button-component ch="check-checkbox" cha="" class="check hov">check</button-component>
    <button-component ch="check-checkbox" cha="" class="check foc">check</button-component>
    <button-component ch="check-checkbox" cha="check-checkbox-checked" class="check act">check</button-component>
    <button-component ch="check-checkbox" cha="check-checkbox-checked" class="check foc act">check</button-component>
    <button-component ch="check-checkbox" cha="check-checkbox-checked dis" class="check dis">check</button-component>
    <div></div>

    <div class="button">button</div>
    <div class="button hov ">button</div>
    <div class="button foc ">button</div>
    <div class="button act ">button</div>
    <div class="button foc act ">button</div>
    <div class="button dis ">button</div>
    <div></div>

    <div class="spot"></div>
    <div class="spot hov "></div>
    <div class="spot foc "></div>
    <div class="spot act "></div>
    <div class="spot foc act "></div>
    <div class="spot dis "></div>
    <div>&#x200B;</div>

    <div clip class="spot"></div>
    <div clip class="spot hov "></div>
    <div clip class="spot foc "></div>
    <div clip class="spot act "></div>
    <div clip class="spot foc act "></div>
    <div clip class="spot dis "></div>
    <div>&#x200B;</div>

    <div class="order">1</div>
    <div class="order hov">1</div>
    <div class="order foc">1</div>
    <div class="order act">1</div>
    <div class="order foc act">1</div>
    <div class="order dis">1</div>
    <div class=""></div>

    <div class="drag">drag</div>
    <div class="drag hov">drag</div>
    <div class="drag foc">drag</div>
    <div class="drag act">drag</div>
    <div class="drag foc act">drag</div>
    <div class="drag dis">drag</div>
    <div class="drag dragging">drag</div>

    <div class="drop"></div>
    <div class="drop hov"></div>
    <div class="drop foc"></div>
    <div class="drop act"></div>
    <div class="drop foc act"></div>
    <div class="drop dis"></div>
    <div class="drop dropping">drop</div>

    <div class="drop"><div class="drag">drag</div></div>
    <div class="drop hov"><div class="drag">drag</div></div>
    <div class="drop foc"><div class="drag">drag</div></div>
    <div class="drop act"><div class="drag">drag</div></div>
    <div class="drop foc act"><div class="drag">drag</div></div>
    <div class="drop dis"><div class="drag">drag</div></div>
    <div></div>

    <div class="drop">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop hov">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop foc">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop act">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop foc act">
      With text
      <div class="drag">drag</div>
    </div>
    <div class="drop dis">
      With text
      <div class="drag">drag</div>
    </div>
    <div></div>

    <input type="text" class="text" value="Button text" />
    <input type="text" class="text hov" value="Button text" />
    <input type="text" class="text foc" value="Button text" />
    <input type="text" class="text act" value="Button text" />
    <input type="text" class="text foc act" value="Button text" />
    <input type="text" class="text dis" value="Button text" />
    <div></div>

    <select class="select">
      <option>Button text</option>
    </select>
    <select class="select hov">
      <option>Button text</option>
    </select>
    <select class="select foc">
      <option>Button text</option>
    </select>
    <select class="select act">
      <option>Button text</option>
    </select>
    <select class="select foc act">
      <option>Button text</option>
    </select>
    <select class="select dis">
      <option>Button text</option>
    </select>
    <div></div>
  </div>
`;
