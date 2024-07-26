// MH: Changed the default bootstrap.js to use the new CES API
// Because the old one uses the global CES object that is not allowed to be accessed when the CI
// is embedded in an iframe and coming from another domain
// Therefor we need to use the new CES API to communicates via the broadcast API

window.onload = async function () {
  const channel = new BroadcastChannel('ces_channel');
  const handleMessage = event => {
    if (event.data.type === 'mediaData') {
      const media = event.data.data;
      var n = document.createElement('iframe');
      n.frameBorder = '0';
      n.scrolling = 'no';
      n.src = media[0];
      document.body.appendChild(n);
      channel.close();
    }
  };
  channel.onmessage = handleMessage;
  channel.postMessage({ type: 'getMedia' });
};
