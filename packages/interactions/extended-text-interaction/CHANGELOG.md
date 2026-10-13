# @qti-components/extended-text-interaction

## 2.0.0-next.0

### Major Changes

- [#292](https://github.com/Citolab/qti-components/pull/292) [`8984eab`](https://github.com/Citolab/qti-components/commit/8984eab2eacc6b7d7a9b9454c3c21334cb18dfc3) Thanks [@herrKlein](https://github.com/herrKlein)! - `qti-extended-text-interaction` reads `min-strings`, defaulting to 0 as in the QTI spec. An empty field is now valid unless `min-strings="1"` is set; it used to be invalid. Items that relied on that (e.g. gating next or end-attempt on an answer) must add `min-strings="1"`.
