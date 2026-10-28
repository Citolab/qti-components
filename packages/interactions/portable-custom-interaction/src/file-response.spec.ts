import { dataUrlToFile, fileToDataUrl } from './file-response';
import { recordFromQtiVariableJSON, recordResponseToQtiVariableJSON } from './record-response';

const FILE = { data: 'aGVsbG8gd29ybGQ=', mime: 'text/plain' }; // "hello world"
const DATA_URL = 'data:text/plain;base64,aGVsbG8gd29ybGQ=';

describe('file responses between the item and a PCI', () => {
  describe('Appendix C file -> stored data URL', () => {
    it('stores { data, mime } as the data URL an upload interaction stores', () => {
      expect(fileToDataUrl({ ...FILE, name: 'hello.txt' })).toBe(DATA_URL);
    });

    it('falls back to application/octet-stream without a mime type', () => {
      expect(fileToDataUrl({ data: 'AAEC' })).toBe('data:application/octet-stream;base64,AAEC');
    });

    it('keeps a value that is a data URL already', () => {
      expect(fileToDataUrl(DATA_URL)).toBe(DATA_URL);
      expect(fileToDataUrl({ data: DATA_URL, mime: 'text/plain' })).toBe(DATA_URL);
    });

    it('reads no file as null', () => {
      expect(fileToDataUrl(null)).toBeNull();
      expect(fileToDataUrl({ data: '', mime: 'text/plain' })).toBeNull();
      expect(fileToDataUrl({ mime: 'text/plain' })).toBeNull();
    });
  });

  describe('stored data URL -> Appendix C file', () => {
    it('turns a base64 data URL back into { data, mime }', () => {
      expect(dataUrlToFile(DATA_URL)).toEqual(FILE);
    });

    it('drops extra parameters from the mime type', () => {
      expect(dataUrlToFile('data:audio/webm;codecs=opus;base64,GkXf')).toEqual({ data: 'GkXf', mime: 'audio/webm' });
    });

    it('encodes a data URL without ;base64 as base64', () => {
      expect(dataUrlToFile('data:text/plain,hello%20world')).toEqual(FILE);
    });

    it('takes a value without the data: scheme as bare base64', () => {
      expect(dataUrlToFile('AAEC')).toEqual({ data: 'AAEC', mime: 'application/octet-stream' });
    });

    it('reads an empty value as no file', () => {
      expect(dataUrlToFile('')).toBeNull();
      expect(dataUrlToFile(null)).toBeNull();
    });
  });

  describe('a record field with base-type file', () => {
    it('is stored as a data URL and goes back out as { data, mime }', () => {
      const stored = recordFromQtiVariableJSON([{ name: 'recording', base: { file: FILE } }]);
      expect(stored).toEqual({ recording: DATA_URL });
      expect(recordResponseToQtiVariableJSON(stored, { recording: 'file' as never })).toEqual({
        record: [{ name: 'recording', base: { file: FILE } }]
      });
    });
  });
});
