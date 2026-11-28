import type { ItemInstanceId } from './state/delivery-state.js';

/**
 * The seam to response and outcome processing. `delivery` decides when processing runs; the
 * runtime runs it. In the browser that is the `qti-processing` elements; on a server, a processor
 * that needs no DOM (roadmap 3) or the .NET qti-scoring-engine.
 */
export interface Processor {
  responseProcessing(item: ItemInstanceId): void | Promise<void>;
  outcomeProcessing(): void | Promise<void>;
}
