/* eslint-disable wc/no-invalid-element-name */

import { component, useState, virtual } from 'haunted';
import { QtiTestHaunted } from './qti-test.haunted';
import { html } from 'lit';
import { fetchManifestData } from './test-utils';
import { useEffect } from 'haunted';
import styles from './qti-test.css?inline';

interface QtiTestProps extends HTMLElement {
  packageUri: string;
}

function QtiTestComponent(element: QtiTestProps) {
  const [manifestData, setManifestData] = useState();

  useEffect(() => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    element.shadowRoot?.adoptedStyleSheets.push(sheet);
  }, []);

  useEffect(() => {
    const fetchManifest = async packageUri => {
      return await fetchManifestData(packageUri);
    };
    fetchManifest(element.packageUri).then(manifest => {
      setManifestData(manifest);
    });
  }, [element.packageUri]);

  return html`${manifestData ? virtual(QtiTestHaunted)(manifestData) : ``}`;
}

export const QtiTest = component<QtiTestProps>(QtiTestComponent as any, {
  observedAttributes: ['package-uri']
});

customElements.define('qti-test', QtiTest);
