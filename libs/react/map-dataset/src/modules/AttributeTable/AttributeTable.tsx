import { fitBounds, getMap, type WithMapPropType } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { ATTRIBUTE_TABLE_CONTROL, ATTRIBUTE_TABLE_LOCALE, ATTRIBUTE_TABLE_ROW_HEIGHT, attributeTableRowsToFeatureCollection, buildAttributeTable, clearPendingAttributeTableSelectRows, convertFeatureToItem, filterAttributeTableRows, filterAttributeTableRowsByColumns, getVirtualRowWindow, resolveAttributeTableSelectedRowIds, sortAttributeTableRows, takePendingAttributeTableSelectRows, toggleAttributeTableMultiSort, type AttributeTableColumn, type AttributeTableColumnsOption, type AttributeTableColumnFilters, type AttributeTableRow, type AttributeTableSelectRowsPayload, type AttributeTableSortState } from '@hungpvq/map-dataset';
import { createExportGeoSubmenu, createMenuItemExportGeo, getDatasetFeatureCollection, getExportGeoMenuOptions } from '@hungpvq/map-dataset/geo-export';
import { createMenuConditionContext, getItemMenuHost, getResolvedMenus, handleMenuAction, isMenuItemDisabled, isMenuItemHidden } from '@hungpvq/map-dataset/menu';
import {
  ContextMenu,
  DraggableItemPopup,
  type ContextMenuRef,
} from '@hungpvq/react-draggable';
import { defaultMapProps, MapControlButton, ModuleContainer, useLang, useMap, useRegisterMapControl, useShow } from '@hungpvq/react-map-core';
import { InputCheckbox, InputSelect, InputText } from '@hungpvq/react-map-core/fields';
import { mdiChevronDown, mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import type { Feature } from 'geojson';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DatasetMenuButton } from '../../extra/menu/dataset-menu-button';
import { useMapDatasetHighlight } from '../../store';
type AttributeTableProps = WithMapPropType & {
  layer: IDataset;
  columns?: AttributeTableColumnsOption;
  onClose?: () => void;
};
export function AttributeTable(props: AttributeTableProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap({
    ...merged,
    controlId: ATTRIBUTE_TABLE_CONTROL.id,
  });
  const { setFeatureHighlight, getHighlightSource } =
    useMapDatasetHighlight(mapId);
  const setFeatureHighlightRef = useRef(setFeatureHighlight);
  const getHighlightSourceRef = useRef(getHighlightSource);
  setFeatureHighlightRef.current = setFeatureHighlight;
  getHighlightSourceRef.current = getHighlightSource;
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(true);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [columns, setColumns] = useState<AttributeTableColumn[]>([]);
  const [rows, setRows] = useState<AttributeTableRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoomToSelection, setZoomToSelection] = useState(false);
  const [rowFilter, setRowFilter] = useState<'all' | 'selected'>('all');
  const pendingSelectIdsRef = useRef<string[] | null>(null);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const zoomToSelectionRef = useRef(zoomToSelection);
  zoomToSelectionRef.current = zoomToSelection;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  useEffect(() => {
    setLocaleDefault(ATTRIBUTE_TABLE_LOCALE);
  }, [setLocaleDefault]);
  const clearHighlight = useCallback(() => {
    if (getHighlightSourceRef.current() === 'attribute-table') {
      setFeatureHighlightRef.current(undefined, 'attribute-table');
    }
  }, []);
  const applySelection = useCallback(
    (ids: string[], focus?: AttributeTableRow) => {
      const selected = rowsRef.current.filter((row) => ids.includes(row.id));
      if (selected.length !== 1) {
        clearHighlight();
        return;
      }
      const current = focus ?? selected[0];
      setFeatureHighlightRef.current(
        current.feature as Feature,
        'attribute-table',
        props.layer,
      );
      if (!zoomToSelectionRef.current) return;
      getMap(mapId, (map) => {
        fitBounds(map, current.feature as Feature);
      });
    },
    [clearHighlight, mapId, props.layer],
  );
  useEffect(() => {
    const queued = takePendingAttributeTableSelectRows(mapId);
    if (queued) {
      pendingSelectIdsRef.current = queued;
      toggleShow(true);
    }
    // Mount-only: flush identify selection queued before this control registered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const collection = await getDatasetFeatureCollection(props.layer);
        if (cancelled) return;
        if (!collection) {
          setColumns([]);
          setRows([]);
          return;
        }
        const table = buildAttributeTable(collection, props.columns);
        setColumns(table.columns);
        setRows(table.rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      clearHighlight();
    };
  }, [props.layer, props.columns, clearHighlight]);
  useEffect(() => {
    if (loading) return;
    const pending = pendingSelectIdsRef.current;
    if (!pending) return;
    pendingSelectIdsRef.current = null;
    clearPendingAttributeTableSelectRows(mapId);
    const resolved = resolveAttributeTableSelectedRowIds(pending, rows);
    setSelectedIds(resolved);
    setRowFilter(resolved.length > 0 ? 'selected' : 'all');
    applySelection(resolved);
  }, [loading, rows, applySelection, mapId]);
  const searchedRows = useMemo(
    () => filterAttributeTableRows(rows, query),
    [rows, query],
  );
  const [sortStates, setSortStates] = useState<AttributeTableSortState[]>([]);
  const [columnFilters, setColumnFilters] = useState<AttributeTableColumnFilters>(
    {},
  );
  const filteredSearchedRows = useMemo(
    () => filterAttributeTableRowsByColumns(searchedRows, columnFilters),
    [searchedRows, columnFilters],
  );
  const sortedSearchedRows = useMemo(
    () => sortAttributeTableRows(filteredSearchedRows, sortStates),
    [filteredSearchedRows, sortStates],
  );
  const visibleRows = useMemo(() => {
    if (rowFilter !== 'selected') return sortedSearchedRows;
    const selected = new Set(selectedIds);
    return sortedSearchedRows.filter((row) => selected.has(row.id));
  }, [sortedSearchedRows, rowFilter, selectedIds]);
  const exportRows = useMemo(() => {
    if (selectedIds.length === 0) return visibleRows;
    const selected = new Set(selectedIds);
    return rows.filter((row) => selected.has(row.id));
  }, [selectedIds, visibleRows, rows]);
  function onSortColumn(key: string, event?: React.MouseEvent) {
    setSortStates((current) =>
      toggleAttributeTableMultiSort(current, key, Boolean(event?.shiftKey)),
    );
  }
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(320);
  const syncScrollMetrics = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);
  }, []);
  useLayoutEffect(() => {
    syncScrollMetrics();
  }, [visibleRows.length, syncScrollMetrics]);
  const virtualWindow = useMemo(
    () =>
      getVirtualRowWindow(
        visibleRows.length,
        scrollTop,
        viewportHeight || 320,
        ATTRIBUTE_TABLE_ROW_HEIGHT,
      ),
    [visibleRows.length, scrollTop, viewportHeight],
  );
  const windowedRows = useMemo(
    () => visibleRows.slice(virtualWindow.start, virtualWindow.end),
    [visibleRows, virtualWindow.start, virtualWindow.end],
  );
  const bottomSpacerHeight = Math.max(
    0,
    virtualWindow.totalHeight -
      virtualWindow.offsetY -
      windowedRows.length * ATTRIBUTE_TABLE_ROW_HEIGHT,
  );
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedSet.has(row.id));
  const title = useMemo(() => {
    const name = props.layer?.getName?.() || trans('map.attribute-table.title');
    if (!rows.length) return trans('map.attribute-table.title');
    return selectedIds.length
      ? `${name} (${rows.length}, ${selectedIds.length} selected)`
      : `${name} (${rows.length})`;
  }, [props.layer, rows.length, selectedIds.length, trans]);
  function handleClose() {
    clearHighlight();
    toggleShow(false);
    props.onClose?.();
  }
  const { panelBind } = useRegisterMapControl(mapId, {
    id: ATTRIBUTE_TABLE_CONTROL.id,
    panelKind: 'popup',
    title,
    buttonPosition: merged.position,
    show,
    setShow: (v) => {
      toggleShow(v);
      if (!v) {
        clearHighlight();
        props.onClose?.();
      }
    },
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [
      { type: ATTRIBUTE_TABLE_CONTROL.id, run: () => toggleShow() },
      {
        type: ATTRIBUTE_TABLE_CONTROL.actionSelectRows,
        run: (event) => {
          const ids = (
            (event as AttributeTableSelectRowsPayload | undefined)?.ids ?? []
          ).map(String);
          clearPendingAttributeTableSelectRows(mapId);
          toggleShow(true);
          if (loadingRef.current) {
            pendingSelectIdsRef.current = ids;
            return;
          }
          pendingSelectIdsRef.current = null;
          const resolved = resolveAttributeTableSelectedRowIds(ids, rowsRef.current);
          setSelectedIds(resolved);
          setRowFilter(resolved.length > 0 ? 'selected' : 'all');
          applySelection(resolved);
        },
      },
    ],
  });
  function toggleRow(row: AttributeTableRow) {
    const exists = selectedIds.includes(row.id);
    const next = exists
      ? selectedIds.filter((id) => id !== row.id)
      : [...selectedIds, row.id];
    setSelectedIds(next);
    applySelection(next, exists ? undefined : row);
  }
  function toggleSelectAll() {
    if (allVisibleSelected) {
      const visible = new Set(visibleRows.map((row) => row.id));
      const next = selectedIds.filter((id) => !visible.has(id));
      setSelectedIds(next);
      applySelection(next);
      return;
    }
    const next = Array.from(
      new Set([...selectedIds, ...visibleRows.map((row) => row.id)]),
    );
    setSelectedIds(next);
    applySelection(next);
  }
  function clearSelection() {
    setSelectedIds([]);
    clearHighlight();
  }
  const exportMenuRef = useRef<ContextMenuRef>(null);
  const exportMenuItem = useMemo(
    () =>
      createMenuItemExportGeo({
        filename: (layer) => `${layer.getName?.() || 'layer'}-table`,
        getCollection: () =>
          exportRows.length
            ? attributeTableRowsToFeatureCollection(exportRows)
            : null,
      }),
    [exportRows],
  );
  const exportChildren = useMemo(
    () => createExportGeoSubmenu(getExportGeoMenuOptions(exportMenuItem)),
    [exportMenuItem],
  );
  function onExportClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (exportRows.length === 0) return;
    exportMenuRef.current?.open(event);
  }
  function onExportChild(action: MenuAction, event: React.MouseEvent) {
    event.stopPropagation();
    handleMenuAction(action, {
      event: event.nativeEvent,
      layer: props.layer,
      mapId,
      value: props.layer,
    });
    exportMenuRef.current?.close();
  }
  const itemMenuHost = getItemMenuHost(props.layer);
  const itemMenuConditionCtx = createMenuConditionContext(itemMenuHost, {
    mapId,
  });
  const itemMenus = getResolvedMenus(props.layer, 'item').filter(
    (menu) =>
      menu.type !== 'divider' && !isMenuItemHidden(menu, itemMenuConditionCtx),
  );
  function onRowMenuAction(
    row: AttributeTableRow,
    menu: MenuAction,
    event: React.MouseEvent,
  ) {
    event.stopPropagation();
    if (isMenuItemDisabled(menu, itemMenuConditionCtx)) return;
    handleMenuAction(menu, {
      event: event.nativeEvent,
      layer: itemMenuHost,
      mapId,
      value: convertFeatureToItem(row.feature),
    });
  }
  useEffect(() => {
    if (zoomToSelection) applySelection(selectedIdsRef.current);
  }, [zoomToSelection, applySelection]);
  const filterItems = [
    { value: 'all', text: trans('map.attribute-table.showAll') },
    { value: 'selected', text: trans('map.attribute-table.showSelected') },
  ];
  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <>
          <DraggableItemPopup
            show={show}
            width={760}
            height={460}
            title={title}
            onClose={handleClose}
            onUpdateShow={(v) => {
              if (!v) handleClose();
            }}
            {...bind}
            {...panelBind}
          >
            <div className="attribute-table">
              <div className="attribute-table__toolbar">
                <div className="attribute-table__toolbar-row">
                  <InputText
                    value={query}
                    placeholder={trans('map.attribute-table.search')}
                    onChange={setQuery}
                  />
                  <MapControlButton
                    className="attribute-table__export"
                    disabled={exportRows.length === 0}
                    onClick={onExportClick} variant="outlined">
                    <Icon path={mdiDownload} size="16px" />
                    {selectedIds.length
                      ? trans('map.attribute-table.export-selected')
                      : trans('map.attribute-table.export')}
                    <Icon path={mdiChevronDown} size="16px" />
                  </MapControlButton>
                </div>
                <div className="attribute-table__toolbar-row">
                  <InputCheckbox
                    checked={zoomToSelection}
                    label={trans('map.attribute-table.zoomToSelection')}
                    onChange={setZoomToSelection}
                  />
                  <InputSelect
                    value={rowFilter}
                    items={filterItems}
                    onChange={(value) =>
                      setRowFilter(value === 'selected' ? 'selected' : 'all')
                    }
                  />
                  <MapControlButton
                    className="attribute-table__clear"
                    disabled={selectedIds.length === 0}
                    onClick={clearSelection} variant="outlined">
                    {trans('map.attribute-table.clear')}
                  </MapControlButton>
                </div>
              </div>
              {loading ? (
                <div className="attribute-table__status">
                  {trans('map.attribute-table.loading')}
                </div>
              ) : visibleRows.length === 0 ? (
                <div className="attribute-table__status">
                  {trans('map.attribute-table.empty')}
                </div>
              ) : (
                <div
                  className="attribute-table__scroll"
                  ref={scrollRef}
                  onScroll={syncScrollMetrics}
                >
                  <table className="attribute-table__table">
                    <thead>
                      <tr>
                        <th className="attribute-table__check">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        {columns.map((column) => {
                          const hit = sortStates.find((s) => s.key === column.key);
                          const idx = hit ? sortStates.indexOf(hit) + 1 : 0;
                          return (
                            <th
                              key={column.key}
                              className={hit ? 'is-sorted' : ''}
                              onClick={(event) => onSortColumn(column.key, event)}
                            >
                              {column.label}
                              {hit
                                ? `${hit.dir === 'asc' ? ' ↑' : ' ↓'}${
                                    sortStates.length > 1 ? idx : ''
                                  }`
                                : ''}
                            </th>
                          );
                        })}
                        {itemMenus.length > 0 ? (
                          <th className="attribute-table__actions" />
                        ) : null}
                      </tr>
                      <tr className="attribute-table__filters">
                        <th className="attribute-table__check" />
                        {columns.map((column) => (
                          <th key={`f-${column.key}`}>
                            <input
                              className="attribute-table__column-filter"
                              type="search"
                              value={columnFilters[column.key] || ''}
                              placeholder={column.label}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setColumnFilters((prev) => ({
                                  ...prev,
                                  [column.key]: e.target.value,
                                }))
                              }
                            />
                          </th>
                        ))}
                        {itemMenus.length > 0 ? (
                          <th className="attribute-table__actions" />
                        ) : null}
                      </tr>
                    </thead>
                    <tbody>
                      {virtualWindow.offsetY > 0 ? (
                        <tr className="attribute-table__spacer" aria-hidden="true">
                          <td
                            colSpan={
                              columns.length + 1 + (itemMenus.length > 0 ? 1 : 0)
                            }
                            style={{
                              height: virtualWindow.offsetY,
                              padding: 0,
                              border: 0,
                            }}
                          />
                        </tr>
                      ) : null}
                      {windowedRows.map((row) => (
                        <tr
                          key={row.id}
                          className={
                            selectedSet.has(row.id) ? 'is-selected' : ''
                          }
                          style={{ height: ATTRIBUTE_TABLE_ROW_HEIGHT }}
                          onClick={() => toggleRow(row)}
                        >
                          <td
                            className="attribute-table__check"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSet.has(row.id)}
                              onChange={() => toggleRow(row)}
                            />
                          </td>
                          {columns.map((column) => {
                            const value = row.cells[column.key] ?? '';
                            return (
                              <td
                                key={column.key}
                                title={value.length > 80 ? value : undefined}
                              >
                                {value}
                              </td>
                            );
                          })}
                          {itemMenus.length > 0 ? (
                            <td
                              className="attribute-table__actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {itemMenus.map((menu, index) => (
                                <DatasetMenuButton
                                  key={menu.id || String(index)}
                                  menu={menu}
                                  item={itemMenuHost}
                                  mapId={mapId}
                                  disabled={isMenuItemDisabled(
                                    menu,
                                    itemMenuConditionCtx,
                                  )}
                                  onClick={(event) =>
                                    onRowMenuAction(row, menu, event)
                                  }
                                />
                              ))}
                            </td>
                          ) : null}
                        </tr>
                      ))}
                      {bottomSpacerHeight > 0 ? (
                        <tr className="attribute-table__spacer" aria-hidden="true">
                          <td
                            colSpan={
                              columns.length + 1 + (itemMenus.length > 0 ? 1 : 0)
                            }
                            style={{
                              height: bottomSpacerHeight,
                              padding: 0,
                              border: 0,
                            }}
                          />
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DraggableItemPopup>
          <ContextMenu ref={exportMenuRef}>
            <ul className="context-menu layer-context-menu">
              {exportChildren.map((child, index) => (
                <li
                  key={child.id || String(index)}
                  className="layer-context-menu__item"
                  onClick={(event) => onExportChild(child, event)}
                >
                  <div className="layer-context-menu__item-icon">
                    <Icon
                      path={('icon' in child && child.icon) || mdiDownload}
                      size="16px"
                    />
                  </div>
                  <span>{('name' in child && child.name) || ''}</span>
                </li>
              ))}
            </ul>
          </ContextMenu>
        </>
      )}
    />
  );
}

