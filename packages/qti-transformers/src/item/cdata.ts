export function convertCDATAtoComment(xmlFragment: DocumentFragment) {
  const cdataElements = xmlFragment.querySelectorAll('qti-custom-operator[class="js.org"] > qti-base-value');
  cdataElements.forEach(element => {
    const commentText = document.createComment(element.textContent);
    element.replaceChild(commentText, element.firstChild);
  });
}
