import type { BaseType } from '@qti-components/base';
import type { QtiFileData } from './interface';

/**
 * Conversions for base-type `file` between the item and the QTI Appendix C JSON a PCI speaks.
 *
 * A PCI reports a file as `{ data, mime, name? }` with base64 `data`. The item stores it as a data
 * URL, the value `qti-upload-interaction` stores, so a file response looks the same whichever
 * interaction produced it. `name` has no place in a data URL and is dropped, as an upload drops it.
 */

/** `BaseType` does not list `file`, but a declared `base-type="file"` reaches the interaction as is. */
export const isFileBaseType = (baseType: BaseType | string | undefined): boolean => baseType === 'file';

/** An Appendix C file value: an object with base64 `data`. */
export const isQtiFileData = (value: unknown): value is QtiFileData =>
  typeof value === 'object' && value !== null && typeof (value as QtiFileData).data === 'string';

/** PCI → item: `{ data, mime }` as a data URL. A string is kept, as a PCI may already send one. */
export const fileToDataUrl = (file: unknown): string | null => {
  if (file === null || file === undefined || file === '') return null;
  if (typeof file === 'string') return file;
  if (!isQtiFileData(file) || file.data === '') return null;
  if (file.data.startsWith('data:')) return file.data;
  return `data:${file.mime || 'application/octet-stream'};base64,${file.data}`;
};

/** Item → PCI: a stored data URL as `{ data, mime }`. A value without the `data:` scheme is taken as bare base64. */
export const dataUrlToFile = (value: unknown): QtiFileData | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') return isQtiFileData(value) ? value : null;
  const text = String(value);
  const match = /^data:([^;,]*)((?:;[^;,]*)*),([\s\S]*)$/.exec(text);
  if (!match) return { data: text, mime: 'application/octet-stream' };
  const [, mime, params, payload] = match;
  if (params.split(';').includes('base64')) return { data: payload, mime: mime || 'text/plain' };
  // Without `;base64` a data URL carries percent-encoded text; the binding wants base64 either way.
  let binary = '';
  new TextEncoder().encode(decodeURIComponent(payload)).forEach(byte => (binary += String.fromCharCode(byte)));
  return { data: btoa(binary), mime: mime || 'text/plain' };
};
