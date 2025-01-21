import type { QtiHotspotChoice } from '../../qti-hotspot-choice';

export function positionHotspots(
  shape: string,
  coordsNumber: number[],
  img: HTMLImageElement,
  hotspot: QtiHotspotChoice
) {
  switch (shape) {
    case 'circle':
      {
        const [centerX, centerY, radius] = coordsNumber;
        const centerXPer = (centerX / img.width) * 100;
        const centerYPer = (centerY / img.height) * 100;
        const radiusPer = (radius / img.width) * 100;
        hotspot.style.left = centerXPer - radiusPer + '%';
        hotspot.style.top = centerYPer - radiusPer + '%';
        hotspot.style.width = hotspot.style.height = 4 * radiusPer + 'px';
        hotspot.style.borderRadius = `9999px`;
      }
      break;

    case 'rect':
      {
        const [leftX, topY, rightX, bottomY] = coordsNumber;
        const leftXPer = (leftX / img.width) * 100;
        const topYPer = (topY / img.height) * 100;
        const rightXPer = (rightX / img.width) * 100;
        const bottomYPer = (bottomY / img.height) * 100;
        hotspot.style.left = leftXPer + '%';
        hotspot.style.top = topYPer + '%';
        hotspot.style.width = rightXPer - leftXPer + '%';
        hotspot.style.height = bottomYPer - topYPer + '%';
      }
      break;
    case 'ellipse':
      {
        const [centerX, centerY, radiusX, radiusY] = coordsNumber;
        const centerXPer = (centerX / img.width) * 100;
        const centerYPer = (centerY / img.height) * 100;
        const radiusXPer = (radiusX / img.width) * 100;
        const radiusYPer = (radiusY / img.height) * 100;

        hotspot.style.left = centerXPer - radiusXPer + '%';
        hotspot.style.top = centerYPer - radiusYPer + '%';
        hotspot.style.width = 2 * radiusXPer + '%';
        hotspot.style.height = 2 * radiusYPer + '%';
        hotspot.style.borderRadius = `50%`; // Create an elliptical shape
      }
      break;
    case 'poly':
      {
        // Convert coordsNumber to an array of {x, y}
        const polycoords = [];
        for (let i = 0; i < coordsNumber.length; i += 2) {
          polycoords.push({ x: coordsNumber[i], y: coordsNumber[i + 1] });
        }

        // Calculate the bounding box
        const leftX = Math.min(...polycoords.map(point => point.x));
        const rightX = Math.max(...polycoords.map(point => point.x));
        const topY = Math.min(...polycoords.map(point => point.y));
        const bottomY = Math.max(...polycoords.map(point => point.y));

        // Set the hotspot position and size in percentages
        const leftXPer = (leftX / img.width) * 100;
        const topYPer = (topY / img.height) * 100;
        const rightXPer = (rightX / img.width) * 100;
        const bottomYPer = (bottomY / img.height) * 100;

        hotspot.style.left = leftXPer + '%';
        hotspot.style.top = topYPer + '%';
        hotspot.style.width = rightXPer - leftXPer + '%';
        hotspot.style.height = bottomYPer - topYPer + '%';

        // Calculate the clip path based on the bounding box
        const polygonData = polycoords.map(point => ({
          x: ((point.x - leftX) / (rightX - leftX)) * 100,
          y: ((point.y - topY) / (bottomY - topY)) * 100
        }));

        const polyD = polygonData.map(p => `${p.x}% ${p.y}%`).join(',');
        hotspot.style.clipPath = `polygon(${polyD})`;
      }
      break;

    default:
      console.error(`Unsupported shape: ${shape}`);
      break;
  }
}
