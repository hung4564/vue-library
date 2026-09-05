import { fitBounds, getMap, type WithMapPropType } from '@hungpvq/map-core';
import type { IDataset, MenuAction } from '@hungpvq/map-dataset';
import {
  ATTRIBUTE_TABLE_LOCALE,
  attributeTableRowsToFeatureCollection,
  buildAttributeTable,
  createExportGeoSubmenu,
  createMenuItemExportGeo,
  filterAttributeTableRows,
  getDatasetFeatureCollection,
  getExportGeoMenuOptions,
  handleMenuAction,
  type AttributeTableColumn,
  type AttributeTableColumnsOption,
  type AttributeTableRow,
} from '@hungpvq/map-dataset';
import {
  ContextMenu,
  DraggableItemPopup,
  type ContextMenuRef,
} from '@hungpvq/react-draggable';
import {
  BaseButton,
  InputCheckbox,
  InputSelect,
  InputText,
  ModuleContainer,
  defaultMapProps,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { mdiChevronDown, mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import type { Feature, FeatureCollection } from 'geojson';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    controlId: 'mapAttributeTable',
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
      if (selected.length === 0) {
        clearHighlight();
        return;
      }
      const current = focus ?? selected[selected.length - 1];
      setFeatureHighlightRef.current(
        current.feature as Feature,
        'attribute-table',
        props.layer,
      );
      if (!zoomToSelectionRef.current) return;
      const boundsValue: Feature | FeatureCollection =
        selected.length === 1
          ? (current.feature as Feature)
          : {
              type: 'FeatureCollection',
              features: selected.map((row) => row.feature),
            };
      getMap(mapId, (map) => {
        fitBounds(map, boundsValue);
      });
    },
    [clearHighlight, mapId, props.layer],
  );

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

  const searchedRows = useMemo(
    () => filterAttributeTableRows(rows, query),
    [rows, query],
  );

  const visibleRows = useMemo(() => {
    if (rowFilter !== 'selected') return searchedRows;
    const selected = new Set(selectedIds);
    return searchedRows.filter((row) => selected.has(row.id));
  }, [searchedRows, rowFilter, selectedIds]);

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
    id: 'mapAttributeTable',
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
    actions: [{ type: 'mapAttributeTable', run: () => toggleShow() }],
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
          visibleRows.length
            ? attributeTableRowsToFeatureCollection(visibleRows)
            : null,
      }),
    [visibleRows],
  );
  const exportChildren = useMemo(
    () => createExportGeoSubmenu(getExportGeoMenuOptions(exportMenuItem)),
    [exportMenuItem],
  );

  function onExportClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (visibleRows.length === 0) return;
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
                  <BaseButton
                    className="attribute-table__export"
                    disabled={visibleRows.length === 0}
                    onClick={onExportClick}
                  >
                    <Icon path={mdiDownload} size="16px" />
                    {trans('map.attribute-table.export')}
                    <Icon path={mdiChevronDown} size="16px" />
                  </BaseButton>
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
                  <BaseButton
                    className="attribute-table__clear"
                    disabled={selectedIds.length === 0}
                    onClick={clearSelection}
                  >
                    {trans('map.attribute-table.clear')}
                  </BaseButton>
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
                <div className="attribute-table__scroll">
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
                        {columns.map((column) => (
                          <th key={column.key}>{column.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row) => (
                        <tr
                          key={row.id}
                          className={
                            selectedSet.has(row.id) ? 'is-selected' : ''
                          }
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
                        </tr>
                      ))}
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
