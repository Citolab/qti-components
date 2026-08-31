---
'@qti-components/interactions-core': patch
---

Keep the drag clone visible while the page is in fullscreen.

The observable drag-drop mixin hosts its visual clone in the interaction's root node, so the
theme's `[data-drag-clone]` rules — adopted into item-container's shadow root — can reach it. That
tree is invisible while the page is in fullscreen and it sits outside the fullscreen element: the
browser paints only the fullscreen element's subtree, in the top layer, which no `z-index` can
reach. Picking up a draggable then made it disappear until it was dropped — for an item rendered at
document level, and for a player that puts only the item in fullscreen.

`createDragClone` now resolves the host instead of assuming one: the interaction's root while the
browser still paints it (the ordinary case, a player that fullscreens its own wrapper, where the
clone keeps its scoped styling), the fullscreen element when it does not — resolved through shadow
trees, since `document.fullscreenElement` is retargeted to the host, and falling back to that
element's shadow root when it cannot slot light-DOM children. Because a host subtree may establish a
containing block for `position: fixed` children (`transform`, `filter`, `contain`, `zoom`, …), the
clone's coordinate space is measured with a throwaway probe and its position and size are corrected
for that origin and scale. A clone that is being dragged when the page enters or leaves fullscreen
is moved to the new host and repositioned under the pointer.
