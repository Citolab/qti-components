---
'@qti-components/test': major
'@citolab/qti-components': major
---

Removed `<test-paging-buttons-stamp>` and `<test-section-buttons-stamp>`, deprecated since before 9.0. Use `<test-stamp>` with a repeat: `<test-stamp><template><template type="repeat" repeat="{{ activeTestpart.items }}">…</template></template></test-stamp>` for items, `activeTestpart.sections` for sections. The repeated variable is still `item`.

Behaviour difference: the removed elements listed the items (or sections) of every test part; the repeat lists those of the active test part. No surveyed host source uses either element.
