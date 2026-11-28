---
'@qti-components/theme': minor
---

`qti-layout-col*` columns now stack when their `qti-layout-row` is 767px wide or less, instead of when the viewport is. An item in a narrow pane or beside other content on a wide screen now collapses to one column too. The row is a size container (`container-type: inline-size`), so it must not be placed in a shrink-to-fit parent.
