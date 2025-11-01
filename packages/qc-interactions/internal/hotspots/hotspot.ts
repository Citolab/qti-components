export function positionShapes(shape: string, coordsNumber: number[], img: HTMLImageElement, hotspot: HTMLElement) {
  // Determine the reference width and height based on the attributes or natural dimensions
  const imgWidth = img.getAttribute('width') ? parseFloat(img.getAttribute('width')!) : img.naturalWidth;
  const imgHeight = img.getAttribute('height') ? parseFloat(img.getAttribute('height')!) : img.naturalHeight;

  switch (shape) {
    case 'circle':
      {
        if (coordsNumber.length !== 3) {
          console.error('Invalid circle coordinates:', coordsNumber);
          return;
        }
        const [centerX, centerY, radius] = coordsNumber;

        // Calculate percentages for center and radius
        const centerXPer = (centerX / imgWidth) * 100;
        const centerYPer = (centerY / imgHeight) * 100;
        const radiusXPer = (radius / imgWidth) * 100; // Relative to width
        const radiusYPer = (radius / imgHeight) * 100; // Relative to height

        // Position the hotspot so its center aligns with the circle center
        hotspot.style.left = centerXPer - radiusXPer + '%';
        hotspot.style.top = centerYPer - radiusYPer + '%';
        hotspot.style.width = 2 * radiusXPer + '%';
        hotspot.style.height = 2 * radiusYPer + '%';
        hotspot.style.borderRadius = `50%`; // Create a circular shape
      }
      break;

    case 'rect':
      {
        if (coordsNumber.length !== 4) {
          console.error('Invalid rectangle coordinates:', coordsNumber);
          return;
        }
        const [leftX, topY, rightX, bottomY] = coordsNumber;
        const leftXPer = (leftX / imgWidth) * 100;
        const topYPer = (topY / imgHeight) * 100;
        const rightXPer = (rightX / imgWidth) * 100;
        const bottomYPer = (bottomY / imgHeight) * 100;
        hotspot.style.left = leftXPer + '%';
        hotspot.style.top = topYPer + '%';
        hotspot.style.width = rightXPer - leftXPer + '%';
        hotspot.style.height = bottomYPer - topYPer + '%';
      }
      break;
    case 'ellipse':
      {
        if (coordsNumber.length !== 4) {
          console.error('Invalid ellipse coordinates:', coordsNumber);
          return;
        }
        const [centerX, centerY, radiusX, radiusY] = coordsNumber;

        // Calculate center position as percentages
        const centerXPer = (centerX / imgWidth) * 100;
        const centerYPer = (centerY / imgHeight) * 100;

        // Calculate radii as percentages (relative to their respective dimensions)
        const radiusXPer = (radiusX / imgWidth) * 100;
        const radiusYPer = (radiusY / imgHeight) * 100;

        // Position the hotspot so its center aligns with the ellipse center
        hotspot.style.left = centerXPer - radiusXPer + '%';
        hotspot.style.top = centerYPer - radiusYPer + '%';
        hotspot.style.width = 2 * radiusXPer + '%';
        hotspot.style.height = 2 * radiusYPer + '%';
        hotspot.style.borderRadius = `50%`; // Create an elliptical shape
      }
      break;
    case 'poly':
      {
        if (coordsNumber.length < 6 || coordsNumber.length % 2 !== 0) {
          console.error('Invalid polygon coordinates:', coordsNumber);
          return;
        }
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
        const leftXPer = (leftX / imgWidth) * 100;
        const topYPer = (topY / imgHeight) * 100;
        const rightXPer = (rightX / imgWidth) * 100;
        const bottomYPer = (bottomY / imgHeight) * 100;

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
