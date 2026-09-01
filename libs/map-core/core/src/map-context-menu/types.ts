import type { MapSimple } from '../types';

export type MapContextMenuLngLat = {
  lng: number;
  lat: number;
};

export type MapContextMenuPoint = {
  x: number;
  y: number;
};

export type MapContextMenuTarget = {
  lngLat: MapContextMenuLngLat;
  point?: MapContextMenuPoint;
  mapId: string;
};

export type MapMenuConditionContext = {
  layer: MapContextMenuTarget;
  mapId?: string;
  context?: MapContextMenuTarget;
};

export type MapMenuCondition =
  | boolean
  | ((ctx: MapMenuConditionContext) => boolean);

export type MapMenuItemProps = {
  layer: MapContextMenuTarget;
  mapId: string;
  value: MapContextMenuTarget;
  event?: MouseEvent;
  context: MapContextMenuTarget;
  map?: MapSimple;
};

export type MapMenuItemClick = (props: MapMenuItemProps) => void | Promise<void>;

export type MapContextMenuDivider = {
  type: 'divider';
  id?: string;
  hidden?: MapMenuCondition;
};

export type MapContextMenuHeader = {
  type: 'header';
  id?: string;
  name: string;
  hidden?: MapMenuCondition;
};

export type MapContextMenuAction = {
  type: 'item';
  id?: string;
  name: string;
  icon?: string;
  click?: MapMenuItemClick;
  hidden?: MapMenuCondition;
  disabled?: MapMenuCondition;
  children?: MapContextMenuItem[];
  class?: string;
  location?: 'menu';
};

export type MapContextMenuItem =
  | MapContextMenuDivider
  | MapContextMenuHeader
  | MapContextMenuAction;

export const MAP_CONTEXT_MENU_ID = {
  copyGeojson: 'copy-geojson',
  centerHere: 'center-here',
  zoomInHere: 'zoom-in-here',
  quickAnalysis: 'quick-analysis',
  identifyHere: 'identify-here',
  addGeojsonHere: 'add-geojson-here',
  copyCoords: 'copy-coords',
  copyWkt: 'copy-wkt',
  googleMaps: 'google-maps',
  googleEarth: 'google-earth',
} as const;

export type MapContextMenuItemId =
  (typeof MAP_CONTEXT_MENU_ID)[keyof typeof MAP_CONTEXT_MENU_ID];
