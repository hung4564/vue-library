import type { IDataset } from '../interfaces/dataset.base';
import { createNamedComponent } from '../model/base';
import { createDatasetLeaf } from '../model/dataset.base.function';
import { findSiblingOrNearestLeaf } from '../model/visitors/helpers';
import type { AttributeTableColumnsOption } from './model';
import type { AttributeTableUiOptions } from './props';

export type CreateDatasetPartAttributeTableOptions = {
  /** Column defs (highest precedence over menu / shell / auto). */
  columns?: AttributeTableColumnsOption;
  /** UI flags (highest precedence over menu / shell). */
  ui?: AttributeTableUiOptions;
};

export type AttributeTablePart = IDataset & {
  type: 'attribute-table';
  getColumns(): AttributeTableColumnsOption | undefined;
  getUi(): AttributeTableUiOptions | undefined;
};

/**
 * Dataset sibling that configures Attribute Table (`columns`, `ui`).
 * Attach next to list / source / data-management:
 *
 * ```ts
 * dataset.add(
 *   createDatasetPartAttributeTable('table', {
 *     columns: [{ key: 'name', label: 'Name' }, '__geometry'],
 *     ui: { sort: false },
 *   }),
 * );
 * ```
 *
 * **Custom `store`:** when the shell / controller injects `store`, dataset-part
 * **columns are not applied** (the store owns its column layout). Part `ui`
 * still merges via shell / controller resolve helpers.
 *
 * Export stays on `@hungpvq/map-dataset/geo-export` (`createDatasetPartGeoExport`
 * + list ⋮ Export) — not on the attribute-table part.
 */
export function createDatasetPartAttributeTable(
  name: string,
  options: CreateDatasetPartAttributeTableOptions = {},
): AttributeTablePart {
  const base = createDatasetLeaf(name);
  const columns = options.columns;
  const ui = options.ui;

  return createNamedComponent('AttributeTablePart', {
    ...base,
    get type(): 'attribute-table' {
      return 'attribute-table';
    },
    getColumns() {
      return columns;
    },
    getUi() {
      return ui;
    },
  }) as AttributeTablePart;
}

export function isAttributeTableView(
  dataset: unknown,
): dataset is AttributeTablePart {
  return (
    !!dataset &&
    typeof dataset === 'object' &&
    (dataset as { type?: string }).type === 'attribute-table'
  );
}

function findAttributeTablePart(
  layer: IDataset,
): AttributeTablePart | undefined {
  if (typeof layer?.getParent !== 'function') return undefined;
  const part = findSiblingOrNearestLeaf(layer, isAttributeTableView);
  return part && isAttributeTableView(part) ? part : undefined;
}

/**
 * Resolve columns option for Attribute Table.
 * Precedence (low → high): auto-default ← menu/shell `override` ← dataset part.
 * Applied in `createAttributeTableStoreFromDataset` only (not when injecting
 * a custom `store`).
 */
export function resolveAttributeTableColumnsOption(
  layer: IDataset,
  override?: AttributeTableColumnsOption,
): AttributeTableColumnsOption | undefined {
  const part = findAttributeTablePart(layer);
  if (part) {
    const fromPart = part.getColumns();
    if (fromPart != null) return fromPart;
  }
  return override;
}

/**
 * Resolve `ui` flags. Precedence: menu/shell ← dataset part.
 */
export function resolveAttributeTableUiOption(
  layer: IDataset,
  override?: AttributeTableUiOptions,
): AttributeTableUiOptions | undefined {
  const part = findAttributeTablePart(layer);
  if (part) {
    const fromPart = part.getUi();
    if (fromPart != null) return fromPart;
  }
  return override;
}
