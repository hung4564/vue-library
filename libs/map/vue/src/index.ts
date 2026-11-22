/**
 * Meta package facade: bootstrap + thin re-exports.
 * Domain APIs stay on `@hungpvq/map-core`, `@hungpvq/map-dataset`,
 * `@hungpvq/vue-map-core`, `@hungpvq/vue-map-dataset`.
 */
export { createMapAppPlugin, installMapApp } from '@hungpvq/vue-map-dataset';
export type { InstallMapAppOptions } from '@hungpvq/vue-map-dataset';
