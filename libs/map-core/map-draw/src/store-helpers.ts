import { logHelper } from '@hungpvq/map-core';
import type { Feature, FeatureCollection } from 'geojson';
import type { Emitter } from 'mitt';

import { isDraftOption } from './is-draft-option';
import { logger } from './logger';
import { DrawService } from './services/draw.service';
import type {
  IDraftRecord,
  MapDrawEvent,
  MapDrawOption,
  MapDrawStore,
} from './types/index';
import { MAP_DRAW_EVENT } from './types/index';

/** Default draw store snapshot used by Vue/React map-draw adapters. */
export function createDefaultMapDrawStore(): MapDrawStore {
  return {
    state: {
      featuresAdded: {},
      featuresDeleted: {},
      featuresUpdated: {},
    },
  };
}

export function runDrawSetFeature(
  store: MapDrawStore,
  type: 'added' | 'updated' | 'deleted',
  feature: Feature,
  mapId: string,
) {
  DrawService.setFeature(store, type, feature, mapId);
}

export function runDrawSave(
  store: MapDrawStore,
  collection: FeatureCollection,
  mapId: string,
  context?: { mapId: string } & Record<string, unknown>,
) {
  return DrawService.saveDraw(
    store,
    collection,
    mapId,
    store.config?.callback,
    context,
  );
}

export async function runDrawCommit(
  store: MapDrawStore,
  onCommit?: () => void,
) {
  const action = store.config;
  if (!isDraftOption(action)) return;
  await action.commit();
  onCommit?.();
}

export async function runDrawDiscard(
  store: MapDrawStore,
  item?: IDraftRecord,
  onDiscard?: () => void,
) {
  const action = store.config;
  if (!isDraftOption(action)) return;
  await action.discard(item);
  onDiscard?.();
}

export function runDrawStart(
  store: MapDrawStore,
  emit: Emitter<MapDrawEvent>,
  config: MapDrawOption,
  mapId: string,
) {
  store.config = config;
  logHelper(logger, mapId, 'useMapDraw')
    .with({ fn: 'runDrawStart', span: 'store.init' })
    .debug('Draw session start requested; emitting MAP_DRAW_EVENT.START.', {
      hasConfig: !!config,
    });
  emit.emit(MAP_DRAW_EVENT.START, config);
}
