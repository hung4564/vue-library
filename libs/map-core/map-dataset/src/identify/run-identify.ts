import { logHelper } from '@hungpvq/map-core';
import type { MapMouseEvent, PointLike } from 'maplibre-gl';
import type { IdentifyMultiResult, IIdentifyView } from '../interfaces/dataset.parts';
import { loggerIdentify } from '../logger';
import {
  handleMultiIdentify,
  handleMultiIdentifyGetFirst,
} from './models';
import { identifyResolver } from './resolver';
import {
  IDENTIFY_ALL_LAYERS_VALUE,
  type IdentifyResultLayerItem,
  type IdentifyResultUpdatePayload,
} from './result';

/** Pure loading log event names used by IdentifyControl / IdentifyShowFirstControl. */
export const IDENTIFY_LOADING_LOG = {
  start: 'loading:start',
  done: 'loading:done',
} as const;

export function filterIdentifiesForControl<T extends IIdentifyView>(
  views: T[],
  filterIdentifyId?: string,
): T[] {
  if (!filterIdentifyId) return views;
  return views.filter((view) => view.id === filterIdentifyId);
}

export function filterNonEmptyIdentifyResults(
  features: IdentifyMultiResult[],
): IdentifyMultiResult[] {
  return features.filter(
    (item): item is IdentifyMultiResult =>
      'features' in item && item.features.length > 0,
  );
}

export function buildIdentifyLayerItems(
  views: IIdentifyView[],
  allLayersText: string,
): IdentifyResultLayerItem[] {
  return [
    {
      value: IDENTIFY_ALL_LAYERS_VALUE,
      text: allLayersText,
    },
    ...views.map((view) => ({
      value: view.id,
      text: view.getName?.() || view.id,
    })),
  ];
}

export function resolveIdentifyLayerFilterId(
  identifyId: string,
): string | undefined {
  if (!identifyId || identifyId === IDENTIFY_ALL_LAYERS_VALUE) {
    return undefined;
  }
  return identifyId;
}

export function buildIdentifyResultPanelBase(options: {
  loading: boolean;
  origin: { latitude: number; longitude: number };
  views: IIdentifyView[];
  allLayersText: string;
  selectedLayerId?: string;
  isEventClickActive: boolean;
  isEventClickBox: boolean;
}): IdentifyResultUpdatePayload {
  return {
    loading: options.loading,
    origin: options.origin,
    layerItems: buildIdentifyLayerItems(options.views, options.allLayersText),
    selectedLayerId:
      options.selectedLayerId ?? IDENTIFY_ALL_LAYERS_VALUE,
    isEventClickActive: options.isEventClickActive,
    isEventClickBox: options.isEventClickBox,
  };
}

export type RunIdentifyMultiOptions = {
  identifies: IIdentifyView[];
  mapId: string;
  pointOrBox: PointLike | [PointLike, PointLike];
  event?: MapMouseEvent;
  filterIdentifyId?: string;
  preferResultControl?: boolean;
};

export type RunIdentifyResult = {
  records: IdentifyMultiResult[];
  hitCount: number;
  featureCount: number;
  durationMs: number;
  empty: boolean;
};

/**
 * Shared IdentifyControl query path: filter → handleMultiIdentify →
 * nonEmpty → identifyResolver. UI/loading/cursor stay in adapters.
 */
export async function runIdentifyMulti(
  options: RunIdentifyMultiOptions,
): Promise<RunIdentifyResult> {
  const {
    identifies,
    mapId,
    pointOrBox,
    event,
    filterIdentifyId,
    preferResultControl,
  } = options;
  const log = logHelper(loggerIdentify, mapId, 'MULTI', 'IdentifyControl');
  const loadStartedAt = performance.now();
  log.info(IDENTIFY_LOADING_LOG.start, { pointOrBox });

  const filtered = filterIdentifiesForControl(identifies, filterIdentifyId);
  log.debug('onGetFeatures', {
    pointOrBox,
    identifies: filtered,
    filterId: filterIdentifyId,
  });

  const features = await handleMultiIdentify(filtered, mapId, pointOrBox);
  log.debug('onGetFeatures', { features });

  const nonEmpty = filterNonEmptyIdentifyResults(features);
  const hitCount = nonEmpty.length;
  const featureCount = nonEmpty.reduce(
    (sum, item) => sum + (item.features?.length ?? 0),
    0,
  );

  log.debug('onSelectFeatures', nonEmpty);
  const res = await identifyResolver.execute({
    records: nonEmpty,
    mapId,
    event,
    singleLayer: !!filterIdentifyId,
    preferResultControl: !!preferResultControl,
  });
  log.debug('onSelectFeaturesResult', res);

  const durationMs = Math.round(performance.now() - loadStartedAt);
  log.info(IDENTIFY_LOADING_LOG.done, {
    durationMs,
    hitCount,
    featureCount,
    empty: featureCount === 0,
  });

  return {
    records: nonEmpty,
    hitCount,
    featureCount,
    durationMs,
    empty: featureCount === 0,
  };
}

export type RunIdentifyShowFirstOptions = {
  identifies: IIdentifyView[];
  mapId: string;
  pointOrBox: PointLike | [PointLike, PointLike];
  event?: MapMouseEvent;
  preferResultControl?: boolean;
};

/**
 * Shared IdentifyShowFirstControl path: get-first → resolver (singleLayer).
 */
export async function runIdentifyShowFirst(
  options: RunIdentifyShowFirstOptions,
): Promise<RunIdentifyResult> {
  const { identifies, mapId, pointOrBox, event, preferResultControl } =
    options;
  const log = logHelper(
    loggerIdentify,
    mapId,
    'FIRST',
    'IdentifyShowFirstControl',
  );
  const loadStartedAt = performance.now();
  log.info(IDENTIFY_LOADING_LOG.start, { pointOrBox });
  log.debug('onGetFeatures', { pointOrBox });

  const record = await handleMultiIdentifyGetFirst(
    identifies,
    mapId,
    pointOrBox,
  );
  log.debug('onGetFeatures', { record });

  const records =
    record?.features?.length ? [record] : ([] as IdentifyMultiResult[]);
  const featureCount = record?.features?.length ?? 0;

  log.debug('onSelectFeatures', { record });
  const res = await identifyResolver.execute({
    records,
    mapId,
    event,
    singleLayer: true,
    preferResultControl: !!preferResultControl,
  });
  log.debug('onSelectFeaturesResult', res);

  const durationMs = Math.round(performance.now() - loadStartedAt);
  log.info(IDENTIFY_LOADING_LOG.done, {
    durationMs,
    featureCount,
    empty: featureCount === 0,
  });

  return {
    records,
    hitCount: records.length,
    featureCount,
    durationMs,
    empty: featureCount === 0,
  };
}
