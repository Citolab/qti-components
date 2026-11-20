import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

import styles from './qti-match-interaction.styles';
import tabularStyles from './qti-match-interaction-tabular.styles';

import type { ResponseVariable } from '@qti-components/base';
import type { CSSResultGroup, PropertyValues } from 'lit';
import type { ResponseInteraction } from '@qti-components/base';
import type { QtiSimpleAssociableChoice } from '@qti-components/interactions-core/elements/qti-simple-associable-choice';
/**
 * Match interaction: candidates pair items from two sets, either as drag-and-drop or as a tabular grid.
 *
 * @customElement qti-match-interaction
 *
 * @attr {string} response-identifier - Required. Identifier of the bound response variable.
 * @attr {number} [max-associations=1] - Maximum pairings across the whole interaction; `0`
 *   means unlimited. Without the attribute it is QTI's default of 1 (information model §5.89).
 * @attr {number} [min-associations=0] - Minimum pairings for a valid response (QTI's default).
 * @attr {string} data-first-column-header - QTI shared vocabulary, with `qti-match-tabular`: the
 *   text of the table's top-left cell.
 * @attr {boolean} [shuffle=false] - Requests shuffling of both match sets. Applied by the
 *   transform pipeline (`qti-transformers`), not by this element.
 * @attr {'qti-match-tabular'|'qti-header-hidden'|'qti-choices-top'|'qti-choices-bottom'|'qti-choices-left'|'qti-choices-right'} class -
 *   QTI shared presentation vocabulary. `qti-match-tabular` renders a checkbox/radio grid
 *   instead of drag-and-drop, and with it `qti-header-hidden` leaves out the column-header row;
 *   the `qti-choices-*` values position the source set.
 * @attr {boolean} [auto-size-dropzones=false] - Extension, not QTI. Sizes every drop target to
 *   the widest chip so placement does not reflow the layout. The mixin default is `true`; this
 *   interaction is the one that overrides it to `false`, because a match target is a category card
 *   rather than a socket (see the field below and DROP-SIZING.md §1).
 * @attr {boolean} [disable-animations=false] - Extension, not QTI. Disables the FLIP move
 *   animation.
 *
 * @slot prompt - The prompt shown above the interaction.
 * @slot match-cols - Column headers (tabular mode).
 * @slot match-rows - Row headers (tabular mode).
 * @slot - Default slot for the two match sets (drag-and-drop mode).
 *
 * @csspart grid - The tabular grid container.
 * @csspart corner - The top-left corner cell of the grid; shows `data-first-column-header`.
 * @csspart columns - Wrapper row for the column headers (was `cols-wrap`).
 * @csspart column-header - The column header slot (was `c-header`).
 * @csspart rows - Wrapper column for the row headers (was `rows-wrap`).
 * @csspart row-header - The row header slot (was `r-header`).
 * @csspart cells - The interactive cell grid area (was `checkbox-grid`).
 * @csspart cell - Each cell's label element (was `input-cell`).
 * @csspart control - The visible checkbox/radio box (tabular mode). Tokens: `radio` | `checkbox`,
 *   `checked`, `candidate-correct` | `candidate-incorrect` — e.g.
 *   `::part(control radio checked candidate-correct)`. These mirror the custom-state vocabulary;
 *   the cells are plain spans in the shadow root, so they cannot carry real `:state()`.
 * @csspart control-mark - The inner mark element; carries the same tokens as `control`.
 * @csspart message - Live validation message region (role="alert").
 * @cssstate disabled - The interaction is switched off.
 * @cssstate readonly - The interaction is frozen: it shows its value and takes no input.
 * @cssstate drag-active - A drag is in progress (was `dragzone-active`, `dragzone-enabled`).
 */
export class QtiMatchInteraction extends DragDropSlottedSortableMixin(
  DragDropSlottedMixin(
    Interaction,
    'qti-simple-match-set:first-of-type qti-simple-associable-choice, qti-simple-match-set:last-of-type > qti-simple-associable-choice > qti-simple-associable-choice',
    'qti-simple-match-set:last-of-type > qti-simple-associable-choice',
    'qti-simple-match-set:first-of-type'
  ),
  '[data-draggable="true"]'
) {
  static override styles: CSSResultGroup = [styles, tabularStyles];

  /**
   * Match targets are categories, not slots. They should look able to hold several answers, so they
   * take a flat floor (the `--qti-dropzone-min-height` fallback) rather than the size of the widest chip.
   *
   * This is a property of the INTERACTION, not of an individual target. A `match-max="1"` target is
   * still a category that happens to take one answer, and it sits in a grid beside targets that take
   * several — sizing each one to its own contents would make that grid ragged. So the whole
   * interaction opts out, and the per-target `match-max` decides nothing about size here.
   *
   * The interactions where a drop IS a slot — gap-match, order, associate — keep measurement on, and
   * their drops are exactly the widest chip plus the inset.
   */
  public override autoSizeDropzones = false;

  /** QTI's defaults (information model §5.89). */
  public override maxAssociations = 1;
  public override minAssociations = 0;

  protected sourceChoices: QtiSimpleAssociableChoice[];
  protected targetChoices: QtiSimpleAssociableChoice[];
  protected lastCheckedRadio: HTMLInputElement | null = null;

  @property({ type: String }) class: string = '';

  @property({ type: String, attribute: 'data-first-column-header' }) dataFirstColumnHeader: string;

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
      // A header labels its row or column and does nothing when activated, so it leaves the tab
      // order: Tab goes from one answer cell to the next, not through every label first.
      this.sourceChoices?.forEach(c => {
        stripSizing(c);
        c.setAttribute('role', 'rowheader');
        c.tabIndex = -1;
      });
      this.targetChoices?.forEach(c => {
        stripSizing(c);
        c.setAttribute('role', 'columnheader');
        c.tabIndex = -1;
      });
    } else {
      sourceSet?.removeAttribute('slot');
      targetSet?.removeAttribute('slot');
      this.sourceChoices?.forEach(c => {
        c.removeAttribute('role');
        c.tabIndex = c.disabled ? -1 : 0;
      });
      this.targetChoices?.forEach(c => {
        c.removeAttribute('role');
        c.tabIndex = c.disabled ? -1 : 0;
      });
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
              <div part="corner">${this.dataFirstColumnHeader ?? nothing}</div>
              <div part="columns cols-wrap" role="row">
                <slot name="match-cols" part="column-header c-header"></slot>
              </div>
              <div part="rows rows-wrap"><slot name="match-rows" part="row-header r-header"></slot></div>
              <div part="cells checkbox-grid">
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
                            part="cell input-cell"
                            role="gridcell"
                            style="grid-row: ${r + 1}; grid-column: ${c +
                            1}; display: flex; align-items: center; justify-content: center; cursor: pointer;"
                          >
                            <input
                              type=${type}
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
