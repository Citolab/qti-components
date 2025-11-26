# Collision Detection Algorithms

The drag-drop system now supports multiple collision detection algorithms based on [dnd-kit's collision detection strategies](https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms).

## Available Algorithms

### 1. Pointer Within (Default)
- **Algorithm**: `'pointerWithin'`
- **Behavior**: Only registers collision when the pointer is contained within the bounding rectangle of the droppable
- **Best For**: High-precision interfaces where you want strict pointer-based detection
- **Use Case**: Most standard drag-and-drop interactions

### 2. Rectangle Intersection
- **Algorithm**: `'rectangleIntersection'`
- **Behavior**: Ensures there is no gap between any of the 4 sides of the rectangles. A draggable is considered over a droppable only when their bounding boxes physically intersect.
- **Best For**: Standard drag-and-drop scenarios where you want contact-based detection
- **Use Case**: When you want the draggable element itself (not just the pointer) to visibly overlap the droppable

### 3. Closest Center
- **Algorithm**: `'closestCenter'`
- **Behavior**: Identifies the droppable container whose center is closest to the center of the draggable item
- **Best For**: Sortable lists where you want more forgiving detection
- **Use Case**: Recommended for sortable lists and reordering interfaces
- **Note**: May select underlying dropzones in stacked layouts

### 4. Closest Corners
- **Algorithm**: `'closestCorners'`
- **Behavior**: Measures the distance between all four corners of the draggable and the four corners of each droppable
- **Best For**: Kanban boards and interfaces with stacked droppable containers
- **Use Case**: When you have layered layouts and want more intuitive corner-based detection

## Usage

### Configuring Per-Instance (Recommended)

You can specify the collision detection algorithm when instantiating a mixin for each interaction type:

```typescript
import { DragDropSlottedMixin } from './mixins/drag-drop/drag-drop-slotted.mixin';
import { DragDropSortableMixin } from './mixins/drag-drop/drag-drop-sortable.mixin';
import type { CollisionDetectionAlgorithm } from './mixins/drag-drop/utils/drag-drop.utils';

// Associate interaction with closest corners (default)
const AssociateMixin = DragDropSlottedMixin(
  superClass,
  '.draggable',
  '.droppable',
  'slot[part="drags"]',
  'closestCorners' // collision algorithm
);

// Or use pointer within for more precise targeting
const PreciseAssociateMixin = DragDropSlottedMixin(
  superClass,
  '.draggable',
  '.droppable',
  'slot[part="drags"]',
  'pointerWithin' // more precise
);

// Sortable interaction with closest center (default)
const SortableMixin = DragDropSortableMixin(
  superClass,
  '.sortable-item',
  'slot[part="drags"]',
  defaultSortingStrategy,
  'closestCenter' // collision algorithm
);

// Or use closest corners for more spatial awareness
const SpatialSortableMixin = DragDropSortableMixin(
  superClass,
  '.sortable-item',
  'slot[part="drags"]',
  defaultSortingStrategy,
  'closestCorners'
);
```

### Configuring with Core Mixin Directly

You can also specify the algorithm when using the core mixin directly:

```typescript
import { DragDropCoreMixin } from './mixins/drag-drop/drag-drop-core.mixin';

// Use pointer within
const CoreMixin = DragDropCoreMixin(
  superClass,
  '.draggable',
  '.droppable',
  'slot[part="drags"]',
  'pointerWithin' // collision algorithm
);

// Use closest corners for Kanban-style boards
const KanbanCore = DragDropCoreMixin(
  superClass,
  '.card',
  '.column',
  'slot[part="drags"]',
  'closestCorners'
);
```

### Changing Algorithm at Runtime

The collision detection algorithm can be changed at runtime by setting the `collisionDetectionAlgorithm` property:

```typescript
class MyInteraction extends DragDropCoreMixin(...) {
  connectedCallback() {
    super.connectedCallback();

    // Change algorithm based on interaction type or user preference
    if (this.dataset.layout === 'kanban') {
      this.collisionDetectionAlgorithm = 'closestCorners';
    } else if (this.dataset.layout === 'sortable') {
      this.collisionDetectionAlgorithm = 'closestCenter';
    }
  }
}
```

### Using Collision Detection Directly

You can also use the collision detection functions directly:

```typescript
import {
  detectCollision,
  pointerWithinCollision,
  rectangleIntersectionCollision,
  closestCenterCollision,
  closestCornersCollision
} from './utils/drag-drop.utils';

// Use the generic function with algorithm parameter
const dropTarget = detectCollision(
  dropzones,
  clientX,
  clientY,
  dragElement,
  'closestCenter'
);

// Or use a specific algorithm function directly
const dropTarget = closestCenterCollision(
  dropzones,
  clientX,
  clientY,
  dragElement
);
```

## Recommended Algorithms by Interaction Type

| Interaction Type | Recommended Algorithm | Reason |
|-----------------|----------------------|---------|
| Associate Interaction (Slotted) | `closestCorners` | Better handling of multiple drop zones and spatial positioning |
| Order Interaction (Sortable) | `closestCenter` | More forgiving for reordering lists |
| Graphic Associate | `rectangleIntersection` | Visual overlap important for spatial positioning |
| Kanban/Multi-column | `closestCorners` | Better handling of stacked containers |

## Examples

### Slotted Mixin (Associate Interactions)
```typescript
// Uses closest corners for better multiple drop zone handling
const Core = DragDropCoreMixin(
  superClass,
  draggablesSelector,
  droppablesSelector,
  dragContainersSelector,
  'closestCorners'
);
```

### Sortable Mixin (Order Interactions)
```typescript
// Uses closest center for smoother reordering
const Core = DragDropCoreMixin(
  superClass,
  draggablesSelector,
  draggablesSelector, // draggables are also droppables
  dragContainersSelector,
  'closestCenter'
);
```

## Implementation Details

All collision detection algorithms are implemented in [collision.utils.ts](./collision.utils.ts) and follow a common interface:

```typescript
type CollisionDetectionStrategy = (
  dropzones: HTMLElement[],
  clientX: number,
  clientY: number,
  dragElement?: HTMLElement | null
) => HTMLElement | null;
```

The algorithms automatically filter out disabled dropzones and return `null` if no valid collision is detected.
