# Drag & Drop System

This document describes the drag-drop mixin system used across QTI interactions.

## Overview

The drag-drop system provides a flexible, reusable way to implement drag-and-drop functionality across different QTI interaction types. It consists of three core mixins:

- **DragDropCoreMixin**: Base functionality for drag-and-drop interactions
- **DragDropSlottedMixin**: For interactions where drags and drops are in separate containers (e.g., associate, gap-match)
- **DragDropSortableMixin**: For interactions where items are reordered in place (e.g., order)

## Interaction Types

### qti-match-interaction

**Drag selector**: `qti-simple-match-set:first-of-type qti-simple-associable-choice`
**Drop selector**: `qti-simple-match-set:last-of-type qti-simple-associable-choice`
**Uses clone drags**: `false`

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<slot part="slot">
  ↳
  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="C">Capulet</qti-simple-associable-choice> <-- drag
    <qti-simple-associable-choice identifier="D">Demetrius</qti-simple-associable-choice> <-- drag
  </qti-simple-match-set>

  <qti-simple-match-set>
    <qti-simple-associable-choice identifier="M">A Midsummer-Night's</qti-simple-associable-choice> <-- drop
    <qti-simple-associable-choice identifier="R">Romeo and Juliet</qti-simple-associable-choice> <-- drop
  </qti-simple-match-set>
</slot>
```

### qti-order-interaction

**Drag selector**: `qti-simple-choice`
**Drop selector**: `drop-list`
**Uses clone drags**: `true`

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<div part="container">
  <slot part="drags">
    ↳
    <qti-simple-choice identifier="DriverA">Rubens</qti-simple-choice> <-- drag
    <qti-simple-choice identifier="DriverB">Jenson</qti-simple-choice> <-- drag
    <qti-simple-choice identifier="DriverC">Michael</qti-simple-choice> <-- drag
  </slot>
  <div part="drops">
    {
    <drop-list part="drop-list"></drop-list> <-- drop
    <span part="correct-response">correctResponse</span>
    }
  </div>
</div>
```

### qti-gap-match-interaction

**Drag selector**: `qti-gap-text`
**Drop selector**: `qti-gap`
**Uses clone drags**: `false`

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<slot part="drags" name="qti-gap-text">
  ↳
  <qti-gap-text identifier="W" match-max="1">winter</qti-gap-text> <-- drag
  <qti-gap-text identifier="Sp" match-max="1">spring</qti-gap-text> <-- drag
  <qti-gap-text identifier="Su" match-max="1">summer</qti-gap-text> <-- drag
  <qti-gap-text identifier="A" match-max="1">autumn</qti-gap-text> <-- drag
</slot>
<slot part="drops">
  ↳
  <blockquote>
    <p>
      Now is the <qti-gap identifier="G1"></qti-gap> of our discontent<br />
      Made glorious <qti-gap identifier="G2"></qti-gap> by this sun of York;<br />
      And all the clouds that lour'd upon our house<br />
      In the deep bosom of the ocean buried.
    </p>
  </blockquote>
</slot>
```

### qti-associate-interaction

**Drag selector**: `qti-simple-associable-choice`
**Drop selector**: `.dl`
**Uses clone drags**: `true`

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>

<slot name="qti-simple-associable-choice">
  ↳
  <qti-simple-associable-choice identifier="A" match-max="1">Antonio</qti-simple-associable-choice>
  <qti-simple-associable-choice identifier="C" match-max="1">Capulet</qti-simple-associable-choice>
  <qti-simple-associable-choice identifier="D" match-max="1">Demetrius</qti-simple-associable-choice>
</slot>
<div part="drop-container">
  {
  <div part="associables-container">
    <div name="left${index}" part="drop-list" class="dl" identifier="droplist${index}_left"></div>
    <div name="right${index}" part="drop-list" class="dl" identifier="droplist${index}_right"></div>
  </div>
  }
</div>
```

### qti-graphic-gap-match-interaction

**Drag selector**: `qti-gap-img`
**Drop selector**: `qti-associable-hotspot`
**Uses clone drags**: `false`

```html
<slot name="prompt"> ↳ <qti-prompt>prompt</qti-prompt> </slot>
<slot
  >↳
  <qti-associable-hotspot coords="55,256,133,319" identifier="A" match-max="1" shape="rect"></qti-associable-hotspot>
</slot>
<slot part="drags" name="drags">
  ↳
  <qti-gap-img identifier="DraggerD" match-max="1">
    <img src="qti-graphic-gap-match-interaction/d-bay.png" alt="Choice D, Bay of Pigs" height="63" width="78" />
  </qti-gap-img>
</slot>
```

## Collision Detection Algorithms

The drag-drop system supports multiple collision detection algorithms based on [dnd-kit's collision detection strategies](https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms).

### Available Algorithms

#### 1. Pointer Within (Default)
- **Algorithm**: `'pointerWithin'`
- **Behavior**: Only registers collision when the pointer is contained within the bounding rectangle of the droppable
- **Best For**: High-precision interfaces where you want strict pointer-based detection
- **Use Case**: Most standard drag-and-drop interactions

#### 2. Rectangle Intersection
- **Algorithm**: `'rectangleIntersection'`
- **Behavior**: Ensures there is no gap between any of the 4 sides of the rectangles. A draggable is considered over a droppable only when their bounding boxes physically intersect.
- **Best For**: Standard drag-and-drop scenarios where you want contact-based detection
- **Use Case**: When you want the draggable element itself (not just the pointer) to visibly overlap the droppable

#### 3. Closest Center
- **Algorithm**: `'closestCenter'`
- **Behavior**: Identifies the droppable container whose center is closest to the center of the draggable item
- **Best For**: Sortable lists where you want more forgiving detection
- **Use Case**: Recommended for sortable lists and reordering interfaces
- **Note**: May select underlying dropzones in stacked layouts

#### 4. Closest Corners
- **Algorithm**: `'closestCorners'`
- **Behavior**: Measures the distance between all four corners of the draggable and the four corners of each droppable
- **Best For**: Kanban boards and interfaces with stacked droppable containers
- **Use Case**: When you have layered layouts and want more intuitive corner-based detection

### Recommended Algorithms by Interaction Type

| Interaction Type | Recommended Algorithm | Reason |
|-----------------|----------------------|---------|
| Associate Interaction (Slotted) | `closestCorners` | Better handling of multiple drop zones and spatial positioning |
| Order Interaction (Sortable) | `closestCenter` | More forgiving for reordering lists |
| Graphic Associate | `rectangleIntersection` | Visual overlap important for spatial positioning |
| Kanban/Multi-column | `closestCorners` | Better handling of stacked containers |

### Usage

#### Configuring Per-Instance (Recommended)

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

#### Configuring with Core Mixin Directly

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

#### Changing Algorithm at Runtime

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

#### Using Collision Detection Directly

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

### Implementation Details

All collision detection algorithms are implemented in `collision.utils.ts` and follow a common interface:

```typescript
type CollisionDetectionStrategy = (
  dropzones: HTMLElement[],
  clientX: number,
  clientY: number,
  dragElement?: HTMLElement | null
) => HTMLElement | null;
```

The algorithms automatically filter out disabled dropzones and return `null` if no valid collision is detected.
