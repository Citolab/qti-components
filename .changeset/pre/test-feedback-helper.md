---
'@qti-components/test': minor
'@citolab/qti-components': minor
---

`qtiTest.getTestFeedback(access?)` returns the `qti-test-feedback` elements that apply after outcome processing, so a host no longer filters them by hand. `qti-test-feedback` reads its `access` attribute (`atEnd`, the default, or `during`) and gets `matches(value)`: whether it applies for a value of its `outcome-identifier`, honouring `show-hide` and container values. It still renders nothing where it is declared: where and when to show it stays up to the host.
