import type { Feature } from 'geojson';
import { isDraftOption } from './is-draft-option';
import type { IDraftRecord, MapDrawOption } from './types/index';

/**
 * Ensure top-level `feature.id` exists when only `properties.id` is set
 * (query hits / promoteId sources). Mutates and returns the same feature.
 */
export function ensureFeatureId(feature: Feature): Feature {
  if (feature.id == null && feature.properties?.['id'] != null) {
    feature.id = feature.properties['id'] as string | number;
  }
  return feature;
}

/** Empty draft list snapshot (after commit). */
export function emptyDraftListSnapshot(): {
  items: IDraftRecord[];
  count: number;
} {
  return { items: [], count: 0 };
}

/**
 * Refresh draft list + count from a draw option.
 * Returns `undefined` when the option is not draft-capable (adapters leave
 * previous state unchanged, matching historical Vue/React behavior).
 */
export function getDraftListSnapshot(
  option: MapDrawOption | undefined,
): { items: IDraftRecord[]; count: number } | undefined {
  if (!isDraftOption(option)) {
    return undefined;
  }
  const items = option.getDraftItems();
  return { items, count: items.length };
}

/**
 * Classify a `draw.create` feature for the draft store.
 * Selecting an existing feature for edit also fires create — treat as update.
 */
export function classifyDrawCreateFeature(
  method: string,
): 'updated' | 'added' {
  return method === 'select' ? 'updated' : 'added';
}

/**
 * Side effects for select/delete tool modes (pure description).
 * Adapters: detach map click → set method → apply these → attach click if needed.
 */
export function getDrawModeSelectEffects(_value: 'select' | 'delete'): {
  attachMapClick: boolean;
  drawMode: 'static';
} {
  return { attachMapClick: true, drawMode: 'static' };
}

/**
 * Side effects when entering a create draw mode (point/line/…).
 * Adapters: detach map click → set method create → changeMode(drawMode).
 */
export function getDrawCreateModeEffects(drawMode: string): {
  method: 'create';
  drawMode: string;
  isDraw: true;
  detachMapClick: true;
} {
  return {
    method: 'create',
    drawMode,
    isDraw: true,
    detachMapClick: true,
  };
}

/**
 * mapbox-gl-draw: `direct_select` does not support Point geometries.
 */
export function getFeatureEditMode(
  feature: Feature,
  featureIds: string[],
):
  | { mode: 'simple_select'; options: { featureIds: string[] } }
  | { mode: 'direct_select'; options: { featureId: string } } {
  if (feature.geometry?.type === 'Point') {
    return { mode: 'simple_select', options: { featureIds } };
  }
  return {
    mode: 'direct_select',
    options: { featureId: featureIds[0]! },
  };
}
