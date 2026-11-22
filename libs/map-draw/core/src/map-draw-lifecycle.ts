/**
 * Framework-agnostic MapDraw construction + mount lifecycle for DrawControl hosts.
 */
import { MapDraw, type MapDrawOptions } from './mapbox-draw';
import { StaticMode } from './modes/static-mode';
import { getDrawStyles } from './theme/index';

/** Minimal map surface for add/remove control (MapLibre-compatible). */
export type MapDrawHostMap = {
  hasControl: (control: never) => boolean;
  addControl: (control: never) => unknown;
  removeControl: (control: never) => unknown;
};

export type CreateMapDrawControlOptions = {
  primaryColor?: string;
  activeColor?: string;
  drawControlOptions?: Omit<MapDrawOptions, 'displayControlsDefault'>;
};

export type MapDrawControlHandle = {
  control: InstanceType<typeof MapDraw>;
  addToMap: (map: MapDrawHostMap) => void;
  removeFromMap: (map: MapDrawHostMap) => void;
};

/**
 * Build a MapDraw instance with library defaults (no default chrome, StaticMode).
 * Hosts call `addToMap` / `removeFromMap` instead of duplicating `new MapDraw`.
 */
export function createMapDrawControl(
  options: CreateMapDrawControlOptions = {},
): MapDrawControlHandle {
  const control = new MapDraw({
    displayControlsDefault: false,
    boxSelect: false,
    styles: getDrawStyles(options.primaryColor, options.activeColor),
    ...options.drawControlOptions,
    modes: {
      ...MapDraw.modes,
      static: StaticMode,
      ...options.drawControlOptions?.modes,
    },
  });

  return {
    control,
    addToMap(map) {
      if (!map.hasControl(control as never)) {
        map.addControl(control as never);
      }
    },
    removeFromMap(map) {
      if (map.hasControl(control as never)) {
        map.removeControl(control as never);
      }
    },
  };
}
