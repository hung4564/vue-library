import type { FeatureCollection } from 'geojson';
import {
  GEO_EXPORT_FORMATS,
  GEO_EXPORT_FORMAT_META,
  type GeoExportFormat,
} from '../geo-export/types';
import type { IDataset } from '../interfaces';
import { type AttributeTableRow } from './model';
import type { AttributeTableSortState } from './sort';

/**
 * Context passed to custom export handlers.
 * Use helpers for local download, or ignore them and call your API / open a dialog.
 */
export type AttributeTableExportContext = {
  layer: IDataset;
  /** Selected row ids (empty = export current filtered set). */
  ids: string[];
  search: string;
  sort: AttributeTableSortState[];
  filename: string;
  /** Mouse event from the Export button / menu item when available. */
  event?: MouseEvent;
  /** Resolve rows (selection preferred, else full filtered page list). */
  resolveRows: () => Promise<AttributeTableRow[]>;
  /** Local convert + download (GeoJSON / KML / CSV / Shapefile). */
  downloadLocal: (
    format: GeoExportFormat,
    rows?: AttributeTableRow[],
  ) => Promise<void>;
  rowsToFeatureCollection: (rows: AttributeTableRow[]) => FeatureCollection;
};

/**
 * One entry in the Export submenu (default UI).
 * - `format` only → built-in local convert
 * - `run` → fully custom (API, dialog, mix of local formats, …)
 * - both → `run` wins (you can still call `ctx.downloadLocal`)
 */
export type AttributeTableExportAction = {
  id: string;
  label: string;
  icon?: string;
  format?: GeoExportFormat;
  run?: (ctx: AttributeTableExportContext) => void | Promise<void>;
};

/**
 * How the Export button behaves.
 *
 * - Default / omit → submenu of all local geo formats
 * - `formats` → submenu of those local formats only (`false` = none)
 * - `actions` → custom submenu items (append, or replace when `replaceActions`)
 * - `onExport` → **no submenu**; one click runs this (API download, open dialog, …)
 */
export type AttributeTableExportOptions = {
  /** Local formats in the submenu. Default: all. `false` = hide built-in formats. */
  formats?: GeoExportFormat[] | false;
  /** Custom menu actions (API item, “Open export dialog”, …). */
  actions?: AttributeTableExportAction[];
  /**
   * When true, only `actions` appear (ignore built-in `formats`).
   * Ignored when `onExport` is set.
   */
  replaceActions?: boolean;
  /**
   * Single handler — Export button does not open a format menu.
   * Use for one API call or to open your own dialog.
   */
  onExport?: (ctx: AttributeTableExportContext) => void | Promise<void>;
};

export type AttributeTableResolvedExportAction = {
  id: string;
  label: string;
  icon?: string;
  format?: GeoExportFormat;
};

export function resolveAttributeTableExportActions(
  options?: AttributeTableExportOptions,
): AttributeTableResolvedExportAction[] {
  if (options?.onExport) return [];

  const custom = (options?.actions ?? []).map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    format: action.format,
  }));

  if (options?.replaceActions) return custom;

  const formats =
    options?.formats === false
      ? []
      : options?.formats?.length
        ? options.formats
        : [...GEO_EXPORT_FORMATS];

  const builtIn = formats.map((format) => ({
    id: `format:${format}`,
    label: GEO_EXPORT_FORMAT_META[format].name,
    format,
  }));

  return [...builtIn, ...custom];
}

export function isAttributeTableExportMenuMode(
  options?: AttributeTableExportOptions,
): boolean {
  return !options?.onExport;
}
