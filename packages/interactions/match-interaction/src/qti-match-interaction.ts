import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

// import { DragDropInteractionMixin } from '@qti-components/interactions-core/mixins/drag-drop';
import styles from './qti-match-interaction.styles';
import tabularStyles from './qti-match-interaction-tabular.styles';

import type { ResponseVariable } from '@qti-components/base';
import type { CSSResultGroup, PropertyValues } from 'lit';
import type { ResponseInteraction } from '@qti-components/base';
import type { QtiSimpleAssociableChoice } from '@qti-components/interactions-core/elements/qti-simple-associable-choice';
/**
 * Match interaction: candidates pair items from two sets, either as drag-and-drop or as a tabular grid.
 *
 * @slot prompt - The prompt shown above the interaction.
 * @slot match-cols - Column headers (tabular mode).
 * @slot match-rows - Row headers (tabular mode).
 * @slot - Default slot for the two match sets (drag-and-drop mode).
 *
 * @csspart grid - The tabular grid container.
 * @csspart corner - The top-left corner cell of the grid.
 * @csspart cols-wrap - Wrapper row for the column headers.
 * @csspart c-header - The column header slot wrapper.
 * @csspart rows-wrap - Wrapper column for the row headers.
 * @csspart r-header - The row header slot wrapper.
 * @csspart checkbox-grid - The interactive cell grid area.
 * @csspart input-cell - Each cell's label element.
 * @csspart control - The visible checkbox/radio box (tabular mode). Also carries the variant
 *   tokens `radio` | `checkbox`, `checked`, and `correct` | `incorrect` — e.g.
 *   `::part(control radio checked correct)`. These mirror the custom-state vocabulary; the cells
 *   are plain spans in the shadow root, so they cannot carry real `:state()`.
 * @csspart control-mark - The inner mark element; carries the same variant tokens as `control`.
 * @csspart message - Live validation message region (role="alert").
 */
export class QtiMatchInteraction extends DragDropSlottedSortableMixin(
  DragDropSlottedMixin(
    Interaction,
    'qti-simple-match-set:first-of-type qti-simple-associable-choice, qti-simple-match-set:last-of-type > qti-simple-associable-choice > qti-simple-associable-choice',
    'qti-simple-match-set:last-of-type > qti-simple-associable-choice',
    'qti-simple-match-set:first-of-type'
  ),
  '[qti-draggable="true"]'
) {
  static override styles: CSSResultGroup = [styles, tabularStyles];

  /**
   * Match targets are categories, not slots. They should look able to hold several answers, so they
   * take the vendor floor (`--qti-drop-min-height`) rather than the size of the widest chip.
   */
  public override autoSizeDropzones = false;

  protected sourceChoices: QtiSimpleAssociableChoice[];
  protected targetChoices: QtiSimpleAssociableChoice[];
  protected lastCheckedRadio: HTMLInputElement | null = null;

  @property({ type: String }) class: string = '';

  @state() protected _response: string | string[] = [];
  // dragDropApi: TouchDragAndDrop;
  get response(): string[] {
    if (!this.classList.contains('qti-match-tabular')) return super.response as string[];
    else return this._response as string[];
  }
  set response(val: string[]) {
    if (!this.classList.contains('qti-match-tabular')) super.response = val;
    else this._response = val;
  }

  // Tabular mode is a pure radio/checkbox grid — drag-drop has no role there, so the choices
  // must not advertise themselves as draggable either. Suppresses `:state(drag)` on them.
  public override isDragDropEnabled(): boolean {
    return !this.classList.contains('qti-match-tabular');
  }

  // Tabular mode is a pure radio/checkbox grid — drag-drop has no role there.
  // Short-circuit drag initiation so no clone is created and no shadow/lightdom
  // state can diverge from this._response.
  public override initiateDrag(...args: any[]): void {
    if (this.classList.contains('qti-match-tabular')) return;
    (super.initiateDrag as (...a: any[]) => void)(...args);
  }

  // Skip the drag-drop auto-sizing pass in tabular mode — it would write
  // inline min-width/min-height onto each choice that forces the grid columns
  // to the draggable's natural width.
  public override afterCache(): void {
    if (this.classList.contains('qti-match-tabular')) return;
    super.afterCache();
  }

  @property({ type: String, attribute: 'response-identifier' }) override responseIdentifier: string = '';

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.sourceChoices = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice')
    );
    this.targetChoices = Array.from<QtiSimpleAssociableChoice>(
      this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice')
    );

    this.syncTabularSlotting();
  }

  protected override willUpdate(changed: PropertyValues): void {
    super.willUpdate?.(changed);
    if (changed.has('class')) this.syncTabularSlotting();
  }

  private syncTabularSlotting(): void {
    const isTabular = this.classList.contains('qti-match-tabular');
    const sets = this.querySelectorAll(':scope > qti-simple-match-set');
    const sourceSet = sets[0] as HTMLElement | undefined;
    const targetSet = sets[1] as HTMLElement | undefined;

    const stripSizing = (c: QtiSimpleAssociableChoice) => {
      c.style.removeProperty('min-width');
      c.style.removeProperty('min-height');
      c.style.removeProperty('--qti-dropzone-min-height');
    };
    if (isTabular) {
      sourceSet?.setAttribute('slot', 'match-rows');
      targetSet?.setAttribute('slot', 'match-cols');
      // Choices flow into the subgrid wrappers via DOM order — no per-choice
      // grid-row/grid-column writes required. --qti-match-rows/-cols are set
      // inline on [part='grid'] from render() so the editor (which can't write
      // to host style under ProseMirror) shares the same mechanism.
      this.sourceChoices?.forEach(c => {
        stripSizing(c);
        c.setAttribute('role', 'rowheader');
      });
      this.targetChoices?.forEach(c => {
        stripSizing(c);
        c.setAttribute('role', 'columnheader');
      });
    } else {
      sourceSet?.removeAttribute('slot');
      targetSet?.removeAttribute('slot');
      this.sourceChoices?.forEach(c => c.removeAttribute('role'));
      this.targetChoices?.forEach(c => c.removeAttribute('role'));
    }
  }

  protected handleRadioClick = (e: { target: HTMLInputElement }) => {
    const radio = e.target as HTMLInputElement;
    if (this.lastCheckedRadio === radio) {
      radio.checked = false;
      this.lastCheckedRadio = null;
      this.handleRadioChange(e);
    } else {
      this.lastCheckedRadio = radio;
    }
  };

  protected handleRadioChange = (e: { target: any }) => {
    const checkbox = e.target as HTMLInputElement;
    const value = checkbox.value;
    const name = checkbox.name;
    const type = checkbox.type;

    if (checkbox.checked) {
      if (!this.response) {
        this.response = [value];
      } else if (this.response.indexOf(value) === -1) {
        if (type === 'radio') {
          this.response = (this.response || []).filter(v => v.indexOf(name) === -1);
        }
        this.response = [...this.response, value];
      }
      this.lastCheckedRadio = checkbox;
    } else {
      this.response = (this.response || []).filter(v => v !== value);
      this.lastCheckedRadio = null;
    }

    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent<ResponseInteraction>('qti-interaction-response', {
        bubbles: true,
        composed: true,
        detail: {
          responseIdentifier: this.responseIdentifier,
          response: Array.isArray(this.response) ? [...this.response] : this.response
        }
      })
    );
  };

  validate(): boolean {
    if (this.class.split(' ').includes('qti-match-tabular')) {
      return this.response?.length === this.sourceChoices.length;
    } else {
      return super.validate();
    }
  }

  /** Extension hook for packages that add visual state tokens to tabular cells. */
  protected getCellStateVariant(_value: string, _checked: boolean): string {
    return '';
  }

  override render() {
    const isTabular = this.class.split(' ').includes('qti-match-tabular');
    return html`
      <slot name="prompt"></slot>
      <slot ?hidden=${isTabular}></slot>

      ${isTabular
        ? html`
            <div
              part="grid"
              role="grid"
              style="--qti-match-rows: ${this.sourceChoices.length}; --qti-match-cols: ${this.targetChoices.length};"
            >
              <div part="corner"></div>
              <div part="cols-wrap" role="row"><slot name="match-cols" part="c-header"></slot></div>
              <div part="rows-wrap"><slot name="match-rows" part="r-header"></slot></div>
              <div part="checkbox-grid">
                ${this.sourceChoices.map(
                  (row, r) => html`
                    <div role="row" style="display: contents;">
                      ${this.targetChoices.map((col, c) => {
                        const rowId = row.getAttribute('identifier');
                        const colId = col.getAttribute('identifier');
                        const value = `${rowId} ${colId}`;
                        const selectedInRowCount =
                          (this.response || []).filter(v => v.split(' ')[0] === rowId).length || 0;
                        const checked = this.response?.includes(value) || false;
                        const type = row.matchMax === 1 ? 'radio' : 'checkbox';
                        /*
                         * The cells are plain spans in this interaction's shadow root, so they
                         * have no ElementInternals and cannot carry `:state()` — and
                         * `::part(x):state(y)` requires the state to live on the part's own
                         * element. Multi-token parts are the correct mechanism here. The tokens
                         * deliberately reuse the state vocabulary (`radio`, `checkbox`,
                         * `checked`, `correct`, `incorrect`) so a themer reads the same words
                         * everywhere.
                         *
                         */
                        const stateVariant = this.getCellStateVariant(value, checked);
                        const checkedMarker = checked ? 'checked' : '';
                        const controlPart = `control ${type} ${checkedMarker} ${stateVariant}`.trim();
                        const controlMarkPart = `control-mark ${type} ${checkedMarker} ${stateVariant}`.trim();
                        const disable =
                          row.matchMax === 1
                            ? false
                            : row.matchMax !== 0 && selectedInRowCount >= row.matchMax && !checked;
                        return html`
                          <label
                            part="input-cell"
                            role="gridcell"
                            style="grid-row: ${r + 1}; grid-column: ${c +
                            1}; display: flex; align-items: center; justify-content: center; cursor: pointer;"
                          >
                            <input
                              type=${type}
                              hidden
                              name=${rowId}
                              value=${value}
                              .checked=${checked}
                              .disabled=${disable}
                              @change=${(e: { target: any }) => this.handleRadioChange(e)}
                              @click=${(e: { target: HTMLInputElement }) =>
                                row.matchMax === 1 ? this.handleRadioClick(e) : null}
                            />
                            <span part=${controlPart} role=${type} aria-checked=${checked ? 'true' : 'false'}>
                              <span part=${controlMarkPart}></span>
                            </span>
                          </label>
                        `;
                      })}
                    </div>
                  `
                )}
              </div>
            </div>
          `
        : nothing}

      <div role="alert" part="message" id="validation-message"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-match-interaction': QtiMatchInteraction;
  }
}
