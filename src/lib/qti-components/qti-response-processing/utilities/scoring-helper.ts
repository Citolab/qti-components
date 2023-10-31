import { BaseType } from '../..';

export class ScoringHelper {
  public static compareSingleValues(value1: Readonly<string>, value2: Readonly<string>, baseType: BaseType): boolean {
    switch (baseType) {
      case 'identifier':
      case 'string':
        return value1 === value2;
      case 'integer': {
        const int1 = parseInt(value1, 10);
        const int2 = parseInt(value2, 10);
        if (!isNaN(int1) && !isNaN(int2)) {
          return int1 === int2;
        } else {
          console.error(`Cannot convert ${value1} and/or ${value2} to int.`);
        }
        break;
      }
      case 'float': {
        const float1 = parseFloat(value1);
        const float2 = parseFloat(value2);
        if (!isNaN(float1) && !isNaN(float2)) {
          return float1 === float2;
        } else {
          console.error(`couldn't convert ${value1} and/or ${value2} to float.`);
        }
        break;
      }
      case 'pair':
      case 'directedPair': {
        const pair1 = value1.split(' ').sort();
        const pair2 = value2.split(' ').sort();
        if (pair1.length === 2 && pair2.length === 2) {
          if (baseType === 'pair') {
            pair1.sort();
            pair2.sort();
          }
          return pair1.join(' ') === pair2.join(' ');
        } else {
          console.error(`compared two pair but one of the values does not have 2 values: 1: ${value1} 2: ${value2}`);
        }
        break;
      }
    }

    return false;
  }
}
