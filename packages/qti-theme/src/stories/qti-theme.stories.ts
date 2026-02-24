import type { QtiAssessmentItem } from '@qti-components/elements';
import type { Meta } from '@storybook/web-components-vite';

const html = String.raw;

const meta: Meta<QtiAssessmentItem> = {
  title: 'Theme',
  parameters: {
    backgrounds: {
      // 👇 Set default background value for all component stories
      default: 'light'
    }
  }
};
export default meta;

class ButtonComponent extends HTMLElement {
  #placeChild: ChildNode | null;

  constructor() {
    super();
    this.#placeChild?.remove();
  }

  connectedCallback() {
    this.#placeChild = this.firstChild;
    this.render();
  }

  get ch() {
    return this.getAttribute('ch') || '';
  }

  get cha() {
    return this.getAttribute('cha') || '';
  }

  render() {
    this.innerHTML = `<div class="${this.ch}"><div class="check-size ${this.cha}"></div></div>
      <div>${this.#placeChild ? this.#placeChild.textContent || '' : ''}</div>
      <div part="drop"></div>`;
  }
}

window.customElements.define('button-component', ButtonComponent);

// grid grid-cols-6 gap-4
export const Theme = (_mod: string) => html`
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

    <button type="button" class="dropdown-trigger">Dropdown trigger</button>
    <button type="button" class="dropdown-trigger hov">Dropdown trigger</button>
    <button type="button" class="dropdown-trigger foc">Dropdown trigger</button>
    <button type="button" class="dropdown-trigger act">Dropdown trigger</button>
    <button type="button" class="dropdown-trigger foc act">Dropdown trigger</button>
    <button type="button" class="dropdown-trigger dis">Dropdown trigger</button>
    <div></div>

    <div class="dropdown-menu">Dropdown menu</div>
    <div class="dropdown-menu hov">Dropdown menu</div>
    <div class="dropdown-menu foc">Dropdown menu</div>
    <div class="dropdown-menu act">Dropdown menu</div>
    <div class="dropdown-menu foc act">Dropdown menu</div>
    <div class="dropdown-menu dis">Dropdown menu</div>
    <div></div>

    <button type="button" class="dropdown-option">Dropdown option</button>
    <button type="button" class="dropdown-option hov">Dropdown option</button>
    <button type="button" class="dropdown-option foc">Dropdown option</button>
    <button type="button" class="dropdown-option act-bg">Dropdown option</button>
    <button type="button" class="dropdown-option foc act-bg">Dropdown option</button>
    <button type="button" class="dropdown-option dis">Dropdown option</button>
    <div></div>

    <div class="dropdown-trigger" style="display:flex;justify-content:space-between;">
      Dropdown icon
      <span class="dropdown-icon" aria-hidden="true">▾</span>
    </div>
    <div class="dropdown-trigger hov" style="display:flex;justify-content:space-between;">
      Dropdown icon
      <span class="dropdown-icon" aria-hidden="true">▾</span>
    </div>
    <div class="dropdown-trigger foc" style="display:flex;justify-content:space-between;">
      Dropdown icon
      <span class="dropdown-icon" aria-hidden="true">▾</span>
    </div>
    <div class="dropdown-trigger act" style="display:flex;justify-content:space-between;">
      Dropdown icon
      <span class="dropdown-icon dropdown-icon-open" aria-hidden="true">▾</span>
    </div>
    <div class="dropdown-trigger foc act" style="display:flex;justify-content:space-between;">
      Dropdown icon
      <span class="dropdown-icon dropdown-icon-open" aria-hidden="true">▾</span>
    </div>
    <div class="dropdown-trigger dis" style="display:flex;justify-content:space-between;">
      Dropdown icon
      <span class="dropdown-icon" aria-hidden="true">▾</span>
    </div>
    <div></div>

    <div style="display:grid;gap:0.35rem;">
      <button type="button" class="dropdown-trigger" style="justify-content:space-between;">
        Inline-choice
        <span class="dropdown-icon" aria-hidden="true">▾</span>
      </button>
      <div class="dropdown-menu" style="display:grid;gap:0.25rem;">
        <button type="button" class="dropdown-option">Select</button>
        <button type="button" class="dropdown-option act-bg">York</button>
        <button type="button" class="dropdown-option">Lancaster</button>
      </div>
    </div>
    <div style="display:grid;gap:0.35rem;">
      <button type="button" class="dropdown-trigger hov" style="justify-content:space-between;">
        Inline-choice
        <span class="dropdown-icon" aria-hidden="true">▾</span>
      </button>
      <div class="dropdown-menu hov" style="display:grid;gap:0.25rem;">
        <button type="button" class="dropdown-option hov">Select</button>
        <button type="button" class="dropdown-option act-bg">York</button>
        <button type="button" class="dropdown-option">Lancaster</button>
      </div>
    </div>
    <div style="display:grid;gap:0.35rem;">
      <button type="button" class="dropdown-trigger foc" style="justify-content:space-between;">
        Inline-choice
        <span class="dropdown-icon" aria-hidden="true">▾</span>
      </button>
      <div class="dropdown-menu foc" style="display:grid;gap:0.25rem;">
        <button type="button" class="dropdown-option foc">Select</button>
        <button type="button" class="dropdown-option act-bg">York</button>
        <button type="button" class="dropdown-option">Lancaster</button>
      </div>
    </div>
    <div style="display:grid;gap:0.35rem;">
      <button type="button" class="dropdown-trigger act" style="justify-content:space-between;">
        Inline-choice
        <span class="dropdown-icon dropdown-icon-open" aria-hidden="true">▾</span>
      </button>
      <div class="dropdown-menu act" style="display:grid;gap:0.25rem;">
        <button type="button" class="dropdown-option">Select</button>
        <button type="button" class="dropdown-option act-bg">York</button>
        <button type="button" class="dropdown-option">Lancaster</button>
      </div>
    </div>
    <div style="display:grid;gap:0.35rem;">
      <button type="button" class="dropdown-trigger foc act" style="justify-content:space-between;">
        Inline-choice
        <span class="dropdown-icon dropdown-icon-open" aria-hidden="true">▾</span>
      </button>
      <div class="dropdown-menu foc act" style="display:grid;gap:0.25rem;">
        <button type="button" class="dropdown-option foc">Select</button>
        <button type="button" class="dropdown-option act-bg">York</button>
        <button type="button" class="dropdown-option">Lancaster</button>
      </div>
    </div>
    <div style="display:grid;gap:0.35rem;">
      <button type="button" class="dropdown-trigger dis" style="justify-content:space-between;">
        Inline-choice
        <span class="dropdown-icon" aria-hidden="true">▾</span>
      </button>
      <div class="dropdown-menu dis" style="display:grid;gap:0.25rem;">
        <button type="button" class="dropdown-option dis">Select</button>
        <button type="button" class="dropdown-option dis">York</button>
        <button type="button" class="dropdown-option dis">Lancaster</button>
      </div>
    </div>
    <div></div>
  </div>
`;
