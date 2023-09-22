import * as cheerio from 'cheerio';
import { Element } from 'cheerio';

const removeAllNamespaces = `
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes"/>
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

export const qtiTransform = (xmlValue: string) => {
  // the XML which will be transformed
  let xmlString = xmlValue;

  const applyXSL1 = (xsl: string) => {
    const xml = new DOMParser().parseFromString(xmlString, 'text/xml');
    const processor = new XSLTProcessor();
    const xsltDocument = new DOMParser().parseFromString(xsl, 'text/xml');
    processor.importStylesheet(xsltDocument);
    const itemXML = processor.transformToFragment(xml, document);
    xmlString = new XMLSerializer().serializeToString(itemXML);
  };

  const api = {
    mathml() {
      const $ = cheerio.load(xmlString, { xmlMode: true, xml: true });
      $('math')
        .each((i, item) => {
          item.tagName = `math-ml`;
        })
        .find('*')
        .each((i, item: Element) => {
          item.tagName = `math-${item.tagName.substring(1)}`;
        });
      xmlString = $.xml();
      return api;
    },
    removeNamesSpaces() {
      applyXSL1(removeAllNamespaces);
      return api;
    },
    pciHooks(uri: string) {
      const attributes = ['hook', 'module'];
      const documentPath = uri.substring(0, uri.lastIndexOf('/'));
      const newXMlDocument = new DOMParser().parseFromString(xmlString, 'text/xml');
      for (const attribute of attributes) {
        const srcAttributes = newXMlDocument.querySelectorAll('[' + attribute + ']');
        srcAttributes.forEach(node => {
          const srcValue = node.getAttribute(attribute)!;
          if (!srcValue.startsWith('data:') && !srcValue.startsWith('http')) {
            // Just paste the relative path of the src location after the documentrootPath
            // old pcis can have a .js, new pci's don't
            node.setAttribute('base-url', uri);
            node.setAttribute(
              'module',
              documentPath + '/' + encodeURIComponent(srcValue + (srcValue.endsWith('.js') ? '' : '.js'))
            );
          }
        });
      }
      xmlString = new XMLSerializer().serializeToString(newXMlDocument);
      return api;
    },
    assetsLocation(uri: string, attributes = ['src', 'href', 'data']) {
      const $ = cheerio.load(xmlString, { xmlMode: true });
      if (uri !== '') {
        const documentPath = uri.substring(0, uri.lastIndexOf('/'));
        for (const attribute of attributes) {
          $(`[${attribute}]`).each((_, node) => {
            const srcValue = $(node).attr(attribute)!;
            if (!srcValue.startsWith('data:') && !srcValue.startsWith('http')) {
              const newSrcValue = documentPath + '/' + encodeURIComponent(srcValue);
              $(node).attr(attribute, newSrcValue);
            }
          });
        }
      }
      xmlString = $.xml();
      return api;
    },
    customTypes() {
      const $ = cheerio.load(xmlString, { xml: true, xmlMode: true });
      $('*').each((i, element: Element) => {
        const classList = $(element).attr('class')?.split(' ');
        if (classList) {
          classList.forEach(str => {
            if (str.startsWith('type:')) {
              element.name = `${element.name}-${str.slice('type:'.length)}`;
            }
          });
        }
      });
      xmlString = $.xml();
      return api;
    },
    // PK: Transform used for customoperator, since we can't add a class there, with a type
    // We use the definition instead
    customDefinition() {
      const $ = cheerio.load(xmlString, { xml: true, xmlMode: true });
      $('*').each((i, element: Element) => {
        const str = $(element).attr('definition');
        if (str) {
          if (str.startsWith('type:')) {
            element.name = `${element.name}-${str.slice('type:'.length)}`;
          }
        }
      });
      xmlString = $.xml();
      return api;
    },
    suffix(elements: string[], suffix: string) {
      const $ = cheerio.load(xmlString, { xml: true, xmlMode: true });
      $('*').each((i, el: cheerio.Element) => {
        if (elements.includes(el.name)) {
          el.name = `${el.name}-${suffix}`;
        }
      });
      xmlString = $.xml();
      return api;
    },
    fn(fn: (xmlString: string) => string) {
      xmlString = fn(xmlString);
      return api;
    },
    fnCh(fn: (xmlString: cheerio.CheerioAPI) => void) {
      const $xml = cheerio.load(xmlString, { xml: true, xmlMode: true });
      fn($xml);
      xmlString = $xml.xml();
      return api;
    },
    elementNameAttributes(elements: string[]) {
      elements.forEach(el => {
        xmlString = replaceAll(xmlString, el, el + ` data-element="${el}" `);
      });
      return api;
    },
    print() {
      console.log(xmlString);
      return api;
    },
    xml() {
      xmlString = fixSelfClosingTags(xmlString);
      return xmlString;
    }
  };
  return api;
};

const fixSelfClosingTags = (xml: string) => {
  const voidTags = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ];
  const split = xml.split('/>');
  let newXml = '';
  for (let i = 0; i < split.length - 1; i++) {
    const edsplit = split[i].split('<');
    const tagName = edsplit[edsplit.length - 1].split(' ')[0];
    const selfClosingTags = voidTags;
    if (!selfClosingTags.includes(tagName)) {
      newXml += split[i] + '></' + tagName + '>';
    } else {
      newXml += split[i] + '/>';
    }
  }
  return newXml + split[split.length - 1];
}; // Parse the input XML string

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
