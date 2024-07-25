// MH: Changed the default bootstrap.js to use the new CES API
// Because the old one uses the global CES object that is not allowed to be accessed when the CI
// is embedded in an iframe and coming from another domain
// Therefor we need to use the new CES API to communicates via the broadcast API

window.CES = {
  media: null,
  response: null,
  load: () => {
    const channel = new BroadcastChannel('ces_channel');

    return new Promise((resolve, reject) => {
      let resolveCount = 0;
      const handleMessage = event => {
        if (event.data.type === 'mediaData') {
          const media = event.data.data;
          CES.media = media;
          resolveCount++;
        } else if (event.data.type === 'responseData') {
          const response = event.data.data;
          CES.response = response;
          resolveCount++;
        }
        if (resolveCount === 2) {
          channel.close();
          return resolve();
        }
      };

      channel.onmessage = handleMessage;
      channel.postMessage({ type: 'getMedia' });
      channel.postMessage({ type: 'getResponse' });
    });
  },
  setResponse: data => {
    const channel = new BroadcastChannel('ces_channel');
    channel.postMessage({ type: 'setResponse', data });
    channel.close();
  },
  getResponse: () => {
    return CES.response;
  },
  getMedia: () => {
    return CES.media;
  },
  setStageHeight: () => {
    const channel = new BroadcastChannel('ces_channel');
    channel.postMessage({ type: 'setStageHeight' });
    channel.close();
  }
};

window.onload = async function () {
  await CES.load();

  var n = document.createElement('iframe');
  n.frameBorder = '0';
  n.scrolling = 'no';
  n.src = CES.getMedia()[0];
  document.body.appendChild(n);
};
