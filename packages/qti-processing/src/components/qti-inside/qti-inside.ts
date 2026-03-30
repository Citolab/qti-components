import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

type Point = { x: number; y: number };

export class QtiInside extends QtiExpression<boolean | null> {
  @property({ type: String }) shape = '';

  @property({ type: String }) coords = '';

  public override getResult(): boolean | null {
    const variables = this.getVariables() as ResponseVariable[];

    if (variables.length !== 1) {
      console.error('qti-inside requires exactly one point expression');
      return null;
    }

    const variable = variables[0];
    if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
      console.error('qti-inside requires single cardinality');
      return null;
    }
    if (variable.value === null || variable.value === undefined) {
      return null;
    }
    if (!this.shape || !this.coords) {
      console.error('qti-inside requires shape and coords attributes');
      return null;
    }

    const point = this.#parsePoint(variable.value.toString());
    const coords = this.#parseCoords(this.coords);

    if (!point || coords.length === 0) {
      return null;
    }

    switch (this.shape.toLowerCase()) {
      case 'circle':
        return this.#isInsideCircle(point, coords);
      case 'rect':
        return this.#isInsideRect(point, coords);
      case 'ellipse':
        return this.#isInsideEllipse(point, coords);
      case 'poly':
      case 'polygon':
        return this.#isInsidePolygon(point, coords);
      default:
        console.error(`qti-inside does not support shape "${this.shape}"`);
        return null;
    }
  }

  #parsePoint(value: string): Point | null {
    const tokens = value
      .split(/[,\s]+/)
      .map(token => token.trim())
      .filter(Boolean);

    if (tokens.length !== 2) {
      console.error('qti-inside requires a point value formatted as "x y" or "x,y"');
      return null;
    }

    const x = Number.parseFloat(tokens[0]);
    const y = Number.parseFloat(tokens[1]);

    if (Number.isNaN(x) || Number.isNaN(y)) {
      console.error('qti-inside requires numeric point coordinates');
      return null;
    }

    return { x, y };
  }

  #parseCoords(value: string): number[] {
    const coords = value
      .split(',')
      .map(token => token.trim())
      .filter(Boolean)
      .map(token => Number.parseFloat(token));

    if (coords.some(coord => Number.isNaN(coord))) {
      console.error('qti-inside requires numeric coords');
      return [];
    }

    return coords;
  }

  #isInsideCircle(point: Point, coords: number[]): boolean | null {
    if (coords.length !== 3) {
      console.error('qti-inside circle requires x,y,r');
      return null;
    }

    const [centerX, centerY, radius] = coords;
    return (point.x - centerX) ** 2 + (point.y - centerY) ** 2 <= radius ** 2;
  }

  #isInsideRect(point: Point, coords: number[]): boolean | null {
    if (coords.length !== 4) {
      console.error('qti-inside rect requires left,top,right,bottom');
      return null;
    }

    const [x1, y1, x2, y2] = coords;
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);

    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
  }

  #isInsideEllipse(point: Point, coords: number[]): boolean | null {
    if (coords.length !== 4) {
      console.error('qti-inside ellipse requires centerX,centerY,radiusX,radiusY');
      return null;
    }

    const [centerX, centerY, radiusX, radiusY] = coords;
    if (radiusX === 0 || radiusY === 0) {
      return false;
    }

    return ((point.x - centerX) ** 2) / (radiusX ** 2) + ((point.y - centerY) ** 2) / (radiusY ** 2) <= 1;
  }

  #isInsidePolygon(point: Point, coords: number[]): boolean | null {
    if (coords.length < 6 || coords.length % 2 !== 0) {
      console.error('qti-inside polygon requires at least 3 coordinate pairs');
      return null;
    }

    let inside = false;

    for (let current = 0, previous = coords.length - 2; current < coords.length; current += 2) {
      const xi = coords[current];
      const yi = coords[current + 1];
      const xj = coords[previous];
      const yj = coords[previous + 1];

      const intersects =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || Number.EPSILON) + xi;

      if (intersects) {
        inside = !inside;
      }

      previous = current;
    }

    return inside;
  }
}

customElements.define('qti-inside', QtiInside);
