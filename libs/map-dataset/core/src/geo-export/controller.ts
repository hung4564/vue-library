import type { IDataset } from '../interfaces/dataset.base';
import {
  createMenuClickAddComponentBuilder,
  type MenuClickAddComponent,
} from '../menu/builder';
import { getGeoExportActiveSource } from './active-source';
import { GEO_EXPORT_DEFAULT_CRS, resolveGeoExportCrs } from './crs';
import { exportFeatureCollectionGeo } from './dataset';
import { resolveGeoExportOption } from './dataset-part';
import { downloadBlob, sanitizeExportFilename } from './download';
import {
  GEO_EXPORT_COMPONENT_KEY,
  type GeoExportContext,
  type GeoExportOptions,
  type GeoExportRunOptions,
  type GeoExportScope,
  type GeoExportUiMode,
} from './options';
import { resolveExportCollection } from './resolve-collection';
import {
  GEO_EXPORT_FORMAT_META,
  GEO_EXPORT_FORMATS,
  type GeoExportFormat,
} from './types';

export type GeoExportControllerReason = 'busy' | 'error' | 'idle';

export type GeoExportControllerEvent = {
  type: 'change';
  reason: GeoExportControllerReason;
};

export type GeoExportControllerState = {
  busy: boolean;
  error: string;
  uiMode: GeoExportUiMode;
};

export type GeoExportController = {
  getState(): GeoExportControllerState;
  getOptions(): GeoExportOptions;
  getUiMode(): GeoExportUiMode;
  getFormats(): GeoExportFormat[];
  getScopes(): GeoExportScope[];
  suggestDefaultScope(mapId?: string): GeoExportScope;
  resolveFilename(override?: string): string;
  canExport(): boolean;
  subscribe(listener: (event: GeoExportControllerEvent) => void): () => void;
  /** `addComponent` payload for the modal shell. */
  createExportGeoAddComponent(mapId?: string): MenuClickAddComponent;
  /**
   * Runs export. Returns `false` when skipped (`disposed` / already `busy`);
   * otherwise `true` after a successful run (throws on failure).
   */
  run(options?: GeoExportRunOptions): Promise<boolean>;
  dispose(): void;
};

function resolveFilenameValue(
  layer: IDataset,
  filename?: string | ((layer: IDataset) => string),
): string {
  if (typeof filename === 'function') return filename(layer);
  return filename || layer.getName?.() || 'layer';
}

/** Built-in local export: resolve collection → reproject/convert → download. */
export async function defaultGeoExport(ctx: GeoExportContext): Promise<void> {
  throwIfAborted(ctx.signal);
  await ctx.downloadLocal(ctx.format);
}

function throwIfAborted(signal?: AbortSignal) {
  if (!signal?.aborted) return;
  const err = new Error('Export aborted');
  err.name = 'AbortError';
  throw err;
}

export type CreateGeoExportControllerOptions = GeoExportOptions & {
  mapId?: string;
};

export function createGeoExportController(
  layer: IDataset,
  options: CreateGeoExportControllerOptions = {},
): GeoExportController {
  const resolved = resolveGeoExportOption(layer, options) ?? {};
  const mapIdDefault = options.mapId;

  let disposed = false;
  const state: GeoExportControllerState = {
    busy: false,
    error: '',
    uiMode:
      resolved.uiMode === 'menu' || resolved.uiMode === 'click'
        ? resolved.uiMode
        : 'modal',
  };
  const listeners = new Set<(event: GeoExportControllerEvent) => void>();

  function notify(reason: GeoExportControllerReason) {
    const event: GeoExportControllerEvent = { type: 'change', reason };
    listeners.forEach((listener) => listener(event));
  }

  function getFormats(): GeoExportFormat[] {
    return resolved.formats?.length
      ? resolved.formats
      : [...GEO_EXPORT_FORMATS];
  }

  function getScopes(): GeoExportScope[] {
    return resolved.scopes?.length ? resolved.scopes : ['all'];
  }

  function suggestDefaultScope(mapId?: string): GeoExportScope {
    if (resolved.defaultScope) return resolved.defaultScope;
    const scopes = getScopes();
    const active = getGeoExportActiveSource(mapId ?? mapIdDefault, layer);
    if (
      active &&
      active.getSelectedIds().length > 0 &&
      scopes.includes('selected')
    ) {
      return 'selected';
    }
    if (active && scopes.includes('filtered')) return 'filtered';
    if (scopes.includes('all')) return 'all';
    return scopes[0] ?? 'all';
  }

  function resolveFilename(override?: string): string {
    return override ?? resolveFilenameValue(layer, resolved.filename);
  }

  function canExport(): boolean {
    return !disposed && !state.busy;
  }

  function createExportGeoAddComponent(mapId?: string): MenuClickAddComponent {
    const crs = resolveGeoExportCrs({
      sourceCrs: resolved.sourceCrs ?? GEO_EXPORT_DEFAULT_CRS,
      targetCrs: resolved.targetCrs ?? GEO_EXPORT_DEFAULT_CRS,
    });
    return createMenuClickAddComponentBuilder()
      .setComponentKey(GEO_EXPORT_COMPONENT_KEY.root)
      .setAttr({
        layer,
        mapId: mapId ?? mapIdDefault,
        formats: getFormats(),
        filename: resolved.filename,
        getCollection: resolved.getCollection,
        sourceCrs: crs.sourceCrs,
        targetCrs: crs.targetCrs,
        scopes: getScopes(),
        defaultScope: suggestDefaultScope(mapId ?? mapIdDefault),
        exportHandler: resolved.onExport,
        formComponent: resolved.formComponent,
        loadingComponent: resolved.loadingComponent,
      })
      .setCheck(`${GEO_EXPORT_COMPONENT_KEY.root}:${layer.id}`)
      .build();
  }

  async function buildContext(
    run: GeoExportRunOptions,
  ): Promise<GeoExportContext> {
    throwIfAborted(run.signal);
    const format = run.format ?? getFormats()[0] ?? 'geojson';
    const scope = run.scope ?? suggestDefaultScope(run.mapId ?? mapIdDefault);
    const filename = sanitizeExportFilename(resolveFilename(run.filename));
    const crs = resolveGeoExportCrs({
      sourceCrs: run.sourceCrs ?? resolved.sourceCrs ?? GEO_EXPORT_DEFAULT_CRS,
      targetCrs: run.targetCrs ?? resolved.targetCrs ?? GEO_EXPORT_DEFAULT_CRS,
    });
    const mapId = run.mapId ?? mapIdDefault;
    const signal = run.signal;

    const resolveCollection = async () => {
      throwIfAborted(signal);
      return resolveExportCollection({
        layer,
        mapId,
        scope,
        getCollection: resolved.getCollection,
      });
    };

    return {
      layer,
      mapId,
      format,
      filename,
      scope,
      ids: [],
      search: '',
      sort: [],
      sourceCrs: crs.sourceCrs,
      targetCrs: crs.targetCrs,
      signal,
      resolveCollection,
      async downloadLocal(fmt, collection) {
        throwIfAborted(signal);
        const fc =
          collection !== undefined ? collection : await resolveCollection();
        throwIfAborted(signal);
        if (!fc?.features?.length) {
          throw new Error('No features to export');
        }
        await exportFeatureCollectionGeo(fc, fmt ?? format, {
          filename,
          sourceCrs: crs.sourceCrs,
          targetCrs: crs.targetCrs,
        });
        throwIfAborted(signal);
      },
    };
  }

  async function run(runOptions: GeoExportRunOptions = {}): Promise<boolean> {
    if (disposed || state.busy) return false;
    throwIfAborted(runOptions.signal);
    state.busy = true;
    state.error = '';
    notify('busy');
    try {
      const ctx = await buildContext(runOptions);
      throwIfAborted(ctx.signal);
      const active = getGeoExportActiveSource(ctx.mapId, layer);
      if (active) {
        ctx.ids = active.getSelectedIds();
        ctx.search = active.getSearch();
        ctx.sort = active.getSort();
      }

      const handler = resolved.onExport ?? defaultGeoExport;
      const result = await handler(ctx);
      throwIfAborted(ctx.signal);
      if (result instanceof Blob) {
        const meta = GEO_EXPORT_FORMAT_META[ctx.format];
        const base = sanitizeExportFilename(ctx.filename);
        const name = base.toLowerCase().endsWith(`.${meta.extension}`)
          ? base
          : `${base}.${meta.extension}`;
        downloadBlob(result, name);
      }
      notify('idle');
      return true;
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Export failed';
      notify('error');
      throw err;
    } finally {
      state.busy = false;
      if (!disposed) notify('idle');
    }
  }

  return {
    getState: () => ({ ...state }),
    getOptions: () => ({ ...resolved }),
    getUiMode: () => state.uiMode,
    getFormats,
    getScopes,
    suggestDefaultScope,
    resolveFilename,
    canExport,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    createExportGeoAddComponent,
    run,
    dispose() {
      if (disposed) return;
      disposed = true;
      listeners.clear();
    },
  };
}
