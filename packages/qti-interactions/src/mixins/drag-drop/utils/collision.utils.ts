/**
 * Collision detection algorithms for drag and drop interactions
 * Based on dnd-kit collision detection strategies
 */

export type CollisionDetectionAlgorithm = 'pointerWithin' | 'rectangleIntersection' | 'closestCenter' | 'closestCorners';

export interface CollisionDetectionOptions {
  algorithm: CollisionDetectionAlgorithm;
}

export interface CollisionDetectionStrategy {
  (dropzones: HTMLElement[], clientX: number, clientY: number, dragElement?: HTMLElement | null): HTMLElement | null;
}

/**
 * Pointer Within Algorithm
 * Only registers collision when the pointer is contained within the bounding rectangle
 * of the droppable container. Best for high-precision interfaces.
 */
export function pointerWithinCollision(
  dropzones: HTMLElement[],
  clientX: number,
  clientY: number
): HTMLElement | null {
  const activeZones = dropzones.filter(zone => !zone.hasAttribute('disabled'));

  for (const zone of activeZones) {
    const rect = zone.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
      return zone;
    }
  }

  return null;
}

/**
 * Rectangle Intersection Algorithm
 * Ensures there is no gap between any of the 4 sides of the rectangles.
 * A draggable is considered over a droppable only when their bounding boxes physically intersect.
 */
export function rectangleIntersectionCollision(
  dropzones: HTMLElement[],
  _clientX: number,
  _clientY: number,
  dragElement?: HTMLElement | null
): HTMLElement | null {
  if (!dragElement) return null;

  const activeZones = dropzones.filter(zone => !zone.hasAttribute('disabled'));
  const dragRect = dragElement.getBoundingClientRect();

  for (const zone of activeZones) {
    const dropRect = zone.getBoundingClientRect();

    // Check if rectangles intersect
    const intersects = !(
      dragRect.right < dropRect.left ||
      dragRect.left > dropRect.right ||
      dragRect.bottom < dropRect.top ||
      dragRect.top > dropRect.bottom
    );

    if (intersects) {
      return zone;
    }
  }

  return null;
}

/**
 * Closest Center Algorithm
 * Identifies the droppable container whose center is closest to the center
 * of the bounding rectangle of the active draggable item.
 * Recommended for sortable lists.
 */
export function closestCenterCollision(
  dropzones: HTMLElement[],
  clientX: number,
  clientY: number,
  dragElement?: HTMLElement | null
): HTMLElement | null {
  const activeZones = dropzones.filter(zone => !zone.hasAttribute('disabled'));
  if (activeZones.length === 0) return null;

  // Calculate drag center (use pointer or element center)
  let dragCenterX: number;
  let dragCenterY: number;

  if (dragElement) {
    const dragRect = dragElement.getBoundingClientRect();
    dragCenterX = dragRect.left + dragRect.width / 2;
    dragCenterY = dragRect.top + dragRect.height / 2;
  } else {
    dragCenterX = clientX;
    dragCenterY = clientY;
  }

  let closestZone: HTMLElement | null = null;
  let minDistance = Infinity;

  for (const zone of activeZones) {
    const rect = zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(dragCenterX - centerX, 2) + Math.pow(dragCenterY - centerY, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestZone = zone;
    }
  }

  return closestZone;
}

/**
 * Closest Corners Algorithm
 * Measures the distance between all four corners of the active draggable item
 * and the four corners of each droppable container.
 * Preferred for Kanban boards and interfaces with stacked droppable containers.
 *
 * Uses average corner distance rather than minimum to reduce flickering.
 */
export function closestCornersCollision(
  dropzones: HTMLElement[],
  clientX: number,
  clientY: number,
  dragElement?: HTMLElement | null
): HTMLElement | null {
  const activeZones = dropzones.filter(zone => !zone.hasAttribute('disabled'));
  if (activeZones.length === 0) return null;

  // Get drag corners (use pointer or element corners)
  let dragCorners: { x: number; y: number }[];

  if (dragElement) {
    const dragRect = dragElement.getBoundingClientRect();
    dragCorners = [
      { x: dragRect.left, y: dragRect.top },
      { x: dragRect.right, y: dragRect.top },
      { x: dragRect.left, y: dragRect.bottom },
      { x: dragRect.right, y: dragRect.bottom }
    ];
  } else {
    // If no drag element, use pointer as all corners
    dragCorners = [
      { x: clientX, y: clientY },
      { x: clientX, y: clientY },
      { x: clientX, y: clientY },
      { x: clientX, y: clientY }
    ];
  }

  let closestZone: HTMLElement | null = null;
  let minAverageDistance = Infinity;

  for (const zone of activeZones) {
    const rect = zone.getBoundingClientRect();
    const dropCorners = [
      { x: rect.left, y: rect.top },
      { x: rect.right, y: rect.top },
      { x: rect.left, y: rect.bottom },
      { x: rect.right, y: rect.bottom }
    ];

    // Calculate average distance between all corner pairs
    let totalDistance = 0;
    let pairCount = 0;

    for (const dragCorner of dragCorners) {
      for (const dropCorner of dropCorners) {
        const distance = Math.sqrt(
          Math.pow(dragCorner.x - dropCorner.x, 2) + Math.pow(dragCorner.y - dropCorner.y, 2)
        );
        totalDistance += distance;
        pairCount++;
      }
    }

    const averageDistance = totalDistance / pairCount;

    // Use average distance to reduce sensitivity and flickering
    if (averageDistance < minAverageDistance) {
      minAverageDistance = averageDistance;
      closestZone = zone;
    }
  }

  return closestZone;
}

/**
 * Get the collision detection strategy based on the algorithm name
 */
export function getCollisionDetectionStrategy(algorithm: CollisionDetectionAlgorithm): CollisionDetectionStrategy {
  switch (algorithm) {
    case 'pointerWithin':
      return pointerWithinCollision;
    case 'rectangleIntersection':
      return rectangleIntersectionCollision;
    case 'closestCenter':
      return closestCenterCollision;
    case 'closestCorners':
      return closestCornersCollision;
    default:
      console.warn(`Unknown collision detection algorithm: ${algorithm}, falling back to pointerWithin`);
      return pointerWithinCollision;
  }
}

/**
 * Main collision detection function that delegates to the appropriate strategy
 */
export function detectCollision(
  dropzones: HTMLElement[],
  clientX: number,
  clientY: number,
  dragElement?: HTMLElement | null,
  algorithm: CollisionDetectionAlgorithm = 'pointerWithin'
): HTMLElement | null {
  const strategy = getCollisionDetectionStrategy(algorithm);
  return strategy(dropzones, clientX, clientY, dragElement);
}
