---
'@qti-components/base': minor
'@qti-components/portable-custom-interaction': minor
'@citolab/qti-components': minor
---

`ConfigContext.pciIframe` sets the `sandbox` and `allow` attributes of the iframe every portable custom interaction runs in, so a delivery environment decides it once on `qti-item` / `qti-test` (`item.configContext = { pciIframe: { sandbox: 'allow-scripts' } }`). `sandbox: 'allow-scripts'` gives PCIs an opaque origin, away from the host page's DOM, storage and login (for PCIs from a source the host does not trust); `allow` delegates permissions such as `autoplay` or, without a sandbox, `microphone`. An opaque origin never gets the microphone or camera, so a host that sandboxes cannot run a recording PCI. Without the setting nothing changes: the frame is same-origin with the page and has no `allow`.
