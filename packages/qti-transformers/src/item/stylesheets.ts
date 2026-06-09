export function stripStyleSheets(xmlFragment: DocumentFragment) {
  // remove qti-stylesheet tag
  xmlFragment.querySelectorAll('qti-stylesheet').forEach(stylesheet => stylesheet.remove());
}
