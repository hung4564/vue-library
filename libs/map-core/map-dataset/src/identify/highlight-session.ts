import type { Feature, Geometry } from 'geojson';
import { getHighlightController } from '../highlight/controller';
import type { HighlightSource } from '../highlight/types';
import type { IDataset } from '../interfaces/dataset.base';
import { convertItemToFeature } from '../utils/convert';
import { closeIdentifyExclusiveUi } from './close-exclusive-ui';
import type { IdentifyResultGroupedItem } from './result';

/** UX-owned highlight intents (map to {@link HighlightSource}). */
export type HighlightSessionIntent =
  | 'detail'
  | 'identify'
  | 'attribute-table'
  | 'hover'
  | 'pointer';

function intentToSource(intent: HighlightSessionIntent): HighlightSource {
  return intent;
}

function featureIdFromItem(item: unknown): string | number | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const row = item as { id?: unknown; properties?: { id?: unknown } };
  if (typeof row.id === 'string' || typeof row.id === 'number') return row.id;
  const propId = row.properties?.id;
  if (typeof propId === 'string' || typeof propId === 'number') return propId;
  return undefined;
}

function toFeature(input: Feature | Record<string, unknown>): Feature | null {
  if (
    input &&
    typeof input === 'object' &&
    'type' in input &&
    (input as Feature).type === 'Feature' &&
    'geometry' in input &&
    (input as Feature).geometry
  ) {
    return input as Feature;
  }
  const row = input as {
    id?: string | number;
    geometry?: Geometry;
    [key: string]: unknown;
  };
  if (!row.geometry) return null;
  return convertItemToFeature(
    row as { id?: string | number; geometry: Geometry; [key: string]: unknown },
  );
}

/** Paint a session-owned highlight (cascade / part `durationMs` applies). */
export async function paintHighlight(
  mapId: string,
  options: {
    intent: HighlightSessionIntent;
    feature: Feature | Record<string, unknown>;
    dataset?: IDataset;
  },
): Promise<void> {
  const feature = toFeature(options.feature);
  if (!feature?.geometry) return;
  await getHighlightController(mapId).show(feature, {
    source: intentToSource(options.intent),
    dataset: options.dataset,
  });
}

/**
 * Paint many features for one intent (AttributeTable multi-select).
 * Clears that intent first so deselected rows do not linger.
 */
export async function paintHighlights(
  mapId: string,
  options: {
    intent: HighlightSessionIntent;
    features: Array<Feature | Record<string, unknown>>;
    dataset?: IDataset;
  },
): Promise<void> {
  clearHighlight(mapId, options.intent);
  const features = options.features
    .map((f) => toFeature(f))
    .filter((f): f is Feature => !!f?.geometry);
  if (!features.length) return;
  if (features.length === 1) {
    await paintHighlight(mapId, {
      intent: options.intent,
      feature: features[0]!,
      dataset: options.dataset,
    });
    return;
  }
  const source = intentToSource(options.intent);
  await getHighlightController(mapId).showMany(
    features.map((feature) => ({
      input: feature,
      options: {
        source,
        dataset: options.dataset,
        selection: { policy: 'multiple' as const },
      },
    })),
  );
}

export function clearHighlight(
  mapId: string,
  target:
    | HighlightSessionIntent
    | { featureId: string | number }
    | 'identify-session',
): void {
  const hl = getHighlightController(mapId);
  if (target === 'identify-session') {
    hl.hideIfSource('identify');
    return;
  }
  if (typeof target === 'object' && 'featureId' in target) {
    hl.hideEntry(target.featureId);
    return;
  }
  hl.hideIfSource(intentToSource(target));
}

/** Close LayerDetail: clear detail source + that feature’s entries. */
export function onDetailClose(mapId: string, item?: unknown): void {
  const hl = getHighlightController(mapId);
  hl.hideIfSource('detail');
  const id = featureIdFromItem(item);
  if (id != null) hl.hideEntry(id);
}

/** Turn off Identify: dismiss exclusive UI + clear identify highlights. */
export function onIdentifyClose(mapId: string): void {
  closeIdentifyExclusiveUi(mapId);
  getHighlightController(mapId).hideIfSource('identify');
}

/** While Identify owns map click, disable pointer-click pick (hover OK). */
export function syncIdentifyPointerPick(
  mapId: string,
  clickActive: boolean,
): void {
  getHighlightController(mapId).setPointerClickEnabled(!clickActive);
}

/** Paint identify highlight for a focused result-panel child row. */
export async function paintIdentifyResultFocus(
  mapId: string,
  child: IdentifyResultGroupedItem | null | undefined,
): Promise<void> {
  if (!child) {
    clearHighlight(mapId, 'identify-session');
    return;
  }
  const data = child.data;
  if (!data || typeof data !== 'object') {
    clearHighlight(mapId, 'identify-session');
    return;
  }
  const feature = toFeature(data as Record<string, unknown>);
  if (!feature?.geometry) {
    clearHighlight(mapId, 'identify-session');
    return;
  }
  await paintHighlight(mapId, {
    intent: 'identify',
    feature,
    dataset: child.identify,
  });
}

export function clearIdentifyResultHighlight(mapId: string): void {
  clearHighlight(mapId, 'identify-session');
}
