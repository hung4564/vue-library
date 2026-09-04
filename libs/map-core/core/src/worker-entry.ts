/**
 * Web Worker entry for `@hungpvq/map-core/worker`.
 * Safe to import inside workers — no CSS / DOM / registry side effects.
 *
 * Named `worker-entry.ts` (not `worker.ts`) so `export * from './worker'` in
 * the package root still resolves to the `worker/` directory.
 */
export * from './worker/in-worker';
