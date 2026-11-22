/**
 * Meta package facade: bootstrap + thin re-exports.
 * Domain APIs stay on `@hungpvq/map-core`, `@hungpvq/map-dataset`,
 * `@hungpvq/react-map-core`, `@hungpvq/react-map-dataset`.
 */
export { installMapApp } from '@hungpvq/react-map-dataset';
export type { InstallMapAppOptions } from '@hungpvq/react-map-dataset';
