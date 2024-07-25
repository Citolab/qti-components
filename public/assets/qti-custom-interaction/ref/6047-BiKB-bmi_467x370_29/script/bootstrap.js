window.CES = {
  setResponse: data => {
    window.parent.postMessage({ type: 'setResponse', data }, '*');
  },
  getResponse: () => {
    // return CES.response;
    // //      if (event.data.type === 'responseData') {
    // CES.response = event.data.data;
  },
  getMedia: () => {
    const channel = new BroadcastChannel('ces_channel');
    const handleMessage = event => {
      if (event.data.type === 'mediaData') {
        const media = event.data.data;
        channel.close();
        // window.removeEventListener('message', handleMessage);
        var n = document.createElement('iframe');
        n.frameBorder = '0';
        n.scrolling = 'no';
        n.src = media[0];
        document.body.appendChild(n);
      }
    };

    channel.onmessage = handleMessage;
    channel.postMessage({ type: 'getMedia' }, '*');
  },
  setStageHeight: () => {
    window.parent.postMessage({ type: 'setStageHeight' }, '*');
  }
};

window.onload = function () {
  CES.getMedia();
};

// window.onload = function () {
//   if (!loaded) {
//     CES.getMedia();
//   }
// };
