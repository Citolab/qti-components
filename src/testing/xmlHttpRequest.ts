// ExtendedXMLHttpRequest.configureBehaviors(
//   {
//     '/assets/qti-test-package/items/info_start.xml': { type: 'slow', delay: 800 },
//     '/assets/qti-test-package/items//ref/unbelievableNight.xml': { type: 'slow', delay: 800 }
//     // 'api/users': { type: 'success', delay: 200 },
//     // 'api/orders': { type: 'error', status: 404, statusText: 'Not Found' },
//     // 'api/payment': { type: 'error', status: 500, statusText: 'Server Error' },
//     // 'api/settings': { type: 'abort' },
//     // 'api/reports': { type: 'timeout' }
//   },

//   { type: 'passthrough' }, // Default behavior - use 'passthrough' to let unmatched URLs process normally
//   // Use exact matching? false = contains matching (default), true = exact matching
//   false
// );

type SimulationBehavior = {
  type: 'success' | 'slow' | 'error' | 'abort' | 'timeout' | 'passthrough';
  delay?: number;
  status?: number;
  statusText?: string;
  responseText?: string;
};

// Define a mapping of URLs to their behaviors
type BehaviorMap = {
  [url: string]: SimulationBehavior;
};

// URL matching mode - simple string matching is sufficient for most cases
type MatchMode = 'exact' | 'contains';

export class ExtendedXMLHttpRequest extends XMLHttpRequest {
  private _readyState = 0;
  private _status = 200;
  private _statusText = 'OK';
  private _responseText = '';
  private _requestUrl = '';
  private _requestMethod = '';
  private _aborted = false;
  private _timeoutId: number | null = null;

  // Configuration for request behaviors
  private static behaviors: BehaviorMap = {};
  private static defaultBehavior: SimulationBehavior = { type: 'passthrough' };
  private static matchMode: MatchMode = 'contains';

  constructor() {
    super();

    // Override readyState property
    Object.defineProperty(this, 'readyState', {
      get: () => this._readyState
    });

    // Override status property
    Object.defineProperty(this, 'status', {
      get: () => this._status
    });

    // Override statusText property
    Object.defineProperty(this, 'statusText', {
      get: () => this._statusText
    });

    // Override responseText property
    Object.defineProperty(this, 'responseText', {
      get: () => this._responseText
    });
  }

  // Configure the behaviors for URLs (simplified)
  static configureBehaviors(
    behaviors: BehaviorMap,
    defaultBehavior?: SimulationBehavior,
    useExactMatching: boolean = false
  ) {
    ExtendedXMLHttpRequest.behaviors = behaviors;

    if (defaultBehavior) {
      ExtendedXMLHttpRequest.defaultBehavior = defaultBehavior;
    }

    // Set whether to use exact matching or contains matching
    ExtendedXMLHttpRequest.matchMode = useExactMatching ? 'exact' : 'contains';
  }

  // Find the matching behavior for a URL - simplified to just exact or contains matching
  private findBehaviorForUrl(url: string): SimulationBehavior {
    // Exact matching - directly look up in the behaviors object
    if (ExtendedXMLHttpRequest.matchMode === 'exact') {
      return ExtendedXMLHttpRequest.behaviors[url] || ExtendedXMLHttpRequest.defaultBehavior;
    }

    // Contains matching - check if URL contains any of the keys
    if (ExtendedXMLHttpRequest.matchMode === 'contains') {
      for (const key in ExtendedXMLHttpRequest.behaviors) {
        if (url.includes(key)) {
          return ExtendedXMLHttpRequest.behaviors[key];
        }
      }
    }

    // Default behavior if no match is found
    return ExtendedXMLHttpRequest.defaultBehavior;
  }

  // Override open method
  override open(method: string, url: string) {
    this._requestUrl = url;
    this._requestMethod = method;
    super.open(method, url);
  }

  // Override abort method
  override abort() {
    this._aborted = true;
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }

    this._readyState = 4;

    const event = new Event('abort');
    this.dispatchEvent(event);

    super.abort();
  }

  // Override send method
  override send(body?: Document | BodyInit | null) {
    if (this._aborted) {
      return;
    }

    // Find behavior for this URL
    const behavior = this.findBehaviorForUrl(this._requestUrl);

    // Special type 'passthrough' or if the defaultBehavior has type 'passthrough'
    // and no specific behavior was found for this URL
    if (behavior.type === 'passthrough') {
      console.warn('spec: passthrough for:', this._requestUrl);
      // Process normally - just pass through to the original implementation
      return super.send(body);
    }

    const delay = behavior.delay || 0;

    // Simulate request progress
    this.updateReadyState(1); // OPENED
    this.updateReadyState(2); // HEADERS_RECEIVED
    this.updateReadyState(3); // LOADING

    // Handle different types of behavior
    this._timeoutId = setTimeout(() => {
      if (this._aborted) return;

      switch (behavior.type) {
        case 'success':
          this._status = behavior.status || 200;
          this._statusText = behavior.statusText || 'OK';
          this._responseText = behavior.responseText || '{"success": true}';
          this.updateReadyState(4); // DONE
          this.dispatchEvent(new Event('load'));
          break;

        case 'error':
          this._status = behavior.status || 404;
          this._statusText = behavior.statusText || 'Not Found';
          this._responseText = behavior.responseText || '{"error": "Resource not found"}';
          this.updateReadyState(4); // DONE
          this.dispatchEvent(new Event('error'));
          break;

        case 'abort':
          this.abort();
          break;

        case 'timeout':
          this._readyState = 4;
          this.dispatchEvent(new Event('timeout'));
          break;

        case 'slow': {
          // For slow loading, we simulate multiple partial responses
          let progress = 0;
          const totalParts = 5;
          const partDelay = delay / totalParts;

          const progressInterval = setInterval(() => {
            if (this._aborted) {
              clearInterval(progressInterval);
              return;
            }

            progress++;
            // Update progress events
            const progressEvent = new ProgressEvent('progress', {
              lengthComputable: true,
              loaded: (progress / totalParts) * 100,
              total: 100
            });
            this.dispatchEvent(progressEvent);

            if (progress >= totalParts) {
              clearInterval(progressInterval);
              // Finally make the real request after delay
              super.send(body);
            }
          }, partDelay);
          break;
        }
      }
    }, delay);
  }

  // Helper to update readyState and dispatch the event
  private updateReadyState(state: number) {
    if (this._aborted) return;

    this._readyState = state;
    const event = new Event('readystatechange');
    this.dispatchEvent(event);

    if (typeof this.onreadystatechange === 'function') {
      this.onreadystatechange(event);
    }
  }
}
