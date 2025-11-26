export function findDraggableTarget(event: Event, draggablesSelector: string): HTMLElement | null {
  const composedPath = event.composedPath ? event.composedPath() : [event.target];

  for (const element of composedPath) {
    if (element instanceof HTMLElement && element.tagName !== 'SLOT') {
      if (element.matches(draggablesSelector) || element.hasAttribute('qti-draggable')) {
        return element;
      }

      const closest = element.closest(draggablesSelector) || element.closest('[qti-draggable="true"]');
      if (closest) {
        return closest as HTMLElement;
      }
    }
  }

  return null;
}

export function findClosestDropzone(
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

export function findInventoryItems(dragContainers: HTMLElement[], identifier: string): HTMLElement[] {
  const items: HTMLElement[] = [];

  dragContainers.forEach(container => {
    let matches: Element[] = [];

    if (container.tagName.toLowerCase() === 'slot') {
      const slotElement = container as HTMLSlotElement;
      const assignedElements = slotElement.assignedElements({ flatten: true });

      matches = assignedElements.filter(el => el.getAttribute('identifier') === identifier);
    } else {
      matches = Array.from(container.querySelectorAll(`[identifier="${identifier}"]`));
    }

    items.push(...(matches as HTMLElement[]));
  });

  return items;
}

export function getMatchMaxValue(draggables: HTMLElement[], identifier: string): number {
  const element = draggables.find(el => el.getAttribute('identifier') === identifier);
  if (!element) return 1;

  const matchMax = element.getAttribute('match-max');
  return matchMax ? parseInt(matchMax, 10) || 0 : 1;
}

export function isDroppableAtCapacity(droppable: HTMLElement, draggablesSelector: string): boolean {
  const matchMax = parseInt(droppable.getAttribute('match-max') || '1', 10) || 1;
  if (matchMax === 0) return false;

  const selectorMatches = droppable.querySelectorAll(draggablesSelector);
  const attributeMatches = droppable.querySelectorAll('[qti-draggable="true"]');
  const current = Math.max(selectorMatches.length, attributeMatches.length);

  return current >= matchMax;
}

export function countTotalAssociations(droppables: HTMLElement[], draggablesSelector: string): number {
  return droppables.reduce((total, droppable) => {
    const selectorMatches = droppable.querySelectorAll(draggablesSelector).length;
    const attributeMatches = droppable.querySelectorAll('[qti-draggable="true"]').length;
    return total + Math.max(selectorMatches, attributeMatches);
  }, 0);
}

export function collectResponseData(droppables: HTMLElement[], draggablesSelector: string): string[] {
  return droppables
    .map(droppable => {
      const draggablesInDroppable = Array.from(droppable.querySelectorAll<HTMLElement>(draggablesSelector));
      const identifiers = draggablesInDroppable
        .map(element => element.getAttribute('identifier'))
        .filter((identifier): identifier is string => Boolean(identifier));
      const droppableIdentifier = droppable.getAttribute('identifier');
      return identifiers.map(id => `${id} ${droppableIdentifier}`);
    })
    .flat();
}

export function applyDropzoneAutoSizing(
  draggables: HTMLElement[],
  droppables: HTMLElement[],
  dragContainers: HTMLElement[],
  hostWindow: Window | null = typeof window !== 'undefined' ? window : null
): void {
  if (!draggables.length || !droppables.length || !hostWindow) return;

  let maxDraggableHeight = 0;
  let maxDraggableWidth = 0;

  draggables.forEach(draggable => {
    const rect = draggable.getBoundingClientRect();
    maxDraggableHeight = Math.max(maxDraggableHeight, rect.height);
    maxDraggableWidth = Math.max(maxDraggableWidth, rect.width);
  });

  const dropContainer: HTMLElement | null = droppables[0].parentElement;

  const isGridLayout = droppables[0].tagName === 'QTI-SIMPLE-ASSOCIABLE-CHOICE';
  const isGapElement = droppables[0].tagName === 'QTI-GAP';

  if (isGridLayout && dropContainer) {
    let maxWidth: number;

    if (dropContainer.clientWidth > 0) {
      const styles = hostWindow.getComputedStyle(dropContainer);
      const paddingLeft = parseFloat(styles.paddingLeft);
      const paddingRight = parseFloat(styles.paddingRight);
      maxWidth = dropContainer.clientWidth - paddingLeft - paddingRight;
    } else {
      maxWidth = Math.min(hostWindow.innerWidth * 0.8, 600);
    }

    dropContainer.style.gridTemplateColumns = `repeat(auto-fit, minmax(calc(min(${maxWidth}px, ${maxDraggableWidth}px + 2 * var(--qti-dropzone-padding, 0.5rem))), 1fr))`;
  }

  droppables.forEach(droppable => {
    droppable.style.minHeight = `${maxDraggableHeight}px`;

    if (isGridLayout || isGapElement) {
      droppable.style.minWidth = `${maxDraggableWidth}px`;
    }

    const dropSlot: HTMLElement | null = droppable.shadowRoot?.querySelector('slot[part="dropslot"]');
    if (dropSlot) {
      dropSlot.style.minHeight = `${maxDraggableHeight}px`;
    }
  });

  dragContainers.forEach(dragContainer => {
    dragContainer.style.minHeight = `${maxDraggableHeight}px`;
  });
}
