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
export function classifyDrawCreateFeature(method: string): 'updated' | 'added' {
  return method === 'select' ? 'updated' : 'added';
}

/**
 * Side effects for select/delete tool modes (pure description).
 * Adapters: detach map click → set method → apply these → attach click if needed.
 */
export function getDrawModeSelectEffects(value: 'select' | 'delete'): {
  attachMapClick: boolean;
  drawMode: 'static';
} {
  void value; // select and delete share the same attach/static effects today
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
    options: { featureId: featureIds[0] ?? '' },
  };
}

/** Minimal MapDraw surface used by select/edit helpers (avoids full class type). */
export type MapDrawEditControl = {
  add: (collection: {
    type: 'FeatureCollection';
    features: Feature[];
  }) => string[];
  delete: (id: string) => void;
  changeMode: (mode: string, options?: Record<string, unknown>) => void;
};

/** Apply {@link getFeatureEditMode} on a MapDraw control. */
export function applyFeatureEditMode(
  control: MapDrawEditControl,
  feature: Feature,
  featureIds: string[],
): void {
  const edit = getFeatureEditMode(feature, featureIds);
  if (edit.mode === 'simple_select') {
    control.changeMode('simple_select', edit.options);
  } else {
    control.changeMode('direct_select', edit.options);
  }
}

export type DrawMapClickResult =
  | { kind: 'none' }
  | { kind: 'select'; feature: Feature; enteredEdit: boolean }
  | { kind: 'delete'; feature: Feature };

/**
 * Shared select/delete map-click path for DrawControl (Vue ↔ React).
 */
export async function handleDrawMapClick(options: {
  method: string;
  drawOption: MapDrawOption | undefined;
  control: MapDrawEditControl;
  mapId: string;
  point: [number, number];
  setFeature: (type: 'added' | 'updated' | 'deleted', feature: Feature) => void;
  detachMapClick?: () => void;
}): Promise<DrawMapClickResult> {
  const {
    method,
    drawOption,
    control,
    mapId,
    point,
    setFeature,
    detachMapClick,
  } = options;
  if (!drawOption?.selectFeature) {
    return { kind: 'none' };
  }
  const feature = await drawOption.selectFeature({ point }, { mapId });
  if (!feature) {
    return { kind: 'none' };
  }
  ensureFeatureId(feature);

  if (method === 'select') {
    setFeature('updated', feature);
    const featureIds = control.add({
      type: 'FeatureCollection',
      features: [feature],
    });
    let enteredEdit = false;
    if (featureIds?.length) {
      enteredEdit = true;
      detachMapClick?.();
      applyFeatureEditMode(control, feature, featureIds);
    }
    return { kind: 'select', feature, enteredEdit };
  }

  if (method === 'delete') {
    if (feature.id != null) {
      control.delete(String(feature.id));
    }
    await drawOption.deleteFeature?.(feature, { mapId });
    return { kind: 'delete', feature };
  }

  return { kind: 'none' };
}
