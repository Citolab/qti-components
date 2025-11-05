import { html, css, LitElement } from 'lit';
import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';

import { computedContext } from '@qti-components/shared';

import type { ResponseVariable } from '@qti-components/shared';
import type { ComputedContext } from '@qti-components/shared';

@customElement('test-print-item-variables')
export class TestPrintVariables extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  static override styles = css`
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
      text-align: left;
    }
    th,
    td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f4f4f4;
      font-weight: bold;
    }
    h3 {
      margin-top: 20px;
      font-size: 16px;
    }
  `;

  override render() {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);

    if (!activeItem || !activeItem.variables) return html``;

    const responseVariables: ResponseVariable[] = activeItem.variables.filter(v => v.type === 'response');
    const outcomeVariables = activeItem.variables.filter(v => v.type === 'outcome');

    const renderTable = (variables: ResponseVariable[], title: string) => html`
      <h3>${title}</h3>
      <table>
        <thead>
          <tr>
            <th>Identifier</th>
            <th>Value</th>
            <th>Cardinality</th>
            <th>Base Type</th>
            <th>Correct Response / Mappings</th>
          </tr>
        </thead>
        <tbody>
          ${variables.map(v => {
            const correctResponse = v.correctResponse
              ? Array.isArray(v.correctResponse)
                ? v.correctResponse.join(', ')
                : v.correctResponse
              : '';

            const mapEntries = v.mapping?.mapEntries?.map(m => `${m.mapKey}=${m.mappedValue}pt`).join(', ') || '';

            const areaMapEntries =
              v.areaMapping?.areaMapEntries?.map(m => `${m.shape}(${m.coords})=${m.mappedValue}pt`).join(', ') || '';

            return html`
              <tr>
                <td>${v.identifier}</td>
                <td>${Array.isArray(v.value) ? v.value.join(', ') : v.value}</td>
                <td>${v.cardinality}</td>
                <td>${v.baseType}</td>
                <td>${correctResponse || mapEntries || areaMapEntries}</td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    `;

    return html`
      ${renderTable(responseVariables, 'Response Variables')} ${renderTable(outcomeVariables, 'Outcome Variables')}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-item-variables': TestPrintVariables;
  }
}
