/**
 * Framework-agnostic constants for map store keys
 */
export const MAP_STORE_KEY = {
  MITT: 'mitt',
  EVENT: 'event',
  IMAGE: 'image',
  TOOLBAR: 'toolbar',
  LANG: 'lang',
  CRS: 'crs',
  PRINT: 'print',
  BASEMAP: 'basemap',
  RESOLVER: 'resolver',
  /** Control handles (`UniversalRegistry.registerControl`). */
  CONTROLS: 'controls',
  /** Button layout SoT (visible / position / order / controlLayout). */
  CONTROL_LAYOUT: 'control-layout',
  /** Auto-button descriptors for ModuleContainer. */
  CONTROL_AUTO_BUTTON: 'control-auto-button',
  /** Per-map namespaced method / menu / component values (`UniversalRegistry`). */
  REGISTRY_MAPS: 'registry-controls',
} as const;
