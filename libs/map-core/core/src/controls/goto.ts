import type { MapSimple } from '../types';
import { parseCoordinateText } from '../utils/coordinate';

export type GotoSetting = {
  zoom?: number;
  center: [number, number];
};

export function readGotoSetting(map: MapSimple): GotoSetting {
  return {
    zoom: map.getZoom(),
    center: [
      +map.getCenter().lng.toFixed(6),
      +map.getCenter().lat.toFixed(6),
    ],
  };
}

export function applyGotoSetting(map: MapSimple, setting: GotoSetting): void {
  if (setting.zoom) map.setZoom(setting.zoom);
  if (setting.center) map.setCenter(setting.center);
}

/** Parse clipboard / pasted text into a partial GotoSetting, or undefined. */
export function gotoSettingFromCoordinateText(
  text: string,
): Partial<GotoSetting> | undefined {
  const parsed = parseCoordinateText(text || '');
  if (!parsed) return undefined;
  const next: Partial<GotoSetting> = {
    center: [parsed.lng, parsed.lat],
  };
  if (parsed.zoom != null) next.zoom = parsed.zoom;
  return next;
}
