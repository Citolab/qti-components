// MH: Changed the default bootstrap.js to use the new CES API
// Because the old one uses the global CES object that is not allowed to be accessed when the CI
// is embedded in an iframe and coming from another domain
// Therefor we need to use the new CES API to communicates via the broadcast API
window.onload = async function () {
  const handleMessage = event => {
    if (event.data.type === 'mediaData') {
      const media = event.data.data;
      var n = document.createElement('iframe');
      n.frameBorder = '0';
      n.scrolling = 'no';
      n.src = media[0];
      document.body.appendChild(n);
      window.removeEventListener('message', handleMessage);
    }
  };
  window.addEventListener('message', handleMessage);
  let w = window.parent;
  while (w) {
    w.postMessage({ type: 'getMedia' }, '*');
    if (w !== w.parent) {
      w = w.parent;
    } else {
      w = null;
    }
  }
};
