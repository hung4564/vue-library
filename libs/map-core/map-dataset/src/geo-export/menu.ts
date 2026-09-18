import { mdiDownload } from '@mdi/js';
import type { IDataset } from '../interfaces/dataset.base';
import type { MenuConditionContext, MenuItemBottomOrExtra } from '../interfaces/dataset.parts';
import {
  createMenuBuilder,
  createMenuClickBuilder,
} from '../menu/builder';
import { LIST_VIEW_MENU_ID } from '../menu/items';
import { createGeoExportController } from './controller';
import { hasGeojsonExportData } from './dataset';
import { resolveGeoExportOption } from './dataset-part';
import {
  GEO_EXPORT_COMPONENT_KEY,
  type ExportGeoGetCollection,
  type GeoExportHandler,
  type GeoExportOptions,
  type GeoExportScope,
} from './options';
import type { GeoExportFormat } from './types';

export type ExportGeoMenuOptions = GeoExportOptions &
  Partial<Omit<MenuItemBottomOrExtra<IDataset>, 'click' | 'location'>>;

/** Props for the registry shell mounted via `addComponent`. */
export type ExportGeoComponentAttrs = {
  layer: IDataset;
  mapId?: string;
  formats?: GeoExportFormat[];
  filename?: string | ((layer: IDataset) => string);
  getCollection?: ExportGeoGetCollection;
  sourceCrs?: string | null;
  targetCrs?: string | null;
  scopes?: GeoExportScope[];
  defaultScope?: GeoExportScope;
  /**
   * Export runner (same as {@link GeoExportOptions.onExport}).
   * Named `exportHandler` (not `onExport`) so Vue `$attrs` does not treat it
   * as a fallthrough `export` event listener.
   */
  exportHandler?: GeoExportHandler;
  /**
   * Local form override: Registry key (`string`) or Vue/React component.
   * Same idea as Attribute Table `cellComponent`.
   */
  formComponent?: unknown;
  /** Local loading override: Registry key (`string`) or Vue/React component. */
  loadingComponent?: unknown;
};

/**
 * Layer menu Export.
 * - `uiMode: 'modal'` (default) → opens ExportGeo shell via `addComponent`
 * - `uiMode: 'menu'` → format submenu (`componentMenuKey`)
 * - `uiMode: 'click'` → one row; runs `formats[0]` (or `geojson`) immediately
 *
 * Pass `uiMode` on the **menu item** (`createMenuItemExportGeo({ uiMode })`).
 * Dataset-part options merge at click / render (part wins).
 */
export function createMenuItemExportGeo(menu: ExportGeoMenuOptions = {}) {
  const {
    formats,
    filename,
    getCollection,
    sourceCrs,
    targetCrs,
    scopes,
    defaultScope,
    onExport,
    formComponent,
    loadingComponent,
    uiMode = 'modal',
    ...rest
  } = menu;

  const optionOverride: GeoExportOptions = {
    formats,
    filename,
    getCollection,
    sourceCrs,
    targetCrs,
    scopes,
    defaultScope,
    onExport,
    formComponent,
    loadingComponent,
    uiMode,
  };

  const builder = createMenuBuilder()
    .item()
    .setLocation('menu')
    .setId(LIST_VIEW_MENU_ID.layer.exportGeo)
    .setName('Export')
    .setIcon(mdiDownload)
    .setHidden((ctx) => isExportGeoMenuHidden(ctx));

  if (uiMode === 'menu') {
    return builder
      .setComponentMenuKey(GEO_EXPORT_COMPONENT_KEY.formatMenu)
      .setAdditional({
        order: 23,
        ...rest,
        ...optionOverride,
      })
      .build();
  }

  if (uiMode === 'click') {
    return builder
      .setClick(async ({ layer, mapId }) => {
        const resolved = resolveGeoExportOption(layer, optionOverride);
        const ctrl = createGeoExportController(layer, {
          ...resolved,
          mapId,
        });
        try {
          const format = ctrl.getFormats()[0] ?? 'geojson';
          await ctrl.run({ format, mapId });
        } finally {
          ctrl.dispose();
        }
      })
      .setAdditional({
        order: 23,
        ...rest,
      })
      .build();
  }

  return builder
    .setClick(
      createMenuClickBuilder()
        .addTupleDynamic(
          LIST_VIEW_MENU_ID.addComponent,
          ({ layer, mapId }) => {
            const resolved = resolveGeoExportOption(layer, optionOverride);
            const ctrl = createGeoExportController(layer, {
              ...resolved,
              mapId,
            });
            return {
              value: ctrl.createExportGeoAddComponent(mapId),
            };
          },
        )
        .build(),
    )
    .setAdditional({
      order: 23,
      ...rest,
    })
    .build();
}

export function isExportGeoMenuHidden(ctx: MenuConditionContext): boolean {
  const extra = (ctx.context ?? {}) as { disabledExport?: boolean };
  if (extra.disabledExport) return true;
  return !hasGeojsonExportData(ctx.layer);
}
