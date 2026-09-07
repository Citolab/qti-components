---
'@qti-components/interactions-core': patch
'@citolab/qti-components': patch
---

Fix drops being refused by a drop target that spans the full width of its interaction.

`closestCornersWithInventoryPriority` — the default collision algorithm for slotted drag-drop — ranks zones by **average corner distance**, which grows with a zone's own dimensions: the corners of a wide target are far from the drag even when the drag sits dead centre in it. The inventory container then won the `distance <= droppableDistance * 1.5` comparison, so the chip animated back to the source set and the response stayed empty.

A `qti-match-interaction` whose second match set holds a single target hit this every time, because one target renders full-width. That is the item reported in #145: four image choices and one "The biggest obtuse angle" target that nothing could be dropped into.

The closest droppable now wins outright when the drop point is inside it, which is size-independent — mirroring the absolute priority the inventory container already had for the same test. Scoped to the closest droppable on purpose: it settles droppable-vs-inventory and never which droppable wins, so overlapping targets (a filled `qti-associable-hotspot` grown over its neighbour, say) stay the corner ranking's business.
