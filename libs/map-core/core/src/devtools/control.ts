/** Stable map control id for Map-scoped Devtools (`DraggableItemPopup`). */
export const DEVTOOLS_CONTROL = {
  id: 'mapDevtools',
} as const;

/** @deprecated Overlay mode removed — Devtools is Map-scoped control only. */
export type DevtoolsMode = 'control';
