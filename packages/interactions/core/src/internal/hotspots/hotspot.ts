/** The graphic an image-based interaction draws its hotspots on. */
export type Graphic = HTMLImageElement | HTMLObjectElement;

/** A coordinate space, in the graphic's own pixels — what `coords` are expressed in. */
type Size = { width: number; height: number };

/**
 * Find the graphic inside an image-based interaction.
 *
 * QTI 3 carries it as `<object type="image/*" data="…">` — that is what the spec's own graphic
 * interaction examples use. An item that has been through a converter usually carries the same
 * graphic as a plain `<img>`. Both are valid input, so accept either rather than assuming the
 * converted form: looking only for `img` left every hotspot unpositioned on a spec-form item.
 */
export function findGraphic(root: ParentNode): Graphic | null {
  return root.querySelector<Graphic>('img, object[type^="image"]');
}

/**
 * A width/height attribute as a pixel length, or null if it does not give one.
 *
 * QTI's LengthDType is `[0-9]+%?`, so `width="50%"` is valid markup. A percentage is a layout
 * instruction, not a coordinate space: it says how wide the graphic sits in its container and
 * nothing about what the `coords` were authored against. `parseFloat` would read it as 50px and
 * squash every hotspot into the top-left corner, so a percentage falls through to the intrinsic
 * size instead.
 */
function attributeLength(graphic: Graphic, name: 'width' | 'height'): number | null {
  const raw = graphic.getAttribute(name)?.trim();
  if (!raw || raw.endsWith('%')) return null;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/*
 * `<object>` exposes no intrinsic size of its own — no `naturalWidth`, and its box is the
 * replaced-element default rather than the bitmap. The size is probed by loading the same URL
 * through an `Image`, cached per element because every hotspot in an interaction asks for the
 * same graphic.
 */
const probedSizes = new WeakMap<HTMLObjectElement, Size>();
const probes = new WeakMap<HTMLObjectElement, Promise<Size | null>>();

function probeObject(object: HTMLObjectElement): Promise<Size | null> {
  let probe = probes.get(object);
  if (!probe) {
    probe = new Promise<Size | null>(resolve => {
      // `.data` is the reflected URL property, already resolved against the document base.
      const url = object.data;
      if (!url) {
        resolve(null);
        return;
      }
      const image = new Image();
      image.onload = () => {
        const size = { width: image.naturalWidth, height: image.naturalHeight };
        if (!(size.width > 0) || !(size.height > 0)) {
          resolve(null);
          return;
        }
        probedSizes.set(object, size);
        resolve(size);
      };
      image.onerror = () => resolve(null);
      image.src = url;
    });
    probes.set(object, probe);
  }
  return probe;
}

function intrinsicSize(graphic: Graphic): Size | null {
  if (graphic.localName === 'object') {
    return probedSizes.get(graphic as HTMLObjectElement) ?? null;
  }
  const image = graphic as HTMLImageElement;
  return image.naturalWidth > 0 && image.naturalHeight > 0
    ? { width: image.naturalWidth, height: image.naturalHeight }
    : null;
}

/**
 * The coordinate space the `coords` are expressed in, or null while it is still unknown.
 *
 * The width/height attributes come first, as they did before: `coords` are authored against the
 * size the item declares, not against however the graphic is being laid out. They are *optional*
 * on the QTI `<object>` though — only `data` and `type` are required — so an item that declares
 * neither is valid and has to fall back to the bitmap's own size.
 */
function graphicSize(graphic: Graphic): Size | null {
  const width = attributeLength(graphic, 'width');
  const height = attributeLength(graphic, 'height');
  if (width !== null && height !== null) return { width, height };

  const intrinsic = intrinsicSize(graphic);
  if (!intrinsic) return null;
  return { width: width ?? intrinsic.width, height: height ?? intrinsic.height };
}

/** Resolve the coordinate space, waiting on the bitmap when that is the only source. */
function whenGraphicSized(graphic: Graphic): Promise<Size | null> {
  const known = graphicSize(graphic);
  if (known) return Promise.resolve(known);

  if (graphic.localName === 'object') {
    return probeObject(graphic as HTMLObjectElement).then(() => graphicSize(graphic));
  }

  const image = graphic as HTMLImageElement;
  // Already settled with nothing usable — a failed or missing src. No event is coming.
  if (image.complete) return Promise.resolve(null);
  return new Promise(resolve => {
    const settle = () => {
      image.removeEventListener('load', settle);
      image.removeEventListener('error', settle);
      resolve(graphicSize(graphic));
    };
    image.addEventListener('load', settle);
    image.addEventListener('error', settle);
  });
}

export function positionShapes(shape: string, coordsNumber: number[], img: Graphic, hotspot: HTMLElement) {
  const size = graphicSize(img);
  if (size) {
    applyShape(shape, coordsNumber, size, hotspot);
    return;
  }

  /*
   * No coordinate space yet — an `<object>` with no width/height, or an `<img>` that has not
   * decoded. Both are resolvable, so wait for the bitmap and position then rather than dropping
   * the hotspot: every percentage below would be NaN, the style setters drop those silently, and
   * the hotspot would keep the theme's 100%x100% and stack unpositioned on top of the graphic.
   */
  void whenGraphicSized(img).then(resolved => {
    if (!resolved) {
      console.error('Cannot position hotspots: the graphic has no usable width/height.', img);
      return;
    }
    applyShape(shape, coordsNumber, resolved, hotspot);
  });
}

function applyShape(
  shape: string,
  coordsNumber: number[],
  { width: imgWidth, height: imgHeight }: Size,
  hotspot: HTMLElement
) {
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
