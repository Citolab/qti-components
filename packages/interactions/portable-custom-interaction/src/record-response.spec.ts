import { recordFromQtiVariableJSON, recordResponseToQtiVariableJSON, recordToQtiVariableJSON } from './record-response';

describe('record responses between the item and a PCI', () => {
  describe('Appendix C record -> stored field map', () => {
    it('turns each field into its QTI string literal', () => {
      expect(
        recordFromQtiVariableJSON([
          { name: 'time', base: { float: 4.12 } },
          { name: 'point', base: { point: [455, 250] } }
        ])
      ).toEqual({ time: '4.12', point: '455 250' });
    });

    it('keeps other base types and list fields', () => {
      expect(
        recordFromQtiVariableJSON([
          { name: 'count', base: { integer: 3 } },
          { name: 'done', base: { boolean: true } },
          { name: 'label', base: { string: 'a b c' } },
          { name: 'pair', base: { directedPair: ['A', 'B'] } },
          { name: 'choices', list: { identifier: ['A', 'C'] } },
          {
            name: 'points',
            list: {
              point: [
                [1, 2],
                [3, 4]
              ]
            }
          }
        ])
      ).toEqual({
        count: '3',
        done: 'true',
        label: 'a b c',
        pair: 'A B',
        choices: ['A', 'C'],
        points: ['1 2', '3 4']
      });
    });

    it('keeps a NULL field as null and skips entries without a name', () => {
      expect(
        recordFromQtiVariableJSON([
          { name: 'time', base: null },
          { name: '', base: { float: 1 } }
        ])
      ).toEqual({ time: null });
    });
  });

  describe('stored field map -> Appendix C record', () => {
    it('uses the declared field base types', () => {
      expect(
        recordResponseToQtiVariableJSON({ time: '4.0', point: '460 245' }, { time: 'float', point: 'point' })
      ).toEqual({
        record: [
          { name: 'time', base: { float: 4 } },
          { name: 'point', base: { point: [460, 245] } }
        ]
      });
    });

    it('infers float, point and string when nothing is declared', () => {
      expect(recordResponseToQtiVariableJSON({ time: '4.12', point: '455 250', note: 'late' })).toEqual({
        record: [
          { name: 'time', base: { float: 4.12 } },
          { name: 'point', base: { point: [455, 250] } },
          { name: 'note', base: { string: 'late' } }
        ]
      });
    });

    it('lets a declared string win over inference', () => {
      expect(recordResponseToQtiVariableJSON({ code: '42' }, { code: 'string' })).toEqual({
        record: [{ name: 'code', base: { string: '42' } }]
      });
    });

    it('sends an empty record for no response', () => {
      expect(recordResponseToQtiVariableJSON(null)).toEqual({ record: [] });
    });

    it('round-trips what a PCI sends', () => {
      const fromPci = {
        record: [
          { name: 'time', base: { float: 4.12 } },
          { name: 'point', base: { point: [455, 250] as [number, number] } }
        ]
      };
      const stored = recordFromQtiVariableJSON(fromPci.record);
      expect(recordResponseToQtiVariableJSON(stored, { time: 'float', point: 'point' })).toEqual(fromPci);
    });
  });

  describe('typed values without declared field types (QTI_CONTEXT)', () => {
    it('types fields by their JS value and leaves strings alone', () => {
      expect(recordToQtiVariableJSON({ candidateIdentifier: '123', attempt: 2, scale: 1.5 })).toEqual({
        record: [
          { name: 'candidateIdentifier', base: { string: '123' } },
          { name: 'attempt', base: { integer: 2 } },
          { name: 'scale', base: { float: 1.5 } }
        ]
      });
    });
  });
});
