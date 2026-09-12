import {
  getAttributeTableCellRaw,
  resolveAttributeTableComponentRef,
  type AttributeTableColumn,
  type AttributeTableGridProps,
  type AttributeTableRow,
} from '@hungpvq/map-dataset/attribute-table';
import { RegistryItem } from '@hungpvq/react-map-core';
import type { ComponentType, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

function ariaSortFor(
  key: string,
  sortStates: AttributeTableGridProps['sortStates'],
): 'ascending' | 'descending' | 'none' {
  const hit = sortStates.find((s) => s.key === key);
  if (!hit) return 'none';
  return hit.dir === 'asc' ? 'ascending' : 'descending';
}

export function AttributeTableGrid(props: AttributeTableGridProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastMetricsRef = useRef({ top: -1, height: -1 });
  const onScrollMetricsRef = useRef(props.onScrollMetrics);
  onScrollMetricsRef.current = props.onScrollMetrics;
  const showCheckbox = props.checkbox !== false;
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);

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

  useEffect(() => {
    const ids = props.windowedRows.map((r) => r.id);
    if (!ids.length) {
      setFocusedRowId(null);
      return;
    }
    setFocusedRowId((prev) =>
      prev && ids.includes(prev) ? prev : (ids[0] ?? null),
    );
  }, [props.windowedRows]);

  function selectRowLabel(row: AttributeTableRow) {
    const first = props.columns[0];
    const name = first ? row.cells[first.key] : '';
    return name
      ? `${props.selectRowLabel}: ${name}`
      : `${props.selectRowLabel} ${row.id}`;
  }

  function sortButtonLabel(column: AttributeTableColumn) {
    const state = ariaSortFor(column.key, props.sortStates);
    const stateLabel =
      state === 'ascending'
        ? props.sortedAscLabel
        : state === 'descending'
          ? props.sortedDescLabel
          : props.notSortedLabel;
    return `${column.label}, ${stateLabel}`;
  }

  function focusRowAt(index: number) {
    const rows = props.windowedRows;
    if (!rows.length) return;
    const clamped = Math.max(0, Math.min(index, rows.length - 1));
    const id = rows[clamped]?.id ?? null;
    setFocusedRowId(id);
    requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector(
        `tr[data-row-id="${CSS.escape(id ?? '')}"]`,
      ) as HTMLElement | null;
      el?.focus();
    });
  }

  function onRegionKeydown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const rows = props.windowedRows;
    if (!rows.length) return;
    const current = focusedRowId
      ? rows.findIndex((r) => r.id === focusedRowId)
      : 0;
    const idx = current < 0 ? 0 : current;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusRowAt(idx + 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusRowAt(idx - 1);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      focusRowAt(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusRowAt(rows.length - 1);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      const row = rows[idx];
      if (!row) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button, a, input, select, textarea') ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      props.onToggleRow(row);
    }
  }

  if (props.loading) {
    return (
      <div
        className="attribute-table__grid"
        role="region"
        aria-label={props.gridRegionLabel}
        aria-busy="true"
      >
        <div className="attribute-table__status" role="status" aria-live="polite">
          {props.loadingLabel}
        </div>
      </div>
    );
  }
  if (props.empty) {
    return (
      <div
        className="attribute-table__grid"
        role="region"
        aria-label={props.gridRegionLabel}
      >
        <div className="attribute-table__status" role="status" aria-live="polite">
          {props.emptyLabel}
        </div>
      </div>
    );
  }

  const colSpan =
    props.columns.length +
    (showCheckbox ? 1 : 0) +
    (props.itemMenus.length > 0 ? 1 : 0);

  return (
    <div
      className="attribute-table__grid"
      role="region"
      aria-label={props.gridRegionLabel}
    >
      <div
        className="attribute-table__scroll"
        ref={scrollRef}
        tabIndex={0}
        onScroll={syncScrollMetrics}
        onKeyDown={onRegionKeydown}
      >
        <table className="attribute-table__table" aria-label={props.tableLabel}>
          <thead>
            <tr>
              {showCheckbox ? (
                <th className="attribute-table__check" scope="col">
                  <input
                    type="checkbox"
                    checked={props.allVisibleSelected}
                    aria-label={props.selectAllLabel}
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
                  sortable ? 'is-sortable' : '',
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
                    scope="col"
                    className={className || undefined}
                    aria-sort={
                      sortable
                        ? ariaSortFor(column.key, props.sortStates)
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
                    ) : sortable ? (
                      <button
                        type="button"
                        className="attribute-table__sort-btn"
                        aria-label={sortButtonLabel(column)}
                        onClick={(event) =>
                          props.onSortColumn(column.key, event.shiftKey)
                        }
                      >
                        {column.label}
                        {hit
                          ? `${hit.dir === 'asc' ? ' ↑' : ' ↓'}${
                              props.sortStates.length > 1 ? idx : ''
                            }`
                          : ''}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
              {props.itemMenus.length > 0 ? (
                <th className="attribute-table__actions" scope="col">
                  <span className="attribute-table__sr-only">
                    {props.actionsColumnLabel}
                  </span>
                </th>
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
            {props.windowedRows.map((row) => {
              const selected = props.selectedIds.has(row.id);
              const focused = focusedRowId === row.id;
              return (
                <tr
                  key={row.id}
                  data-row-id={row.id}
                  className={[
                    selected ? 'is-selected' : '',
                    focused ? 'is-focused' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ height: props.rowHeight }}
                  aria-selected={selected ? 'true' : 'false'}
                  tabIndex={focused ? 0 : -1}
                  onClick={() => {
                    setFocusedRowId(row.id);
                    props.onToggleRow(row);
                  }}
                  onFocus={() => setFocusedRowId(row.id)}
                >
                  {showCheckbox ? (
                    <td
                      className="attribute-table__check"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        aria-label={selectRowLabel(row)}
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
              );
            })}
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
