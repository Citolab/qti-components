export type QtiAreaMapping = {
  defaultValue: number;
  lowerBound?: number;
  upperBound?: number;
  areaMapEntries: QtiAreaMapEntry[];
};

export type QtiAreaMapEntry = {
  shape: areaShape;
  coords: string;
  mappedValue: number;
  defaultValue: number;
};

export type areaShape = 'default' | 'circle' | 'rect' | 'ellipse' | 'poly';
