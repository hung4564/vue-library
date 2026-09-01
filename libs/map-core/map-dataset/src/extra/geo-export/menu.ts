import { mdiDownload } from '@mdi/js';
import type { FeatureCollection } from 'geojson';
import type {
  IDataset,
  MenuAction,
  MenuConditionContext,
  MenuItemBottomOrExtra,
} from '../../interfaces';
import { createMenuBuilder } from '../menu/builder';
import {
  LIST_VIEW_MENU_COMPONENT_KEY,
  LIST_VIEW_MENU_ID,
} from '../menu/items';
import { exportDatasetGeo, hasGeojsonExportData } from './dataset';
import {
  GEO_EXPORT_FORMATS,
  GEO_EXPORT_FORMAT_META,
  isGeoExportFormat,
  type GeoExportFormat,
} from './types';

export type ExportGeoGetCollection = (
  layer: IDataset,
) =>
  | FeatureCollection
  | null
  | undefined
  | Promise<FeatureCollection | null | undefined>;

export type ExportGeoMenuOptions = {
  formats?: GeoExportFormat[];
  filename?: string | ((layer: IDataset) => string);
  getCollection?: ExportGeoGetCollection;
  id?: string;
  name?: string;
  icon?: string;
  order?: number;
  class?: string;
  hidden?: MenuItemBottomOrExtra<IDataset>['hidden'];
  disabled?: MenuItemBottomOrExtra<IDataset>['disabled'];
};

export function createExportGeoSubmenu(
  options: Pick<
    ExportGeoMenuOptions,
    'formats' | 'filename' | 'getCollection'
  > = {},
): MenuAction[] {
  const formats = options.formats?.length
    ? options.formats
    : [...GEO_EXPORT_FORMATS];
  return formats.filter(isGeoExportFormat).map((format) =>
    createMenuBuilder()
      .item()
      .setLocation('menu')
      .setId(`${LIST_VIEW_MENU_ID.exportGeo}:${format}`)
      .setName(GEO_EXPORT_FORMAT_META[format].name)
      .setIcon(mdiDownload)
      .setClick(async ({ layer }) => {
        const filename =
          typeof options.filename === 'function'
            ? options.filename(layer)
            : options.filename;
        try {
          if (options.getCollection) {
            const collection = await options.getCollection(layer);
            if (!collection) return;
            await exportDatasetGeo(layer, format, { filename, collection });
            return;
          }
          await exportDatasetGeo(layer, format, { filename });
        } catch (error) {
          console.error('[export-geo]', error);
        }
      })
      .build(),
  );
}

export function createMenuItemExportGeo(menu: ExportGeoMenuOptions = {}) {
  const { formats, filename, getCollection, ...rest } = menu;
  return createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.exportGeo)
    .setName('Export')
    .setIcon(mdiDownload)
    .setComponentMenuKey(LIST_VIEW_MENU_COMPONENT_KEY.exportGeo)
    .setHidden((ctx) => isExportGeoMenuHidden(ctx))
    .setAdditional({
      order: 23,
      formats,
      filename,
      getCollection,
      ...rest,
    })
    .build();
}

export function getExportGeoMenuOptions(
  menu: MenuAction,
): Pick<ExportGeoMenuOptions, 'formats' | 'filename' | 'getCollection'> {
  const extra = menu as MenuAction & ExportGeoMenuOptions;
  return {
    formats: extra['formats'],
    filename: extra['filename'],
    getCollection: extra['getCollection'],
  };
}

export function isExportGeoMenuHidden(ctx: MenuConditionContext): boolean {
  const extra = (ctx.context ?? {}) as { disabledExport?: boolean };
  const config = (
    ctx.layer as { config?: { disabled_export?: boolean } }
  )?.config;
  if (extra.disabledExport || config?.disabled_export) return true;
  return !hasGeojsonExportData(ctx.layer);
}
