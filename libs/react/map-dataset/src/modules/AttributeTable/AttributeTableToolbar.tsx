import {
  type AttributeTableToolbarProps,
  resolveAttributeTableUi,
} from '@hungpvq/map-dataset/attribute-table';
import {
  GEO_EXPORT_FORMAT_META,
  type GeoExportFormat,
} from '@hungpvq/map-dataset/geo-export';
import { MapControlButton } from '@hungpvq/react-map-core';
import { InputSelect, InputText } from '@hungpvq/react-map-core/fields';
import { type MouseEvent, useState } from 'react';

export function AttributeTableToolbar(props: AttributeTableToolbarProps) {
  const ui = resolveAttributeTableUi(props.ui);
  const [menuOpen, setMenuOpen] = useState(false);
  const formatItems = (props.exportFormats ?? []).map((fmt) => ({
    value: fmt,
    text: GEO_EXPORT_FORMAT_META[fmt as GeoExportFormat]?.name ?? String(fmt),
  }));
  const hasColumnFilter =
    !!props.columnFilterKey ||
    !!String(props.columnFilterQuery ?? '').trim() ||
    props.columnFilterMode !== 'contains';
  const visibleKeySet = new Set(props.visibleColumnKeys);

  function isColumnVisible(key: string) {
    if (props.columnVisibilityAll) return true;
    return visibleKeySet.has(key);
  }

  function toggleColumnVisibility(key: string) {
    const allKeys = props.columnVisibilityItems.map((i) => String(i.value));
    if (props.columnVisibilityAll) {
      props.onVisibleColumnKeysChange(allKeys.filter((k) => k !== key));
      return;
    }
    const next = new Set(props.visibleColumnKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    if (next.size === allKeys.length) {
      props.onShowAllColumns();
      return;
    }
    props.onVisibleColumnKeysChange(Array.from(next));
  }

  function onExportClick(event: MouseEvent) {
    if (props.exportFormats?.length && props.onExportFormat) {
      setMenuOpen((open) => !open);
      return;
    }
    props.onExport?.(event.nativeEvent);
  }

  return (
    <div className="attribute-table__toolbar">
      <div className="attribute-table__toolbar-row attribute-table__toolbar-row--primary">
        {ui.search ? (
          <InputText
            value={props.query}
            placeholder={props.searchPlaceholder}
            aria-label={props.searchLabel}
            onChange={props.onQueryChange}
          />
        ) : null}
        {ui.export && (props.onExport || props.onExportFormat) ? (
          <div className="attribute-table__export">
            <MapControlButton
              variant="outlined"
              size="medium"
              onClick={onExportClick}
            >
              {props.exportLabel || 'Export'}
            </MapControlButton>
            {menuOpen && formatItems.length ? (
              <ul className="attribute-table__export-menu" role="menu">
                {formatItems.map((item) => (
                  <li
                    key={String(item.value)}
                    role="menuitem"
                    onClick={(event) => {
                      setMenuOpen(false);
                      props.onExportFormat?.(
                        String(item.value),
                        event.nativeEvent,
                      );
                    }}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
      {ui.columnFilter && props.columnFilterItems.length ? (
        <div className="attribute-table__toolbar-row attribute-table__toolbar-row--column-filter">
          <InputSelect
            value={props.columnFilterKey}
            items={props.columnFilterItems}
            aria-label={props.columnFilterLabel}
            onChange={(value) =>
              props.onColumnFilterKeyChange(String(value ?? ''))
            }
          />
          <InputSelect
            value={props.columnFilterMode}
            items={props.columnFilterModeItems}
            aria-label={props.columnFilterModeLabel}
            onChange={(value) =>
              props.onColumnFilterModeChange(String(value ?? 'contains'))
            }
          />
          <InputText
            value={props.columnFilterQuery}
            placeholder={props.columnFilterQueryPlaceholder}
            aria-label={props.columnFilterQueryPlaceholder}
            disabled={!props.columnFilterKey}
            onChange={props.onColumnFilterQueryChange}
          />
          <MapControlButton
            variant="outlined"
            size="small"
            disabled={!hasColumnFilter}
            onClick={props.onClearColumnFilters}
          >
            {props.clearColumnFilterLabel}
          </MapControlButton>
        </div>
      ) : null}
      {ui.columnVisibility && props.columnVisibilityItems.length ? (
        <div
          className="attribute-table__toolbar-row attribute-table__toolbar-row--columns"
          role="group"
          aria-label={props.columnVisibilityLabel}
        >
          <span className="attribute-table__columns-label">
            {props.columnVisibilityLabel}
          </span>
          <div className="attribute-table__columns-chips">
            <MapControlButton
              className="attribute-table__column-chip attribute-table__column-chip--all"
              variant={props.columnVisibilityAll ? 'text' : 'outlined'}
              size="small"
              disabled={props.columnVisibilityAll}
              title={props.columnsShowAllLabel}
              onClick={props.onShowAllColumns}
            >
              {props.columnsShowAllLabel}
            </MapControlButton>
            {props.columnVisibilityItems.map((item) => {
              const key = String(item.value);
              const visible = isColumnVisible(key);
              return (
                <MapControlButton
                  key={key}
                  className="attribute-table__column-chip"
                  variant={visible ? 'tonal' : 'outlined'}
                  size="small"
                  active={visible}
                  title={String(item.text)}
                  onClick={() => toggleColumnVisibility(key)}
                >
                  {item.text}
                </MapControlButton>
              );
            })}
          </div>
        </div>
      ) : null}
      {ui.zoomToSelection || ui.rowFilter || ui.clearSelection ? (
        <div className="attribute-table__toolbar-row attribute-table__toolbar-row--meta">
          {ui.zoomToSelection ? (
            <MapControlButton
              variant="outlined"
              disabled={props.zoomDisabled}
              onClick={() => props.onZoomToSelection()}
            >
              {props.zoomLabel}
            </MapControlButton>
          ) : null}
          {ui.rowFilter ? (
            <InputSelect
              value={props.rowFilter}
              items={props.filterItems}
              aria-label={props.rowFilterLabel}
              onChange={(value) =>
                props.onRowFilterChange(
                  value === 'selected' ? 'selected' : 'all',
                )
              }
            />
          ) : null}
          {ui.clearSelection ? (
            <MapControlButton
              className="attribute-table__clear"
              disabled={props.clearDisabled}
              variant="outlined"
              size="medium"
              onClick={props.onClearSelection}
            >
              {props.clearLabel}
            </MapControlButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
