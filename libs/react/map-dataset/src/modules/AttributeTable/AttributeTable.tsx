import { fitBounds, getMap } from '@hungpvq/map-core';
import { convertFeatureToItem } from '@hungpvq/map-dataset';
import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  ATTRIBUTE_TABLE_CONTROL,
  ATTRIBUTE_TABLE_LOCALE,
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  clearPendingAttributeTableSelectRows,
  createAttributeTableController,
  resolveAttributeTableUi,
  resolveAttributeTableUiOption,
  takePendingAttributeTableSelectRows,
  type AttributeTableController,
  type AttributeTableProps,
  type AttributeTableRow,
  type AttributeTableSelectRowsPayload,
  type AttributeTableViewLabels,
  type AttributeTableViewProps,
} from '@hungpvq/map-dataset/attribute-table';
import {
  createMenuConditionContext,
  getItemMenuHost,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemDisabled,
  isMenuItemHidden,
  MENU_CONTROL_ID,
} from '@hungpvq/map-dataset/menu';
import {
  clearGeoExportActiveSource,
  openGeoExportModalFromAttributeTable,
  resolveAttributeTableGeoExport,
  runGeoExportClickFromAttributeTable,
  runGeoExportFormatFromAttributeTable,
  setGeoExportActiveSource,
  type GeoExportFormat,
} from '@hungpvq/map-dataset/geo-export';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  ModuleContainer,
  RegistryItem,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import type { Feature } from 'geojson';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MenuConditionProvider } from '../../extra/menu/condition-context';
import { DatasetMenus } from '../../extra/menu/dataset-menus';
import { useMapHighlight } from '../../store/highlight';
import { AttributeTableView } from './AttributeTableView';

export function AttributeTable(props: AttributeTableProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap({
    ...merged,
    controlId: ATTRIBUTE_TABLE_CONTROL.id,
  });
  const hl = useMapHighlight(mapId);
  const hlRef = useRef(hl);
  hlRef.current = hl;
  const { trans, registerLocale } = useLang(mapId);
  const [show, toggleShow] = useShow(true);
  const toggleShowRef = useRef(toggleShow);
  toggleShowRef.current = toggleShow;
  const [tick, setTick] = useState(0);

  const localeReady = useRef(false);
  if (!localeReady.current) {
    registerLocale('en', ATTRIBUTE_TABLE_LOCALE);
    localeReady.current = true;
  }

  const clearHighlight = useCallback(() => {
    hlRef.current.hideIfSource('attribute-table');
  }, []);
  const clearHighlightRef = useRef(clearHighlight);
  clearHighlightRef.current = clearHighlight;

  const controllerRef = useRef<AttributeTableController | null>(null);
  const [controller, setController] = useState<AttributeTableController | null>(
    null,
  );

  const zoomMapToSelection = useCallback(
    async (ctrl?: AttributeTableController | null) => {
      const targetCtrl = ctrl ?? controllerRef.current;
      if (!targetCtrl) return;
      const rows = await targetCtrl.resolveFeaturesForSelection();
      const features = rows
        .map((row) => row.feature as Feature)
        .filter((feature): feature is Feature => !!feature?.geometry);
      if (!features.length) return;
      const target =
        features.length === 1
          ? features[0]!
          : ({ type: 'FeatureCollection', features } as const);
      getMap(mapId, (map) => {
        fitBounds(map, target);
      });
    },
    [mapId],
  );
  const zoomMapToSelectionRef = useRef(zoomMapToSelection);
  zoomMapToSelectionRef.current = zoomMapToSelection;

  const applySelection = useCallback(
    (ctrl: AttributeTableController, focus?: AttributeTableRow) => {
      const s = ctrl.getState();
      const selected = s.rows.filter((row) => s.selectedIds.includes(row.id));
      if (selected.length === 0) {
        clearHighlight();
        return;
      }
      const current = focus ?? selected[0];
      void hlRef.current.show(current.feature as Feature, {
        source: 'attribute-table',
        dataset: props.layer,
      });
      if (!s.zoomToSelection) return;
      void zoomMapToSelectionRef.current(ctrl);
    },
    [clearHighlight, props.layer],
  );
  const applySelectionRef = useRef(applySelection);
  applySelectionRef.current = applySelection;

  useEffect(() => {
    const ui = resolveAttributeTableUiOption(props.layer, props.ui);
    const next = createAttributeTableController(props.layer, {
      columns: props.columns,
      store: props.store,
      rowFilter: props.rowFilter,
      sortable: resolveAttributeTableUi(ui).sort,
    });
    controllerRef.current = next;
    setController(next);

    setGeoExportActiveSource(mapId, {
      layerId: props.layer.id,
      getSearch: () => next.getState().search,
      getSort: () => next.getState().sortStates,
      getSelectedIds: () => next.getState().selectedIds,
      resolveSelectedCollection: async (ids) => {
        const rows = await next.resolveFeaturesForSelection(ids);
        return {
          type: 'FeatureCollection',
          features: rows.map((row) => row.feature as Feature),
        };
      },
      resolveFilteredCollection: async () => {
        const rows = await next.resolveFilteredFeatures();
        return {
          type: 'FeatureCollection',
          features: rows.map((row) => row.feature as Feature),
        };
      },
    });

    const unsub = next.subscribe(() => {
      setTick((v) => v + 1);
      applySelectionRef.current(next);
    });

    // Re-open when addComponent updates the same `check` while hidden via toggle.
    toggleShowRef.current(true);

    void (async () => {
      const queued = takePendingAttributeTableSelectRows(mapId);
      await next.load('initial');
      if (queued) {
        toggleShowRef.current(true);
        await next.selectIds(queued);
      }
    })();

    return () => {
      unsub();
      clearGeoExportActiveSource(mapId, props.layer.id);
      next.dispose();
      clearHighlightRef.current();
    };
  }, [
    props.layer,
    props.columns,
    props.store,
    props.rowFilter,
    props.ui,
    mapId,
  ]);

  useEffect(() => {
    if (props.revision == null) return;
    toggleShowRef.current(true);
  }, [props.revision]);

  const state = useMemo(() => {
    void tick;
    return controller?.getState() ?? null;
  }, [controller, tick]);

  const labels = useMemo(
    (): AttributeTableViewLabels => ({
      search: trans('map.attribute-table.search'),
      zoomToSelection: trans('map.attribute-table.zoomToSelection'),
      showAll: trans('map.attribute-table.showAll'),
      showSelected: trans('map.attribute-table.showSelected'),
      clear: trans('map.attribute-table.clear'),
      loading: trans('map.attribute-table.loading'),
      empty: trans('map.attribute-table.empty'),
      page: trans('map.attribute-table.page'),
      of: trans('map.attribute-table.of'),
      prev: trans('map.attribute-table.prev'),
      next: trans('map.attribute-table.next'),
      rowsPerPage: trans('map.attribute-table.rowsPerPage'),
      table: trans('map.attribute-table.table'),
      gridRegion: trans('map.attribute-table.gridRegion'),
      selectAll: trans('map.attribute-table.selectAll'),
      selectRow: trans('map.attribute-table.selectRow'),
      actionsColumn: trans('map.attribute-table.actionsColumn'),
      rowFilter: trans('map.attribute-table.rowFilter'),
      columnFilter: trans('map.attribute-table.columnFilter'),
      columnFilterQuery: trans('map.attribute-table.columnFilterQuery'),
      columnFilterQueryEquals: trans(
        'map.attribute-table.columnFilterQueryEquals',
      ),
      columnFilterQueryNumber: trans(
        'map.attribute-table.columnFilterQueryNumber',
      ),
      columnFilterQueryNumberBetween: trans(
        'map.attribute-table.columnFilterQueryNumberBetween',
      ),
      columnFilterQueryDate: trans('map.attribute-table.columnFilterQueryDate'),
      clearColumnFilter: trans('map.attribute-table.clearColumnFilter'),
      columnFilterFor: trans('map.attribute-table.columnFilterFor'),
      columnFilterMode: trans('map.attribute-table.columnFilterMode'),
      columnFilterModeContains: trans(
        'map.attribute-table.columnFilterModeContains',
      ),
      columnFilterModeEquals: trans(
        'map.attribute-table.columnFilterModeEquals',
      ),
      columnFilterModeNumberEq: trans(
        'map.attribute-table.columnFilterModeNumberEq',
      ),
      columnFilterModeNumberGte: trans(
        'map.attribute-table.columnFilterModeNumberGte',
      ),
      columnFilterModeNumberLte: trans(
        'map.attribute-table.columnFilterModeNumberLte',
      ),
      columnFilterModeNumberBetween: trans(
        'map.attribute-table.columnFilterModeNumberBetween',
      ),
      columnFilterModeDateEq: trans(
        'map.attribute-table.columnFilterModeDateEq',
      ),
      columnFilterModeDateGte: trans(
        'map.attribute-table.columnFilterModeDateGte',
      ),
      columnFilterModeDateLte: trans(
        'map.attribute-table.columnFilterModeDateLte',
      ),
      columnsVisibility: trans('map.attribute-table.columnsVisibility'),
      columnsShowAll: trans('map.attribute-table.columnsShowAll'),
      sortedAsc: trans('map.attribute-table.sortedAsc'),
      sortedDesc: trans('map.attribute-table.sortedDesc'),
      notSorted: trans('map.attribute-table.notSorted'),
      selectionStatus: trans('map.attribute-table.selectionStatus'),
      export: trans('map.attribute-table.export'),
    }),
    [trans],
  );

  const title = useMemo(() => {
    const name = props.layer?.getName?.() || trans('map.attribute-table.title');
    const count = state?.total ?? 0;
    if (!count && !state?.loading) return trans('map.attribute-table.title');
    if (!count) return name;
    const selected = state?.selectedIds.length ?? 0;
    return selected
      ? `${name} (${count}, ${selected} selected)`
      : `${name} (${count})`;
  }, [props.layer, state, trans]);

  /**
   * X / Escape: hide only. Keep the table mounted so `mapAttributeTable`
   * stays registered and toggle show / selectRows keep working.
   * Removal from ComponentManagement is via `onClose` from parent if needed.
   */
  function handleClose() {
    clearHighlight();
    toggleShow(false);
  }

  const { panelBind } = useRegisterMapControl(mapId, {
    id: ATTRIBUTE_TABLE_CONTROL.id,
    panelKind: 'popup',
    title,
    buttonPosition: merged.position,
    show,
    setShow: (v) => {
      // Hide/show only — do not call onClose (that unmounts via ComponentManagement).
      toggleShow(v);
      if (!v) clearHighlight();
    },
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [
      {
        type: ATTRIBUTE_TABLE_CONTROL.id,
        run: () => {
          toggleShow();
        },
      },
      {
        type: ATTRIBUTE_TABLE_CONTROL.actionSelectRows,
        run: (event) => {
          const ids = (
            (event as AttributeTableSelectRowsPayload | undefined)?.ids ?? []
          ).map(String);
          clearPendingAttributeTableSelectRows(mapId);
          toggleShow(true);
          void controllerRef.current?.selectIds(ids);
        },
      },
    ],
  });

  useEffect(() => {
    if (!show) clearHighlight();
  }, [show, clearHighlight]);

  const itemMenuHost = getItemMenuHost(props.layer);
  const itemMenuConditionCtx = createMenuConditionContext(itemMenuHost, {
    mapId,
  });
  const resolvedUi = resolveAttributeTableUiOption(props.layer, props.ui);
  const itemMenus =
    resolvedUi?.rowMenus === false
      ? []
      : getResolvedMenus(props.layer, 'item').filter(
          (menu) =>
            menu.type !== 'divider' &&
            !isMenuItemHidden(menu, itemMenuConditionCtx),
        );
  const layerTitleMenus = getResolvedMenus(props.layer, 'layer');

  if (!controller) return null;

  const geo = resolveAttributeTableGeoExport(props.layer);
  const menuMode = geo.uiMode === 'menu';
  const clickMode = geo.uiMode === 'click';

  const viewProps: AttributeTableViewProps = {
    mapId,
    layer: props.layer,
    controller,
    pageSizeItems: [...ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS],
    labels,
    ui: resolvedUi,
    itemMenus,
    itemMenuHost,
    isMenuDisabled: (menu) => isMenuItemDisabled(menu, itemMenuConditionCtx),
    onRowMenuAction: (row, menu, event) => {
      if (isMenuItemDisabled(menu, itemMenuConditionCtx)) return;
      handleMenuAction(menu, {
        event,
        layer: itemMenuHost,
        mapId,
        value: convertFeatureToItem(row.feature),
        context: { control: MENU_CONTROL_ID.attributeTable },
      });
    },
    onZoomToSelection: () => {
      void zoomMapToSelection();
    },
    onExport: menuMode
      ? undefined
      : (event) => {
          if (clickMode) {
            void runGeoExportClickFromAttributeTable({
              layer: props.layer,
              mapId,
              event,
            });
            return;
          }
          openGeoExportModalFromAttributeTable({
            layer: props.layer,
            mapId,
            event,
          });
        },
    exportFormats: menuMode ? geo.formats : undefined,
    onExportFormat: menuMode
      ? (format, event) => {
          void runGeoExportFormatFromAttributeTable({
            layer: props.layer,
            mapId,
            format: format as GeoExportFormat,
            event,
          });
        }
      : undefined,
  };

  return (
    <MenuConditionProvider
      value={{ control: MENU_CONTROL_ID.attributeTable }}
    >
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <DraggableItemPopup
          show={show}
          width={760}
          height={460}
          title={title}
          onClose={handleClose}
          onUpdateShow={(v) => {
            toggleShow(v);
            if (!v) clearHighlight();
          }}
          afterTitle={
            <DatasetMenus
              menus={layerTitleMenus}
              data={props.layer}
              mapId={mapId}
              locations={['title']}
            />
          }
          {...bind}
          {...panelBind}
        >
          <RegistryItem
            componentKey={ATTRIBUTE_TABLE_COMPONENT_KEY.view}
            defaultComponent={AttributeTableView}
            mapId={mapId}
            {...viewProps}
          />
        </DraggableItemPopup>
      )}
    />
    </MenuConditionProvider>
  );
}
