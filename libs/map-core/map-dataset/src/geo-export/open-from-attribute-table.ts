import type { IDataset } from '../interfaces';
import { createMenuClickBuilder } from '../menu/builder';
import { handleMenuActionClick } from '../menu/handle';
import { LIST_VIEW_MENU_ID } from '../menu/items';
import { createGeoExportController, type GeoExportController } from './controller';
import { resolveGeoExportOption } from './dataset-part';
import type { GeoExportScope, GeoExportUiMode } from './options';
import { GEO_EXPORT_FORMATS, type GeoExportFormat } from './types';

const AT_DEFAULT_SCOPES: GeoExportScope[] = ['all', 'filtered', 'selected'];

export type OpenGeoExportFromAttributeTableOptions = {
  layer: IDataset;
  mapId: string;
  event?: MouseEvent;
};

export type ResolvedAttributeTableGeoExport = {
  uiMode: GeoExportUiMode;
  formats: GeoExportFormat[];
};

function withAtScopes(layer: IDataset) {
  const resolved = resolveGeoExportOption(layer) ?? {};
  const scopes =
    resolved.scopes && resolved.scopes.length > 0
      ? resolved.scopes
      : AT_DEFAULT_SCOPES;
  return { ...resolved, scopes };
}

function createAtController(
  layer: IDataset,
  mapId?: string,
): GeoExportController {
  return createGeoExportController(layer, {
    ...withAtScopes(layer),
    mapId,
  });
}

/**
 * Resolve geo-export options for Attribute Table toolbar.
 * When part/menu omit `scopes`, AT offers all / filtered / selected.
 */
export function resolveAttributeTableGeoExport(
  layer: IDataset,
): ResolvedAttributeTableGeoExport {
  const resolved = withAtScopes(layer);
  const uiMode =
    resolved.uiMode === 'menu' || resolved.uiMode === 'click'
      ? resolved.uiMode
      : 'modal';
  return {
    uiMode,
    formats: resolved.formats?.length
      ? resolved.formats
      : [...GEO_EXPORT_FORMATS],
  };
}

/** Open the ExportGeo modal via ComponentManagement (`addComponent`). */
export function openGeoExportModalFromAttributeTable(
  options: OpenGeoExportFromAttributeTableOptions,
): void {
  const controller = createAtController(options.layer, options.mapId);
  try {
    void handleMenuActionClick(
      createMenuClickBuilder()
        .addTupleStatic(LIST_VIEW_MENU_ID.addComponent, {
          value: controller.createExportGeoAddComponent(options.mapId),
        })
        .build(),
      {
        layer: options.layer,
        mapId: options.mapId,
        event: options.event,
      },
    );
  } finally {
    controller.dispose();
  }
}

/** Run a single format export (menu mode from AT toolbar). */
export async function runGeoExportFormatFromAttributeTable(
  options: OpenGeoExportFromAttributeTableOptions & {
    format: GeoExportFormat;
  },
): Promise<void> {
  const controller = createAtController(options.layer, options.mapId);
  try {
    await controller.run({
      format: options.format,
      mapId: options.mapId,
    });
  } finally {
    controller.dispose();
  }
}

/** One-shot export (`uiMode: 'click'`) using `formats[0]` (or `geojson`). */
export async function runGeoExportClickFromAttributeTable(
  options: OpenGeoExportFromAttributeTableOptions,
): Promise<void> {
  const controller = createAtController(options.layer, options.mapId);
  try {
    const format = controller.getFormats()[0] ?? 'geojson';
    await controller.run({
      format,
      mapId: options.mapId,
    });
  } finally {
    controller.dispose();
  }
}
