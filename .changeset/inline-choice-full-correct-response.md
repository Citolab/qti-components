---
'@qti-components/corrections': patch
'@qti-components/inline-choice-interaction': patch
'@qti-components/theme': patch
---

Inline-choice answers the internal correct-response mode with the full variant.

`QtiInlineChoiceInteractionCorrection` used to paint its own third presentation: a
`part="correct-option"` marker inside the field. It competed with the sentence the dropdown sits in,
and when the candidate had picked the correct option it printed the same word twice — while binding
the option's own DOM nodes, which a node cannot be in two places at once, so the candidate's answer
was blanked and stayed blank once the key was switched off again (lit dirty-checks the unchanged node
reference). Repaired upstream in the interaction as Citolab/qti-components#178; here the rendering
that carried the bug is removed instead.

Internal mode now defers to `toggleFullCorrectResponse`, exactly as text-entry — the other inline
interaction — has always done: the key is a second, inert copy of the dropdown in a
`div.full-correct-response-inline` beside the field, already themed, and identical to what an item
authored with `show-full-correct-response` produces. The `correct-option` part and its theme rule are
gone with it, and the host no longer takes the `show-correct-response` dashed outline, since the
element beside it is what presents the key now.

Unlike the base default, inline-choice shows the key whether or not the candidate was right. Being
shown nothing in answer to "show the correct response" is indistinguishable from a broken feature,
and this is the interaction where answer and key are the same short phrase, so there is no visual
clue either. The correctness badge says who was right.

The withholding rule itself is now a named, overridable hook,
`withholdsFullCorrectResponseWhenCorrect`, rather than a condition inlined in
`toggleFullCorrectResponse`. Its default is unchanged for every other interaction — withheld from a
correct candidate unless the item sets `fullCorrectResponseOnlyWhenIncorrect: false` — and is now
covered by `correct-response.mixin.spec.ts`, which had no test before.
