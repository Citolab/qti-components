export function pciHooks(xmlFragment: XMLDocument, uri: string): void {
  const attributes = ['hook', 'module'];
  const documentPath = uri.substring(0, uri.lastIndexOf('/'));
  for (const attribute of attributes) {
    const srcAttributes = xmlFragment.querySelectorAll('[' + attribute + ']');
    srcAttributes.forEach(node => {
      const srcValue = node.getAttribute(attribute)!;
      if (!srcValue.startsWith('data:') && !srcValue.startsWith('http')) {
        // Just paste the relative path of the src location after the documentrootPath
        // old pcis can have a .js, new pci's don't
        node.setAttribute('base-url', uri);
        node.setAttribute('module', documentPath + '/' + encodeURI(srcValue + (srcValue.endsWith('.js') ? '' : '.js')));
      }
    });
  }
}
