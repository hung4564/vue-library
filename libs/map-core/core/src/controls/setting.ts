import type { SpriteSpecification } from 'maplibre-gl';

import type { MapSimple } from '../types';

export type MapStyleSetting = {
  zoom?: number;
  center: [number, number];
  sprite?: SpriteSpecification;
  glyphs?: string;
};

export function spriteToInput(sprite?: SpriteSpecification): string {
  if (sprite == null) return '';
  return typeof sprite === 'string' ? sprite : JSON.stringify(sprite);
}

export function inputToSprite(value?: string): SpriteSpecification | undefined {
  if (!value?.trim()) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as SpriteSpecification;
    }
  } catch {
    // keep as url string
  }
  return value;
}

export function readMapStyleSettings(map: MapSimple): MapStyleSetting {
  const style = map.getStyle();
  return {
    zoom: map.getZoom(),
    center: [+map.getCenter().lng.toFixed(6), +map.getCenter().lat.toFixed(6)],
    sprite: style.sprite,
    glyphs: style.glyphs,
  };
}

export function applyMapStyleSettings(
  map: MapSimple,
  setting: MapStyleSetting,
): void {
  if (setting.zoom) map.setZoom(setting.zoom);
  if (setting.center) map.setCenter(setting.center);
  const style = map.getStyle();
  if (setting.sprite) {
    style.sprite = setting.sprite;
  }
  if (setting.glyphs) {
    style.glyphs = setting.glyphs;
  }
  map.setStyle(style);
}
