/**
 * Simple Observable API polyfill matching the WICG specification
 * https://github.com/WICG/observable
 *
 * This polyfill provides just what's needed for drag-drop operations
 */

interface Observer<T> {
  next?: (value: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
}

interface Subscriber<T> extends Observer<T> {
  signal: AbortSignal;
  addTeardown(teardown: () => void): void;
}

class Observable<T> {
  scan<U>(accumulator: (acc: U, value: T) => U, seed: U): Observable<U> {
    return new Observable<U>(subscriber => {
      let acc = seed;
      const sub = this.subscribe({
        next: value => {
          acc = accumulator(acc, value);
          if (subscriber.next) subscriber.next(acc);
        },
        error: subscriber.error,
        complete: subscriber.complete
      });

      // Add teardown to properly clean up the subscription
      subscriber.addTeardown(() => {
        sub.unsubscribe();
      });
    });
  }
  private _subscribe: (subscriber: Subscriber<T>) => void;

  constructor(subscribe: (subscriber: Subscriber<T>) => void) {
    this._subscribe = subscribe;
  }

  subscribe(
    observer: Observer<T> | ((value: T) => void),
    options?: { signal?: AbortSignal }
  ): { unsubscribe: () => void } {
    const actualObserver = typeof observer === 'function' ? { next: observer } : observer;
    const controller = new AbortController();
    const signal = options?.signal || controller.signal;

    const teardowns: (() => void)[] = [];

    const subscriber: Subscriber<T> = {
      ...actualObserver,
      signal,
      addTeardown: (teardown: () => void) => {
        if (signal.aborted) {
          teardown();
        } else {
          teardowns.push(teardown);
        }
      }
    };

    // Clean up on abort
    signal.addEventListener('abort', () => {
      teardowns.forEach(teardown => teardown());
    });

    this._subscribe(subscriber);

    return {
      unsubscribe: () => {
        controller.abort();
      }
    };
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    return new Observable<T>(subscriber => {
      const sub = this.subscribe({
        next: value => {
          if (predicate(value) && subscriber.next) {
            subscriber.next(value);
          }
        },
        error: subscriber.error,
        complete: subscriber.complete
      });

      subscriber.addTeardown(() => {
        sub.unsubscribe();
      });
    });
  }

  map<U>(mapper: (value: T) => U): Observable<U> {
    return new Observable<U>(subscriber => {
      const sub = this.subscribe({
        next: value => {
          if (subscriber.next) {
            subscriber.next(mapper(value));
          }
        },
        error: subscriber.error,
        complete: subscriber.complete
      });

      subscriber.addTeardown(() => {
        sub.unsubscribe();
      });
    });
  }

  takeUntil<U>(other: Observable<U>): Observable<T> {
    return new Observable<T>(subscriber => {
      const mainSub = this.subscribe(subscriber);
      const untilSub = other.subscribe({
        next: () => {
          mainSub.unsubscribe();
          if (subscriber.complete) subscriber.complete();
        }
      });

      subscriber.addTeardown(() => {
        mainSub.unsubscribe();
        untilSub.unsubscribe();
      });
    });
  }
}

// Add EventTarget.when() method matching WICG spec
if (typeof EventTarget !== 'undefined') {
  // Always override, even if already present
  EventTarget.prototype.when = function <T extends Event>(
    eventName: string,
    options?: AddEventListenerOptions
  ): Observable<T> {
    return new Observable<T>(subscriber => {
      const handler = (evt: T) => {
        if (subscriber.next) subscriber.next(evt);
      };

      this.addEventListener(eventName, handler as EventListener, options);

      // teardown: remove listener on unsubscribe
      subscriber.addTeardown(() => {
        this.removeEventListener(eventName, handler as EventListener, options);
      });
    });
  };
}

// TypeScript declarations
declare global {
  interface EventTarget {
    when<K extends keyof HTMLElementEventMap>(
      type: K,
      options?: AddEventListenerOptions
    ): Observable<HTMLElementEventMap[K]>;
    when(type: string, options?: AddEventListenerOptions): Observable<Event>;
  }
}

// Simple init function
export function initObservablePolyfill() {
  // The polyfill is applied automatically when this module loads
}

export { Observable };
