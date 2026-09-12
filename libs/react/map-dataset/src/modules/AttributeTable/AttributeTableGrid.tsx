import {
  getAttributeTableCellRaw,
  resolveAttributeTableComponentRef,
  type AttributeTableColumn,
  type AttributeTableGridProps,
} from '@hungpvq/map-dataset/attribute-table';
import { RegistryItem } from '@hungpvq/react-map-core';
import type { ComponentType } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { DatasetMenuButton } from '../../extra/menu/dataset-menu-button';

function isColumnSortable(
  sortEnabled: boolean | undefined,
  column: AttributeTableColumn,
) {
  return sortEnabled !== false && column.sortable !== false;
}

function resolveSlot(value: unknown) {
  const resolved = resolveAttributeTableComponentRef(value);
  return {
    componentKey: resolved.componentKey,
    defaultComponent: resolved.defaultComponent as
      | ComponentType<any>
      | undefined,
  };
}

function headerSortMeta(
  sortEnabled: boolean | undefined,
  column: AttributeTableColumn,
  sortStates: AttributeTableGridProps['sortStates'],
  onSortColumn: AttributeTableGridProps['onSortColumn'],
) {
  const sortable = isColumnSortable(sortEnabled, column);
  if (!sortable) {
    return { sortable: false as const };
  }
  const hit = sortStates.find((s) => s.key === column.key);
  const base = hit
    ? {
        sortable: true as const,
        sortDir: hit.dir,
        sortOrder: sortStates.indexOf(hit) + 1,
        sortCount: sortStates.length,
      }
    : { sortable: true as const };
  return {
    ...base,
    onSort: (append?: boolean) => onSortColumn(column.key, !!append),
  };
}

export function AttributeTableGrid(props: AttributeTableGridProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastMetricsRef = useRef({ top: -1, height: -1 });
  const onScrollMetricsRef = useRef(props.onScrollMetrics);
  onScrollMetricsRef.current = props.onScrollMetrics;
  const showCheckbox = props.checkbox !== false;

  const syncScrollMetrics = () => {
    const el = scrollRef.current;
    if (!el) return;
    const top = el.scrollTop;
    const height = el.clientHeight;
    const last = lastMetricsRef.current;
    if (last.top === top && last.height === height) return;
    lastMetricsRef.current = { top, height };
    onScrollMetricsRef.current(top, height);
  };

  useLayoutEffect(() => {
    if (props.loading || props.empty) return;
    const el = scrollRef.current;
    if (!el) return;
    syncScrollMetrics();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => syncScrollMetrics());
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading, props.empty]);

  if (props.loading) {
    return (
      <div className="attribute-table__grid">
        <div className="attribute-table__status">{props.loadingLabel}</div>
      </div>
    );
  }
  if (props.empty) {
    return (
      <div className="attribute-table__grid">
        <div className="attribute-table__status">{props.emptyLabel}</div>
      </div>
    );
  }

  const colSpan =
    props.columns.length +
    (showCheckbox ? 1 : 0) +
    (props.itemMenus.length > 0 ? 1 : 0);

  return (
    <div className="attribute-table__grid">
      <div
        className="attribute-table__scroll"
        ref={scrollRef}
        onScroll={syncScrollMetrics}
      >
        <table className="attribute-table__table">
          <thead>
            <tr>
              {showCheckbox ? (
                <th className="attribute-table__check">
                  <input
                    type="checkbox"
                    checked={props.allVisibleSelected}
                    onChange={props.onToggleSelectAll}
                  />
                </th>
              ) : null}
              {props.columns.map((column) => {
                const sortable = isColumnSortable(props.sort, column);
                const hit = sortable
                  ? props.sortStates.find((s) => s.key === column.key)
                  : undefined;
                const idx = hit ? props.sortStates.indexOf(hit) + 1 : 0;
                const className = [
                  sortable && !column.headerComponent ? 'is-sortable' : '',
                  hit ? 'is-sorted' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                const headerSlot = column.headerComponent
                  ? resolveSlot(column.headerComponent)
                  : null;
                return (
                  <th
                    key={column.key}
                    className={className || undefined}
                    onClick={
                      sortable && !column.headerComponent
                        ? (event) =>
                            props.onSortColumn(column.key, event.shiftKey)
                        : undefined
                    }
                  >
                    {headerSlot ? (
                      <RegistryItem
                        componentKey={headerSlot.componentKey}
                        defaultComponent={headerSlot.defaultComponent}
                        mapId={props.mapId}
                        label={column.label}
                        column={column}
                        {...headerSortMeta(
                          props.sort,
                          column,
                          props.sortStates,
                          props.onSortColumn,
                        )}
                      />
                    ) : (
                      <>
                        {column.label}
                        {hit
                          ? `${hit.dir === 'asc' ? ' ↑' : ' ↓'}${
                              props.sortStates.length > 1 ? idx : ''
                            }`
                          : ''}
                      </>
                    )}
                  </th>
                );
              })}
              {props.itemMenus.length > 0 ? (
                <th className="attribute-table__actions" />
              ) : null}
            </tr>
          </thead>
          <tbody>
            {props.virtualWindow.offsetY > 0 ? (
              <tr className="attribute-table__spacer" aria-hidden="true">
                <td
                  colSpan={colSpan}
                  style={{
                    height: props.virtualWindow.offsetY,
                    padding: 0,
                    border: 0,
                  }}
                />
              </tr>
            ) : null}
            {props.windowedRows.map((row) => (
              <tr
                key={row.id}
                className={props.selectedIds.has(row.id) ? 'is-selected' : ''}
                style={{ height: props.rowHeight }}
                onClick={() => props.onToggleRow(row)}
              >
                {showCheckbox ? (
                  <td
                    className="attribute-table__check"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={props.selectedIds.has(row.id)}
                      onChange={() => props.onToggleRow(row)}
                    />
                  </td>
                ) : null}
                {props.columns.map((column) => {
                  const value = row.cells[column.key] ?? '';
                  const cellSlot = column.cellComponent
                    ? resolveSlot(column.cellComponent)
                    : null;
                  return (
                    <td
                      key={column.key}
                      title={value.length > 80 ? value : undefined}
                    >
                      {cellSlot ? (
                        <RegistryItem
                          componentKey={cellSlot.componentKey}
                          defaultComponent={cellSlot.defaultComponent}
                          mapId={props.mapId}
                          value={value}
                          raw={getAttributeTableCellRaw(row, column)}
                          row={row}
                          column={column}
                        />
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
                {props.itemMenus.length > 0 ? (
                  <td
                    className="attribute-table__actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {props.itemMenus.map((menu, index) => (
                      <DatasetMenuButton
                        key={menu.id || String(index)}
                        menu={menu}
                        item={props.itemMenuHost}
                        mapId={props.mapId ?? ''}
                        disabled={props.isMenuDisabled(menu)}
                        onClick={(event) =>
                          props.onRowMenuAction(
                            row,
                            menu,
                            event.nativeEvent,
                          )
                        }
                      />
                    ))}
                  </td>
                ) : null}
              </tr>
            ))}
            {props.bottomSpacerHeight > 0 ? (
              <tr className="attribute-table__spacer" aria-hidden="true">
                <td
                  colSpan={colSpan}
                  style={{
                    height: props.bottomSpacerHeight,
                    padding: 0,
                    border: 0,
                  }}
                />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
