import type { BaseType } from '../../../exports/expression-result';

export class ScoringHelper {
  /**
   * Checks if a given point is within a specified area.
   * @param point The point to test, represented as a string "x y" (e.g., "102 113").
   * @param areaKey The area definition, including shape and coordinates (e.g., "circle,102,113,16").
   * @param baseType The base type of the response, must be "point" for this method to proceed.
   * @returns True if the point is within the area; false otherwise.
   */
  public static isPointInArea(point: string, areaKey: string, baseType: string): boolean {
    if (baseType !== 'point') {
      console.warn(`Base type ${baseType} is not supported for point area mapping.`);
      return false;
    }

    // Parse the point as x and y coordinates
    const [px, py] = point.split(' ').map(Number);

    // Parse the area definition
    const [shape, ...coords] = areaKey.split(',');
    const coordinates = coords.map(Number);

    switch (shape.toLowerCase()) {
      case 'circle':
      case 'default': {
        const [cx, cy, radius] = coordinates;
        if (coordinates.length !== 3) {
          console.warn(`Invalid circle definition: ${areaKey}`);
          return false;
        }
        const distance = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        return distance <= radius;
      }

      case 'rect': {
        const [x1, y1, x2, y2] = coordinates;
        if (coordinates.length !== 4) {
          console.warn(`Invalid rectangle definition: ${areaKey}`);
          return false;
        }
        return px >= x1 && px <= x2 && py >= y1 && py <= y2;
      }

      case 'ellipse': {
        const [cx, cy, rx, ry] = coordinates;
        if (coordinates.length !== 4) {
          console.warn(`Invalid ellipse definition: ${areaKey}`);
          return false;
        }
        // Ellipse equation: ((px - cx)² / rx²) + ((py - cy)² / ry²) <= 1
        const normalizedX = (px - cx) ** 2 / rx ** 2;
        const normalizedY = (py - cy) ** 2 / ry ** 2;
        return normalizedX + normalizedY <= 1;
      }

      case 'poly': {
        if (coordinates.length < 6 || coordinates.length % 2 !== 0) {
          console.warn(`Invalid polygon definition: ${areaKey}`);
          return false;
        }
        const vertices = [];
        for (let i = 0; i < coordinates.length; i += 2) {
          vertices.push({ x: coordinates[i], y: coordinates[i + 1] });
        }
        return this.isPointInPolygon({ x: px, y: py }, vertices);
      }

      default:
        console.warn(`Unsupported shape type: ${shape}`);
        return false;
    }
  }

  /**
   * Checks if a point is inside a polygon using the ray-casting algorithm.
   * @param point The point to test.
   * @param vertices The vertices of the polygon in order (array of {x, y} objects).
   * @returns True if the point is inside the polygon; false otherwise.
   */
  static isPointInPolygon(point: { x: number; y: number }, vertices: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x,
        yi = vertices[i].y;
      const xj = vertices[j].x,
        yj = vertices[j].y;

      const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  }

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
