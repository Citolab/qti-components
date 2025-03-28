const originalFetch = window.fetch;
const OriginalXMLHttpRequest = window.XMLHttpRequest;

// Override fetch
window.fetch = async (...args) => {
  // Delay for 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Proceed with the original fetch
  return originalFetch(...args);
};

class DelayedXMLHttpRequest extends OriginalXMLHttpRequest {
  send(...args) {
    const delay = 2000; // 2 second delay
    const originalSend = super.send;

    // Delay the actual send call
    setTimeout(() => {
      originalSend.apply(this, args);
    }, delay);
  }

  //   abort() {
  //     super.abort();
  //   }
}

// Override globally
window.XMLHttpRequest = DelayedXMLHttpRequest;
