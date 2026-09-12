import { fitBounds, getMap } from '@hungpvq/map-core';
import { convertFeatureToItem } from '@hungpvq/map-dataset';
import {
  ATTRIBUTE_TABLE_COMPONENT_KEY,
  ATTRIBUTE_TABLE_CONTROL,
  ATTRIBUTE_TABLE_LOCALE,
  ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS,
  clearPendingAttributeTableSelectRows,
  createAttributeTableController,
  resolveAttributeTableExportOption,
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
import { GEO_EXPORT_FORMAT_META } from '@hungpvq/map-dataset/geo-export';
import {
  createMenuConditionContext,
  getItemMenuHost,
  getResolvedMenus,
  handleMenuAction,
  isMenuItemDisabled,
  isMenuItemHidden,
} from '@hungpvq/map-dataset/menu';
import {
  ContextMenu,
  DraggableItemPopup,
  type ContextMenuRef,
} from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  ModuleContainer,
  RegistryItem,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import type { Feature } from 'geojson';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMapDatasetHighlight } from '../../store';
import { AttributeTableView } from './AttributeTableView';

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
  const toggleShowRef = useRef(toggleShow);
  toggleShowRef.current = toggleShow;
  const [tick, setTick] = useState(0);
  const exportMenuRef = useRef<ContextMenuRef>(null);

  const localeReady = useRef(false);
  if (!localeReady.current) {
    setLocaleDefault(ATTRIBUTE_TABLE_LOCALE);
    localeReady.current = true;
  }

  const clearHighlight = useCallback(() => {
    if (getHighlightSourceRef.current() === 'attribute-table') {
      setFeatureHighlightRef.current(undefined, 'attribute-table');
    }
  }, []);
  const clearHighlightRef = useRef(clearHighlight);
  clearHighlightRef.current = clearHighlight;

  const controllerRef = useRef<AttributeTableController | null>(null);
  const [controller, setController] = useState<AttributeTableController | null>(
    null,
  );

  const applySelection = useCallback(
    (ctrl: AttributeTableController, focus?: AttributeTableRow) => {
      const s = ctrl.getState();
      const selected = s.rows.filter((row) => s.selectedIds.includes(row.id));
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
      if (!s.zoomToSelection) return;
      getMap(mapId, (map) => {
        fitBounds(map, current.feature as Feature);
      });
    },
    [clearHighlight, mapId, props.layer],
  );
  const applySelectionRef = useRef(applySelection);
  applySelectionRef.current = applySelection;

  useEffect(() => {
    const ui = resolveAttributeTableUiOption(props.layer, props.ui);
    const next = createAttributeTableController(props.layer, {
      columns: props.columns,
      store: props.store,
      rowFilter: props.rowFilter,
      export: resolveAttributeTableExportOption(props.layer, props.export),
      sortable: resolveAttributeTableUi(ui).sort,
    });
    controllerRef.current = next;
    setController(next);

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
      next.dispose();
      clearHighlightRef.current();
    };
  }, [
    props.layer,
    props.columns,
    props.store,
    props.rowFilter,
    props.export,
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

  const exportActions = useMemo(() => {
    void tick;
    return controller?.getExportActions() ?? [];
  }, [controller, tick]);

  const labels = useMemo(
    (): AttributeTableViewLabels => ({
      search: trans('map.attribute-table.search'),
      zoomToSelection: trans('map.attribute-table.zoomToSelection'),
      showAll: trans('map.attribute-table.showAll'),
      showSelected: trans('map.attribute-table.showSelected'),
      clear: trans('map.attribute-table.clear'),
      export: trans('map.attribute-table.export'),
      exportSelected: trans('map.attribute-table.export-selected'),
      exporting: trans('map.attribute-table.exporting'),
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
      sortedAsc: trans('map.attribute-table.sortedAsc'),
      sortedDesc: trans('map.attribute-table.sortedDesc'),
      notSorted: trans('map.attribute-table.notSorted'),
      selectionStatus: trans('map.attribute-table.selectionStatus'),
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

  if (!controller) return null;

  const viewProps: AttributeTableViewProps = {
    mapId,
    layer: props.layer,
    controller,
    pageSizeItems: [...ATTRIBUTE_TABLE_PAGE_SIZE_ITEMS],
    labels,
    ui: resolvedUi,
    onExportClick: (event) => {
      if (!controller.canExport() || controller.getState().exporting) return;
      if (!controller.isExportMenuMode()) {
        void controller.export(undefined, { event });
        return;
      }
      exportMenuRef.current?.open(event);
    },
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
      });
    },
  };

  function onExportAction(actionId: string) {
    void controller?.export(actionId);
    exportMenuRef.current?.close();
  }

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
              toggleShow(v);
              if (!v) clearHighlight();
            }}
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
          {controller.isExportMenuMode() ? (
            <ContextMenu ref={exportMenuRef}>
              <ul className="context-menu layer-context-menu">
                {exportActions.map((item) => (
                  <li
                    key={item.id}
                    className="layer-context-menu__item"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportAction(item.id);
                    }}
                  >
                    <div className="layer-context-menu__item-icon">
                      <Icon path={item.icon || mdiDownload} size="16px" />
                    </div>
                    <span>
                      {item.label ||
                        (item.format
                          ? GEO_EXPORT_FORMAT_META[item.format].name
                          : item.id)}
                    </span>
                  </li>
                ))}
              </ul>
            </ContextMenu>
          ) : null}
        </>
      )}
    />
  );
}
