import type { IDataset } from '../interfaces/dataset.base';
import { createNamedComponent } from '../model/base';
import { createDatasetLeaf } from '../model/dataset.base.function';
import { findSiblingOrNearestLeaf } from '../model/visitors/helpers';
import type { GeoExportOptions } from './options';

/** Config stored on a `geo-export` dataset sibling. */
export type GeoExportPartOptions = GeoExportOptions;

export type GeoExportPart = IDataset & {
  type: 'geo-export';
  getOptions(): GeoExportPartOptions | undefined;
};

/**
 * Dataset sibling that configures Export.
 * `createMenuItemExportGeo()` merges these options (part wins over menu args).
 */
export function createDatasetPartGeoExport(
  name: string,
  options: GeoExportPartOptions = {},
): GeoExportPart {
  const base = createDatasetLeaf(name);
  const opts = options;

  return createNamedComponent('GeoExportPart', {
    ...base,
    get type(): 'geo-export' {
      return 'geo-export';
    },
    getOptions() {
      return opts;
    },
  }) as GeoExportPart;
}

export function isGeoExportPart(dataset: unknown): dataset is GeoExportPart {
  return (
    !!dataset &&
    typeof dataset === 'object' &&
    (dataset as { type?: string }).type === 'geo-export'
  );
}

function findGeoExportPart(layer: IDataset): GeoExportPart | undefined {
  if (typeof layer?.getParent !== 'function') return undefined;
  return findSiblingOrNearestLeaf<GeoExportPart>(layer, isGeoExportPart);
}

/**
 * Resolve Export options. Precedence: menu/shell `override` ← dataset part.
 */
export function resolveGeoExportOption(
  layer: IDataset,
  override?: GeoExportPartOptions,
): GeoExportPartOptions | undefined {
  const part = findGeoExportPart(layer);
  const fromPart = part?.getOptions();
  if (fromPart == null && override == null) return undefined;
  return { ...override, ...fromPart };
}
