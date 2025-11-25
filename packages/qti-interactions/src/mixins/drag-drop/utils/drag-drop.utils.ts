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
