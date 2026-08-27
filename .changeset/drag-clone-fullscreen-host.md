---
'@qti-components/interactions-core': patch
---

Keep the drag clone visible while the page is in fullscreen.

The observable drag-drop mixin appended its visual clone to `document.body`. That is invisible
while the page is in fullscreen: the browser paints only the fullscreen element's subtree, in the
top layer, which no `z-index` can reach. Picking up a draggable in a fullscreen player (exam
lockdown / kiosk) therefore made it disappear until it was dropped. The predecessor mixin had this
fixed; the fix was not carried over in the rewrite.

`createDragClone` now hosts the clone in the fullscreen element when there is one - resolved
through shadow trees, since `document.fullscreenElement` is retargeted to the host, and falling
back to that element's shadow root when it cannot slot light-DOM children - and in `document.body`
otherwise. Because a host subtree may establish a containing block for `position: fixed` children
(`transform`, `filter`, `contain`, `zoom`, …), the clone's coordinate space is measured with a
throwaway probe and its position and size are corrected for that origin and scale. A clone that is
being dragged when the page enters or leaves fullscreen is moved to the new host and repositioned
under the pointer.
