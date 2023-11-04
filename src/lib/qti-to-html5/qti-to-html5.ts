import { xml } from 'lit-xml';

const removeAllNamespaces = `
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- convert CDATA to comments -->
  <xsl:template match="text()[contains(., 'CDATA')]">
    <strong>
      <xsl:comment>
        <xsl:value-of select="."/>
      </xsl:comment>
    <strong>
  </xsl:template>

  <!-- remove xml comments -->
  <xsl:template match="comment()" />

  <xsl:template match="*">
    <!-- remove element prefix -->
    <xsl:element name="{local-name()}">
      <!-- process attributes -->
      <xsl:for-each select="@*">
        <!-- remove attribute prefix -->
        <xsl:attribute name="{local-name()}">
          <xsl:value-of select="."/>
        </xsl:attribute>
      </xsl:for-each>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>
</xsl:stylesheet>`;

export function qti2html5(itemXML: string, itemLocation: string) {
  const xml = new DOMParser().parseFromString(itemXML, 'text/xml');
  const processor = new XSLTProcessor();
  const xsltDocument = new DOMParser().parseFromString(removeAllNamespaces, 'text/xml');
  processor.importStylesheet(xsltDocument);
  const itemHTMLFragment = processor.transformToFragment(xml, document);

  itemHTMLFragment.querySelectorAll('[src],[href]').forEach(elWithSrc => {
    let attr: 'src' | 'href' | '' = '';

    if (elWithSrc.getAttribute('src')) {
      attr = 'src';
    }
    if (elWithSrc.getAttribute('href')) {
      attr = 'href';
    }
    const attrValue = elWithSrc.getAttribute(attr)?.trim();

    if (!attrValue.startsWith('data:') && !attrValue.startsWith('http')) {
      const newSrcValue = itemLocation + encodeURIComponent(attrValue);
      elWithSrc.setAttribute(attr, newSrcValue);
    }
  });

  const itemHTML = new XMLSerializer().serializeToString(itemHTMLFragment);
  console.log(itemHTML);
  return itemHTML;
}
