export type QtiMapping = {
  defaultValue: number;
  lowerBound?: number;
  upperBound?: number;
  mapEntries: QtiMapEntry[];
};

export type QtiMapEntry = { mapKey: string; mappedValue: number; caseSensitive: boolean };
