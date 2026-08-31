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

        /*
         * Publish the polygon outline as SVG-stroke masks, so a theme can draw a ring round a poly
         * hotspot the way it draws a border round a circle. A `clip-path` box has no border-box
         * edge for a CSS `border` to paint on, so this is the only way to outline a polygon.
         *
         * Geometry only — the mask carries the shape, the theme's `background-color` carries the
         * colour, so selection/light-dark/correction theming all stay in CSS (see
         * qti-hotspot-interaction.css). Two widths, so a theme can swap thin↔bold between resting
         * and selected without JS.
         *
         * `viewBox 0 0 100 100` + `preserveAspectRatio=none` stretches to the element; the points
         * are the same percentages as the clip-path. `vector-effect=non-scaling-stroke` keeps the
         * stroke a uniform screen width through any (even non-uniform) resize — verified.
         *
         * The theme keeps clip-path ON for hit-testing and layers the mask over it, so the stroke's
         * outer half is clipped and a clean inner-edge ring remains — matching the inner edge a
         * border-box border draws on the box shapes. Hence the widths here are doubled: the visible
         * (inner) half is ~2px / ~4px.
         */
        const svgPoints = polygonData.map(p => `${p.x},${p.y}`).join(' ');
        const outline = (strokeWidth: number): string =>
          `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
              `<polygon points='${svgPoints}' fill='none' stroke='black' stroke-width='${strokeWidth}' ` +
              `vector-effect='non-scaling-stroke' stroke-linejoin='round'/></svg>`
          )}")`;
        hotspot.style.setProperty('--qti-shape-outline', outline(4));
        hotspot.style.setProperty('--qti-shape-outline-bold', outline(8));
      }
      break;

    default:
      console.error(`Unsupported shape: ${shape}`);
      break;
  }
}
