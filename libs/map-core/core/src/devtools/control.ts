/** Stable map control id for `mode="control"` Devtools popup. */
export const DEVTOOLS_CONTROL = {
  id: 'mapDevtools',
} as const;

export type DevtoolsMode = 'overlay' | 'control';
