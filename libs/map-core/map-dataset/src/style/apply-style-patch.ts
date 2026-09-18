/**
 * Immutable StyleControl layer patches (Vue ↔ React parity).
 */

import type { LayerSpecification } from 'maplibre-gl';
import type { Tab } from './type';

function cloneLayer(layer: LayerSpecification): LayerSpecification {
  return JSON.parse(JSON.stringify(layer)) as LayerSpecification;
}

/**
 * Apply a StyleControl tab value onto a layer copy (paint/layout bag).
 * Returns the original layer unchanged for dividers / missing keys.
 */
export function applyStyleTabValue(
  layer: LayerSpecification,
  tab: Tab,
  raw: unknown,
): LayerSpecification {
  if (tab.type === 'divider' || !('key' in tab) || tab.key == null) {
    return layer;
  }
  let nextValue = raw;
  if (tab.format) {
    nextValue = tab.format(nextValue);
  }
  const next = cloneLayer(layer);
  const part = tab.part || 'paint';
  const bag = {
    ...((next[part] as Record<string, unknown> | undefined) || {}),
    [String(tab.key)]: nextValue,
  };
  (next as Record<string, unknown>)[part] = bag;
  return next;
}

/** Set `min-zoom` / `max-zoom` on a layer copy. */
export function applyStyleZoom(
  layer: LayerSpecification,
  key: 'min-zoom' | 'max-zoom',
  zoom: number,
): LayerSpecification {
  const next = cloneLayer(layer) as LayerSpecification & {
    'min-zoom'?: number;
    'max-zoom'?: number;
  };
  next[key] = zoom;
  return next;
}
