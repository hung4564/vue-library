import {
  getMap,
  getMapPointerProfile,
  isUsableMapId,
  registerMapStoreCleanup,
  subscribeMapReady,
} from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import type { Feature } from 'geojson';
import { Popup, type MapMouseEvent, type PointLike } from 'maplibre-gl';
import type { IDataset } from '../interfaces/dataset.base';
import { loggerHighlight } from '../logger';
import { handleMenuAction } from '../menu/handle';
import { LIST_VIEW_MENU_ID } from '../menu/items';
import { findSiblingOrNearestLeaf } from '../model/visitors/helpers';
import { convertFeatureToItem } from '../utils/convert';
import { isListView } from '../utils/check';
import type { IListViewUI } from '../model/list/types';
import {
  DEFAULT_HIGHLIGHT_DATA,
  DEFAULT_HIGHLIGHT_PRESENTATION,
  DEFAULT_HIGHLIGHT_SELECTION,
  DEFAULT_HIGHLIGHT_STYLE,
  findHighlightPart,
  resolveShowConfig,
} from './cascade';
import { createHighlightPainter } from './paint';
import {
  pointerEventFromEntry,
  resolvePopupLngLat,
} from './popup';
import {
  datasetsFromHighlightParts,
  filterDatasetsForPointerEvent,
  queryHighlightAtPoint,
} from './query';
import { resolveHighlightData } from './resolve-data';
import type {
  HighlightBindPointerOptions,
  HighlightDataContext,
  HighlightDataSource,
  HighlightEntry,
  HighlightGeoJson,
  HighlightPickOptions,
  HighlightPointOrBox,
  HighlightPresentation,
  HighlightSelectionOptions,
  HighlightShowOptions,
  HighlightSource,
  HighlightStyle,
} from './types';

function openLayerDetailFromHighlight(
  mapId: string,
  dataset: IDataset | undefined,
  feature: Feature,
) {
  if (!dataset) return;
  const list =
    findSiblingOrNearestLeaf<IListViewUI>(dataset, isListView) ??
    (isListView(dataset) ? (dataset as IListViewUI) : undefined);
  if (!list?.hasMenu?.(LIST_VIEW_MENU_ID.item.showDetail)) return;
  const menu = list.getMenu(LIST_VIEW_MENU_ID.item.showDetail);
  if (!menu) return;
  handleMenuAction(menu, {
    mapId,
    layer: list,
    value: convertFeatureToItem(feature),
  });
}

export type HighlightController = {
  readonly entries: readonly HighlightEntry[];
  setDefaultStyle(style: HighlightStyle): void;
  setDefaultData(data: HighlightDataSource): void;
  setDefaultSelection(selection: HighlightSelectionOptions): void;
  setDefaultPresentation(presentation: HighlightPresentation): void;
  setPickDatasets(getter: () => IDataset[]): void;
  show(
    input: HighlightDataContext['input'],
    options?: HighlightShowOptions,
  ): Promise<void>;
  showMany(
    inputs: Array<{
      input: HighlightDataContext['input'];
      options?: HighlightShowOptions;
    }>,
  ): Promise<void>;
  hide(): void;
  hideIfSource(source: HighlightSource): void;
  hideEntry(id: string | number): void;
  pickAt(
    pointOrBox?: HighlightPointOrBox,
    options?: HighlightPickOptions,
  ): Promise<boolean>;
  bindPointer(opts: HighlightBindPointerOptions): () => void;
  subscribe(listener: () => void): () => void;
  destroy(): void;
};

type ControllerState = {
  entries: HighlightEntry[];
  defaultStyle: HighlightStyle;
  defaultData: HighlightDataSource;
  defaultSelection: HighlightSelectionOptions;
  defaultPresentation: HighlightPresentation;
  pickDatasets: () => IDataset[];
  listeners: Set<() => void>;
  abort?: AbortController;
  presentationCleanups: Map<string | number, () => void>;
  /** Active bindPointer unbind fns — destroy() must run them all. */
  pointerUnbinds: Set<() => void>;
  maplibrePopup?: Popup;
};

const controllers = new Map<string, HighlightController>();

function entryIdFromFeature(
  feature: HighlightGeoJson,
  fallback: string,
): string | number {
  if (feature.type === 'FeatureCollection') {
    const id = feature.features[0]?.id;
    if (typeof id === 'string' || typeof id === 'number') return id;
    const propId = feature.features[0]?.properties?.['id'];
    if (typeof propId === 'string' || typeof propId === 'number') return propId;
  } else {
    const id = feature.id;
    if (typeof id === 'string' || typeof id === 'number') return id;
    const propId = feature.properties?.['id'];
    if (typeof propId === 'string' || typeof propId === 'number') return propId;
  }
  return fallback;
}

function notify(state: ControllerState) {
  for (const fn of state.listeners) fn();
}

function applyPresentationShow(
  mapId: string,
  state: ControllerState,
  entry: HighlightEntry,
  presentation: HighlightPresentation,
) {
  const map = getMap(mapId);
  if (!map) return;
  state.presentationCleanups.get(entry.id)?.();
  state.presentationCleanups.delete(entry.id);

  const cleanup = presentation.onShow?.(entry, {
    map,
    pointerLngLat: entry.pointerLngLat,
    pointerEvent: pointerEventFromEntry(entry),
  });
  if (typeof cleanup === 'function') {
    state.presentationCleanups.set(entry.id, cleanup);
  }

  const popupOpt = presentation.popup;
  if (!popupOpt) return;
  const kind =
    popupOpt === true ? 'maplibre' : (popupOpt.kind ?? 'maplibre');
  if (kind === 'none') return;
  if (kind === 'maplibre') {
    state.maplibrePopup?.remove();
    const content =
      typeof popupOpt === 'object' && popupOpt.content
        ? typeof popupOpt.content === 'function'
          ? popupOpt.content(entry)
          : popupOpt.content
        : String(
            (entry.feature as Feature).properties?.['name'] ?? entry.id,
          );
    const popup = new Popup({
      offset: typeof popupOpt === 'object' ? popupOpt.offset ?? 12 : 12,
      closeOnClick: true,
    });
    const lngLat = resolvePopupLngLat(entry, presentation, map);
    if (lngLat) {
      popup.setLngLat(lngLat);
      if (typeof content === 'string') {
        popup.setHTML(content);
      } else {
        popup.setDOMContent(content);
      }
      popup.addTo(map as never);
      state.maplibrePopup = popup;
    }
  }
}

function applyPresentationHide(
  state: ControllerState,
  entry: HighlightEntry,
  presentation: HighlightPresentation,
) {
  presentation.onHide?.(entry);
  state.presentationCleanups.get(entry.id)?.();
  state.presentationCleanups.delete(entry.id);
  state.maplibrePopup?.remove();
  state.maplibrePopup = undefined;
}

function createController(mapId: string): HighlightController {
  const state: ControllerState = {
    entries: [],
    defaultStyle: { ...DEFAULT_HIGHLIGHT_STYLE },
    defaultData: { ...DEFAULT_HIGHLIGHT_DATA },
    defaultSelection: { ...DEFAULT_HIGHLIGHT_SELECTION },
    defaultPresentation: { ...DEFAULT_HIGHLIGHT_PRESENTATION },
    pickDatasets: () => [],
    listeners: new Set(),
    presentationCleanups: new Map(),
    pointerUnbinds: new Set(),
  };
  const painter = createHighlightPainter(mapId);

  function repaint(onDone?: () => void) {
    getMap(mapId, (map) => {
      const latest = state.entries[state.entries.length - 1];
      const part = findHighlightPart(latest?.dataset);
      painter.paint(map, state.entries, part, onDone);
    });
  }

  function presentationFor(entry: HighlightEntry) {
    return resolveShowConfig(undefined, findHighlightPart(entry.dataset), {
      style: state.defaultStyle,
      data: state.defaultData,
      selection: state.defaultSelection,
      presentation: state.defaultPresentation,
    }).presentation;
  }

  function clearAllPresentations() {
    for (const entry of [...state.entries]) {
      applyPresentationHide(state, entry, presentationFor(entry));
    }
  }

  async function show(
    input: HighlightDataContext['input'],
    options?: HighlightShowOptions,
  ): Promise<void> {
    state.abort?.abort();
    const abort = new AbortController();
    state.abort = abort;

    const part = findHighlightPart(options?.dataset);
    const resolved = resolveShowConfig(options, part, {
      style: state.defaultStyle,
      data: state.defaultData,
      selection: state.defaultSelection,
      presentation: state.defaultPresentation,
    });

    const map = getMap(mapId);
    if (!map) {
      loggerHighlight.warn('show: map not ready', { mapId });
      return;
    }

    const source = options?.source;

    let geojson: HighlightGeoJson | null = null;
    try {
      geojson = await resolveHighlightData(resolved.data, {
        mapId,
        map,
        dataset: options?.dataset,
        input,
        source,
        signal: abort.signal,
      });
    } catch (err) {
      options?.onError?.(err, { mapId });
      return;
    }
    if (abort.signal.aborted) return;
    if (!geojson) {
      options?.onError?.(new Error('No highlight geometry'), { mapId });
      return;
    }

    const id = entryIdFromFeature(geojson, getUUIDv4());
    const entry: HighlightEntry = {
      id,
      feature: geojson,
      dataset: options?.dataset,
      source,
      style: resolved.style,
      data: resolved.data,
      pointerLngLat: options?.pointerLngLat,
      pointerPoint: options?.pointerPoint,
      pointerEventType: options?.pointerEventType,
    };

    const policy = resolved.selection.policy ?? 'single';
    const replaceScope = resolved.selection.replaceScope ?? 'source';
    const maxEntries = resolved.selection.maxEntries;

    if (policy === 'single') {
      const kept =
        replaceScope === 'source' && source
          ? state.entries.filter((e) => e.source !== source)
          : [];
      for (const prev of state.entries) {
        if (kept.includes(prev)) continue;
        applyPresentationHide(state, prev, presentationFor(prev));
      }
      state.entries = [...kept, entry];
    } else {
      state.entries = [...state.entries.filter((e) => e.id !== id), entry];
      if (maxEntries != null && state.entries.length > maxEntries) {
        const dropped = state.entries.splice(
          0,
          state.entries.length - maxEntries,
        );
        for (const d of dropped) {
          applyPresentationHide(state, d, presentationFor(d));
        }
      }
    }

    applyPresentationShow(mapId, state, entry, resolved.presentation);
    notify(state);

    if (
      source === 'pointer' &&
      resolved.presentation.clickAction === 'detail' &&
      entry.feature
    ) {
      const feature =
        entry.feature.type === 'FeatureCollection'
          ? entry.feature.features[0]
          : entry.feature;
      if (feature) {
        openLayerDetailFromHighlight(mapId, options?.dataset, feature);
      }
    }

    const durationMs = resolved.style.durationMs ?? 5000;
    repaint(() => {
      if (durationMs > 0) hide();
    });
  }

  function hide() {
    state.abort?.abort();
    clearAllPresentations();
    state.entries = [];
    getMap(mapId, (map) => painter.stop(map));
    notify(state);
  }

  function hideIfSource(source: HighlightSource) {
    const removed = state.entries.filter((e) => e.source === source);
    if (!removed.length) return;
    for (const e of removed) {
      applyPresentationHide(state, e, presentationFor(e));
    }
    state.entries = state.entries.filter((e) => e.source !== source);
    if (!state.entries.length) {
      getMap(mapId, (map) => painter.stop(map));
    } else {
      repaint();
    }
    notify(state);
  }

  function hideEntry(id: string | number) {
    const entry = state.entries.find((e) => e.id === id);
    if (!entry) return;
    applyPresentationHide(state, entry, presentationFor(entry));
    state.entries = state.entries.filter((e) => e.id !== id);
    if (!state.entries.length) {
      getMap(mapId, (map) => painter.stop(map));
    } else {
      repaint();
    }
    notify(state);
  }

  async function pickAt(
    pointOrBox?: HighlightPointOrBox,
    options?: HighlightPickOptions,
  ): Promise<boolean> {
    const partsOrDatasets = filterDatasetsForPointerEvent(
      state.pickDatasets(),
      options?.source === 'hover' ? 'hover' : 'click',
    );
    const datasets = datasetsFromHighlightParts(partsOrDatasets);
    const hit = await queryHighlightAtPoint(
      mapId,
      datasets.length ? datasets : partsOrDatasets,
      pointOrBox as PointLike | [PointLike, PointLike] | undefined,
    );
    if (!hit) {
      if (options?.source === 'hover') hideIfSource('hover');
      else if (options?.source === 'pointer') {
        hideIfSource('pointer');
      }
      return false;
    }
    const styleOverride =
      options?.style ?? options?.styleForDataset?.(hit.dataset);
    await show(hit.feature, {
      dataset: hit.dataset,
      source: options?.source ?? 'pointer',
      style: styleOverride,
      data: options?.data,
      selection: options?.selection,
      presentation: options?.presentation,
      pointerLngLat: options?.pointerLngLat,
      pointerPoint: options?.pointerPoint,
      pointerEventType: options?.pointerEventType,
    });
    return true;
  }

  function bindPointer(opts: HighlightBindPointerOptions): () => void {
    const cleanups: Array<() => void> = [];
    let cancelled = false;
    let lastHoverId: string | undefined;

    const unsubscribeReady = subscribeMapReady(mapId, (map) => {
      if (cancelled) return;
      if (opts.click) {
        const handler = (e: MapMouseEvent) => {
          void pickAt(e.point, {
            source: 'pointer',
            style: opts.style,
            styleForDataset: opts.styleForDataset,
            pointerLngLat: [e.lngLat.lng, e.lngLat.lat],
            pointerPoint: { x: e.point.x, y: e.point.y },
            pointerEventType: 'click',
          });
        };
        map.on('click', handler);
        cleanups.push(() => map.off('click', handler));
      }
      if (opts.hover) {
        const { hoverCapable } = getMapPointerProfile();
        if (hoverCapable) {
          const handler = (e: MapMouseEvent) => {
            void (async () => {
              const partsOrDatasets = filterDatasetsForPointerEvent(
                state.pickDatasets(),
                'hover',
              );
              const datasets = datasetsFromHighlightParts(partsOrDatasets);
              const hit = await queryHighlightAtPoint(
                mapId,
                datasets.length ? datasets : partsOrDatasets,
                e.point,
              );
              if (!hit) {
                lastHoverId = undefined;
                hideIfSource('hover');
                return;
              }
              const id = String(hit.feature.id ?? '');
              if (id && id === lastHoverId) return;
              lastHoverId = id;
              await show(hit.feature, {
                dataset: hit.dataset,
                source: 'hover',
                style: opts.style ?? opts.styleForDataset?.(hit.dataset),
                selection: { policy: 'single', replaceScope: 'source' },
                pointerLngLat: [e.lngLat.lng, e.lngLat.lat],
                pointerPoint: { x: e.point.x, y: e.point.y },
                pointerEventType: 'mousemove',
              });
            })();
          };
          map.on('mousemove', handler);
          cleanups.push(() => map.off('mousemove', handler));
        }
      }
    });

    const unbind = () => {
      cancelled = true;
      unsubscribeReady();
      for (const c of cleanups) c();
      cleanups.length = 0;
      state.pointerUnbinds.delete(unbind);
    };
    state.pointerUnbinds.add(unbind);
    return unbind;
  }

  return {
    get entries() {
      return state.entries;
    },
    setDefaultStyle(style) {
      state.defaultStyle = { ...state.defaultStyle, ...style };
    },
    setDefaultData(data) {
      state.defaultData = data;
    },
    setDefaultSelection(selection) {
      state.defaultSelection = { ...state.defaultSelection, ...selection };
    },
    setDefaultPresentation(presentation) {
      state.defaultPresentation = {
        ...state.defaultPresentation,
        ...presentation,
      };
    },
    setPickDatasets(getter) {
      state.pickDatasets = getter;
    },
    show,
    showMany: async (inputs) => {
      for (const item of inputs) {
        await show(item.input, {
          ...item.options,
          selection: {
            policy: 'multiple',
            ...item.options?.selection,
          },
        });
      }
    },
    hide,
    hideIfSource,
    hideEntry,
    pickAt,
    bindPointer,
    subscribe(listener) {
      state.listeners.add(listener);
      return () => {
        state.listeners.delete(listener);
      };
    },
    destroy() {
      for (const unbind of [...state.pointerUnbinds]) unbind();
      state.pointerUnbinds.clear();
      hide();
      state.listeners.clear();
      controllers.delete(mapId);
    },
  };
}

const noop = (): void => undefined;

const noopHighlightController: HighlightController = {
  entries: [],
  setDefaultStyle: noop,
  setDefaultData: noop,
  setDefaultSelection: noop,
  setDefaultPresentation: noop,
  setPickDatasets: noop,
  async show() {
    return undefined;
  },
  async showMany() {
    return undefined;
  },
  hide: noop,
  hideIfSource: noop,
  hideEntry: noop,
  async pickAt() {
    return false;
  },
  bindPointer() {
    return noop;
  },
  subscribe() {
    return noop;
  },
  destroy: noop,
};

export function getHighlightController(mapId: string): HighlightController {
  if (!isUsableMapId(mapId)) {
    return noopHighlightController;
  }
  let ctrl = controllers.get(mapId);
  if (!ctrl) {
    ctrl = createController(mapId);
    controllers.set(mapId, ctrl);
    registerMapStoreCleanup(mapId, 'highlight', () => {
      destroyHighlightController(mapId);
    });
  }
  return ctrl;
}

export function destroyHighlightController(mapId: string) {
  controllers.get(mapId)?.destroy();
}
