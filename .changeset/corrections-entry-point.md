---
'@citolab/qti-components': major
---

`@citolab/qti-components/corrections` is now a drop-in alternative to the package root. Where the root registers the standard delivery elements, this registers the same set with the correction variants substituted for the tags they cover, plus the correction-only controls:

```html
<script type="module">
  import '@citolab/qti-components/corrections';
</script>
```

Elements without a correction variant — the processing operators, most test controls, interactions like media and upload — still get their standard constructor, so the page works as a whole.

**Breaking:** that subpath previously only re-exported `@qti-components/corrections` and registered nothing. It still exports everything it did, but importing it now defines custom elements. Anything importing it purely for the mixins, types or constructors should move to the package root.

Importing `@citolab/qti-components` is unchanged.

Registration is first-wins and silently so — every `register.ts` guards with `if (!customElements.get(tag))` — so importing both entry points leaves the correction variants inactive with no error. The corrections entry detects that and warns, naming the tags it could not claim.
