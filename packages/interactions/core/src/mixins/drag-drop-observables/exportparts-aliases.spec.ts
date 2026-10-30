import { describe, expect, it } from 'vitest';

/**
 * A placed chip forwards one inner part under two outer names for the alias period
 * (`control: chip-control, control: drag-control`, drag-drop-slotted.mixin.ts). This pins the
 * browser behaviour that makes that work: `exportparts` may map the same inner name twice, and both
 * outer names match from the document.
 */
describe('exportparts: one inner part, two outer names', () => {
  it('both outer names match from the document', async () => {
    const style = document.createElement('style');
    style.textContent = `
      x-host::part(chip-control) { color: rgb(1, 2, 3); }
      x-host::part(drag-control) { background-color: rgb(4, 5, 6); }
    `;
    document.head.appendChild(style);

    class XChip extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = `<span part="control">handle</span>`;
      }
    }
    class XHost extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML =
          `<x-chip exportparts="control: chip-control, control: drag-control"></x-chip>`;
      }
    }
    if (!customElements.get('x-chip')) customElements.define('x-chip', XChip);
    if (!customElements.get('x-host')) customElements.define('x-host', XHost);

    const host = document.createElement('x-host');
    document.body.appendChild(host);
    const control = host.shadowRoot!.querySelector('x-chip')!.shadowRoot!.querySelector('span')!;
    const cs = getComputedStyle(control);
    expect(cs.color, 'new name').toBe('rgb(1, 2, 3)');
    expect(cs.backgroundColor, 'old name').toBe('rgb(4, 5, 6)');

    host.remove();
    style.remove();
  });
});
