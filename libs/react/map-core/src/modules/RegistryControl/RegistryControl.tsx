import {
  type ButtonInMobile,
  type ControlLayout,
  filterMapControls,
  type MapControlHandle,
  type MapControlPanelPosition,
  moduleDraggableHostId,
  type Position,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  DraggableItemPopup,
  useContainerReactive,
  useDragStore,
} from '@hungpvq/react-draggable';
import { mdiConsole } from '@mdi/js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MapControlButton } from '../../components/MapControlButton';
import { type MapTabItem, MapTabs } from '../../components/MapTabs';
import { useLang } from '../../extra/lang/hook';
import { UniversalRegistry } from '../../extra/registry/plugin';
import { useMapControl } from '../../extra/registry/useMapControl';
import { InputCheckbox, InputSelect, InputText } from '../../field';
import { defaultMapProps, useMap } from '../../hooks/useMap';
import { useShow } from '../../hooks/useShow';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface RegistryControlProps extends WithMapPropType {
  show?: boolean;
}

const CONTROL_ID = 'mapRegistryControl';

const POSITION_ITEMS = [
  { value: 'top-left', text: 'top-left' },
  { value: 'top-right', text: 'top-right' },
  { value: 'bottom-left', text: 'bottom-left' },
  { value: 'bottom-right', text: 'bottom-right' },
];

const CONTROL_LAYOUT_ITEMS = [
  { value: 'standalone', text: 'standalone' },
  { value: 'toolbar', text: 'toolbar' },
  { value: 'button', text: 'button' },
];

const LOCATION_ITEMS = [
  { value: 'left', text: 'left' },
  { value: 'right', text: 'right' },
  { value: 'top', text: 'top' },
  { value: 'bottom', text: 'bottom' },
];

type PanelOffsetDraft = {
  top: string;
  right: string;
  bottom: string;
  left: string;
  width: string;
  height: string;
  location: 'left' | 'right' | 'top' | 'bottom';
  /** Desired open/closed after Apply panel. */
  open: boolean;
};

function parseOptionalNumber(
  raw: string | number | null | undefined,
): number | undefined {
  if (raw == null || raw === '') return undefined;
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : undefined;
  }
  const trimmed = String(raw).trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function RegistryControl(props: RegistryControlProps) {
  const merged = {
    ...defaultMapProps,
    position: 'top-right' as const,
    ...props,
  };
  const { mapId, order } = useMap({
    ...merged,
    controlId: CONTROL_ID,
  });
  const { trans } = useLang(mapId);
  const [show, setShow] = useShow(props.show ?? false);
  const [showDetail, setShowDetail] = useState(false);
  const [controls, setControls] = useState<MapControlHandle[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [actionType, setActionType] = useState('');
  const [layoutDraft, setLayoutDraft] = useState({
    visible: true,
    position: 'bottom-right' as Position,
    order: 0,
    controlLayout: 'standalone' as ControlLayout,
    buttonInMobile: '' as '' | ButtonInMobile,
  });
  const [panelDraft, setPanelDraft] = useState<PanelOffsetDraft>({
    top: '',
    right: '',
    bottom: '',
    left: '',
    width: '',
    height: '',
    location: 'left',
    open: false,
  });
  const [detailTab, setDetailTab] = useState('props');

  const closeDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedId('');
    setActionType('');
    setDetailTab('props');
  }, []);

  const syncLayoutDraft = useCallback((ctrl: MapControlHandle | null) => {
    if (!ctrl?.getLayout) return;
    const lay = ctrl.getLayout();
    setLayoutDraft({
      visible: lay.visible,
      position: lay.position,
      order: lay.order,
      controlLayout: lay.controlLayout,
      buttonInMobile: lay.buttonInMobile ?? '',
    });
  }, []);

  const syncPanelDraft = useCallback((ctrl: MapControlHandle | null) => {
    if (!ctrl) return;
    const pos = ctrl.getPanelPosition();
    setPanelDraft({
      top: pos.top != null ? String(pos.top) : '',
      right: pos.right != null ? String(pos.right) : '',
      bottom: pos.bottom != null ? String(pos.bottom) : '',
      left: pos.left != null ? String(pos.left) : '',
      width: pos.width != null ? String(pos.width) : '',
      height: pos.height != null ? String(pos.height) : '',
      location: pos.location || 'left',
      open: ctrl.isOpen(),
    });
  }, []);

  const dragContainerId = mapId ? moduleDraggableHostId(mapId) : '';
  useContainerReactive(dragContainerId || '__registry-panel-idle__');
  const dragStore = useDragStore();
  const selectedDragBounds =
    showDetail && selectedId && dragContainerId
      ? dragStore.container[dragContainerId]?.layouts?.[selectedId]?.bounds
      : undefined;

  const applyingPanelRef = useRef(false);

  useEffect(() => {
    if (applyingPanelRef.current) return;
    if (!showDetail || !selectedId) return;
    const ctrl = controls.find((c) => c.id === selectedId) ?? null;
    syncPanelDraft(ctrl);
  }, [selectedDragBounds, showDetail, selectedId, controls, syncPanelDraft]);

  const refresh = useCallback(() => {
    if (!mapId) return;
    const next = UniversalRegistry.listControls(mapId);
    setControls(next);
    if (selectedId && !next.some((ctrl) => ctrl.id === selectedId)) {
      closeDetail();
      return;
    }
    if (selectedId) {
      const ctrl = next.find((c) => c.id === selectedId);
      syncLayoutDraft(ctrl ?? null);
      syncPanelDraft(ctrl ?? null);
    }
  }, [mapId, selectedId, syncLayoutDraft, syncPanelDraft, closeDetail]);

  useEffect(() => {
    if (!mapId) return;
    refresh();
    let n = 0;
    const timer = setInterval(() => {
      refresh();
      n += 1;
      if (n >= 8) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [mapId, refresh]);

  const filtered = useMemo(
    () => filterMapControls(controls, query),
    [controls, query],
  );

  const selected = useMemo(
    () => controls.find((ctrl) => ctrl.id === selectedId) ?? null,
    [controls, selectedId],
  );

  const showPanelSection =
    selected?.panelKind === 'popup' ||
    selected?.panelKind === 'float' ||
    selected?.panelKind === 'sidebar';

  /** Popup/float only use the two edges of the button corner (e.g. bottom-right). */
  const panelEdgeFields = useMemo(() => {
    const corner = layoutDraft.position;
    return {
      top: corner.includes('top'),
      bottom: corner.includes('bottom'),
      left: corner.includes('left'),
      right: corner.includes('right'),
    };
  }, [layoutDraft.position]);

  const detailTabItems = useMemo((): MapTabItem[] => {
    const items: MapTabItem[] = [
      {
        id: 'props',
        label: trans('map.registry-control.propsSection'),
      },
      {
        id: 'layout',
        label: trans('map.registry-control.layoutSection'),
      },
    ];
    if (showPanelSection) {
      items.push({
        id: 'panel',
        label: trans('map.registry-control.panelSection'),
      });
    }
    return items;
  }, [showPanelSection, trans]);

  useEffect(() => {
    if (!showPanelSection && detailTab === 'panel') setDetailTab('layout');
  }, [showPanelSection, detailTab]);

  useEffect(() => {
    setDetailTab('props');
  }, [selectedId]);

  const detailTitle = useMemo(() => {
    if (!selected) return trans('map.registry-control.detailTitle');
    return selected.title ? `${selected.id} · ${selected.title}` : selected.id;
  }, [selected, trans]);

  const propsJson = selected ? JSON.stringify(selected.props, null, 2) : '';

  const actionTypeItems = useMemo(
    () => [
      { value: '', text: trans('map.registry-control.actionDefault') },
      ...(selected?.actions ?? []).map((action) => ({
        value: action.type,
        text: action.type,
      })),
    ],
    [selected, trans],
  );

  const buttonInMobileItems = useMemo(
    () => [
      {
        value: '',
        text: trans('map.registry-control.layoutInherit'),
      },
      { value: 'button', text: 'button' },
      { value: 'toolbar', text: 'toolbar' },
      { value: 'menu', text: 'menu' },
    ],
    [trans],
  );

  const handleToggle = useCallback(() => {
    setShow(!show);
  }, [setShow, show]);

  const { moduleContainerProps, panelBind, control } = useMapControl(mapId, {
    id: CONTROL_ID,
    panelKind: 'popup',
    title: trans('map.registry-control.title'),
    from: merged,
    order,
    show,
    setShow,
    defaultPanelSize: { width: 360, height: 420 },
    actions: [{ type: CONTROL_ID, run: () => handleToggle() }],
    getButtonState: () =>
      mdiButtonState(mdiConsole, {
        visible: true,
        active: show,
        title: trans('map.registry-control.title'),
        order,
      }),
    onClick: () => handleToggle(),
  });

  useEffect(() => {
    control.sync();
    if (!show) closeDetail();
  }, [show, control, closeDetail]);

  useEffect(() => {
    if (!showDetail && selectedId) {
      setSelectedId('');
      setActionType('');
    }
  }, [showDetail, selectedId]);

  function select(id: string) {
    setSelectedId(id);
    setActionType('');
    setShowDetail(true);
    refresh();
  }

  function applyLayout() {
    if (!selectedId) return;
    UniversalRegistry.setControlLayout(mapId, selectedId, {
      visible: layoutDraft.visible,
      position: layoutDraft.position,
      order: Number(layoutDraft.order) || 0,
      controlLayout: layoutDraft.controlLayout,
      buttonInMobile: layoutDraft.buttonInMobile
        ? layoutDraft.buttonInMobile
        : undefined,
    });
    refresh();
  }

  function applyPanel() {
    if (!selectedId || !selected) return;
    const kind = selected.panelKind;
    const pos: MapControlPanelPosition = {};
    if (kind === 'sidebar') {
      pos.location = panelDraft.location;
    } else {
      if (panelEdgeFields.top) {
        const top = parseOptionalNumber(panelDraft.top);
        if (top != null) pos.top = top;
      }
      if (panelEdgeFields.right) {
        const right = parseOptionalNumber(panelDraft.right);
        if (right != null) pos.right = right;
      }
      if (panelEdgeFields.bottom) {
        const bottom = parseOptionalNumber(panelDraft.bottom);
        if (bottom != null) pos.bottom = bottom;
      }
      if (panelEdgeFields.left) {
        const left = parseOptionalNumber(panelDraft.left);
        if (left != null) pos.left = left;
      }
      const width = parseOptionalNumber(panelDraft.width);
      const height = parseOptionalNumber(panelDraft.height);
      if (width != null) pos.width = width;
      if (height != null) pos.height = height;
    }
    const snapshot = { ...panelDraft };
    applyingPanelRef.current = true;
    UniversalRegistry.setControlPosition(mapId, selectedId, pos);
    // Wait for useMapControl setPanelPosition close→writeBounds→reopen tick.
    queueMicrotask(() => {
      if (snapshot.open) {
        UniversalRegistry.openControl(mapId, selectedId);
      } else {
        UniversalRegistry.closeControl(mapId, selectedId);
      }
      refresh();
      setPanelDraft(snapshot);
      applyingPanelRef.current = false;
    });
  }

  function run() {
    if (!selectedId) return;
    UniversalRegistry.runControlAction(
      mapId,
      selectedId,
      actionType || undefined,
    );
    refresh();
  }

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <>
          {show ? (
            <DraggableItemPopup
              show={show}
              onUpdateShow={(value) => setShow(!!value)}
              title={trans('map.registry-control.title')}
              {...bind}
              {...panelBind}
              id={`${CONTROL_ID}-list`}
            >
              <div
                className="map-registry-control map-registry-control--list"
                aria-label={trans('map.registry-control.title')}
              >
                <header className="map-registry-control__header">
                  <p className="map-registry-control__hint">
                    {trans('map.registry-control.hint')}
                  </p>
                  <MapControlButton
                    className="map-registry-control__btn"
                    variant="outlined"
                    size="small"
                    onClick={refresh}
                  >
                    {trans('map.registry-control.refresh')}
                  </MapControlButton>
                </header>

                <input
                  type="search"
                  className="map-registry-control__search"
                  value={query}
                  aria-label={trans('map.registry-control.search')}
                  placeholder={trans('map.registry-control.searchPlaceholder')}
                  onChange={(e) => setQuery(e.target.value)}
                />

                {filtered.length === 0 ? (
                  <p className="map-registry-control__empty">
                    {trans('map.registry-control.empty')}
                  </p>
                ) : (
                  <ul className="map-registry-control__list">
                    {filtered.map((ctrl) => (
                      <li
                        key={ctrl.id}
                        className={`map-registry-control__item${
                          selectedId === ctrl.id ? ' is-selected' : ''
                        }`}
                      >
                        <div
                          className="map-registry-control__select clickable"
                          onClick={() => select(ctrl.id)}
                        >
                          <strong>{ctrl.id}</strong>
                          <span>{ctrl.panelKind}</span>
                          {ctrl.title ? <span>{ctrl.title}</span> : null}
                          {ctrl.panelKind !== 'button' ? (
                            <span>
                              {ctrl.isOpen()
                                ? trans('map.registry-control.openState')
                                : trans('map.registry-control.closedState')}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DraggableItemPopup>
          ) : null}

          {showDetail && selected ? (
            <DraggableItemPopup
              id={`${CONTROL_ID}-detail`}
              show={showDetail}
              onUpdateShow={(value) => setShowDetail(!!value)}
              title={detailTitle}
              height={560}
              width={400}
              top={bind.top != null ? bind.top + 28 : undefined}
              bottom={bind.bottom != null ? bind.bottom + 28 : undefined}
              left={bind.left != null ? bind.left + 28 : undefined}
              right={bind.right != null ? bind.right + 380 : undefined}
              containerId={bind.containerId}
            >
              <div
                className="map-registry-control map-registry-control--detail"
                aria-label={detailTitle}
              >
                <MapTabs
                  items={detailTabItems}
                  value={detailTab}
                  onChange={setDetailTab}
                  panes={{
                    props: (
                      <div className="map-registry-control__layout map-registry-control__props-pane">
                        <pre className="map-registry-control__props">
                          {propsJson}
                        </pre>
                        <div className="map-registry-control__run">
                          <InputSelect
                            label={trans('map.registry-control.actionType')}
                            value={actionType}
                            items={actionTypeItems}
                            onChange={(value) => setActionType(String(value))}
                          />
                          <MapControlButton
                            className="map-registry-control__btn"
                            variant="outlined"
                            size="small"
                            onClick={run}
                          >
                            {trans('map.registry-control.runAction')}
                          </MapControlButton>
                        </div>
                      </div>
                    ),
                    layout: (
                      <div className="map-registry-control__layout">
                        <div className="map-registry-control__layout-fields">
                          <div className="map-registry-control__layout-span">
                            <InputCheckbox
                              checked={layoutDraft.visible}
                              label={trans(
                                'map.registry-control.layoutVisible',
                              )}
                              onChange={(visible) =>
                                setLayoutDraft((prev) => ({
                                  ...prev,
                                  visible,
                                }))
                              }
                            />
                          </div>
                          <div className="map-registry-control__layout-span">
                            <InputSelect
                              label={trans(
                                'map.registry-control.layoutPosition',
                              )}
                              value={layoutDraft.position}
                              items={POSITION_ITEMS}
                              onChange={(value) =>
                                setLayoutDraft((prev) => ({
                                  ...prev,
                                  position: String(value) as Position,
                                }))
                              }
                            />
                          </div>
                          <InputText
                            type="number"
                            label={trans('map.registry-control.layoutOrder')}
                            value={String(layoutDraft.order)}
                            onChange={(value) =>
                              setLayoutDraft((prev) => ({
                                ...prev,
                                order: Number(value) || 0,
                              }))
                            }
                          />
                          <InputSelect
                            label={trans(
                              'map.registry-control.layoutControlLayout',
                            )}
                            value={layoutDraft.controlLayout}
                            items={CONTROL_LAYOUT_ITEMS}
                            onChange={(value) =>
                              setLayoutDraft((prev) => ({
                                ...prev,
                                controlLayout: String(value) as ControlLayout,
                              }))
                            }
                          />
                          <div className="map-registry-control__layout-span">
                            <InputSelect
                              label={trans(
                                'map.registry-control.layoutButtonInMobile',
                              )}
                              value={layoutDraft.buttonInMobile}
                              items={buttonInMobileItems}
                              onChange={(value) =>
                                setLayoutDraft((prev) => ({
                                  ...prev,
                                  buttonInMobile: String(value) as
                                    '' | ButtonInMobile,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="map-registry-control__layout-footer">
                          <MapControlButton
                            className="map-registry-control__btn"
                            variant="outlined"
                            size="small"
                            onClick={applyLayout}
                          >
                            {trans('map.registry-control.layoutApply')}
                          </MapControlButton>
                        </div>
                      </div>
                    ),
                    panel: showPanelSection ? (
                      <div className="map-registry-control__layout">
                        {selected?.panelKind === 'sidebar' ? (
                          <div className="map-registry-control__layout-fields">
                            <div className="map-registry-control__layout-span">
                              <InputSelect
                                label={trans(
                                  'map.registry-control.panelLocation',
                                )}
                                value={panelDraft.location}
                                items={LOCATION_ITEMS}
                                onChange={(value) =>
                                  setPanelDraft((prev) => ({
                                    ...prev,
                                    location: String(
                                      value,
                                    ) as PanelOffsetDraft['location'],
                                  }))
                                }
                              />
                            </div>
                            <div className="map-registry-control__layout-span">
                              <InputCheckbox
                                label={trans(
                                  'map.registry-control.panelShowState',
                                )}
                                checked={panelDraft.open}
                                onChange={(checked) =>
                                  setPanelDraft((prev) => ({
                                    ...prev,
                                    open: checked,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="map-registry-control__layout-fields">
                            {panelEdgeFields.top ? (
                              <InputText
                                type="number"
                                label={trans('map.registry-control.panelTop')}
                                value={panelDraft.top}
                                onChange={(value) =>
                                  setPanelDraft((prev) => ({
                                    ...prev,
                                    top: value,
                                  }))
                                }
                              />
                            ) : null}
                            {panelEdgeFields.right ? (
                              <InputText
                                type="number"
                                label={trans('map.registry-control.panelRight')}
                                value={panelDraft.right}
                                onChange={(value) =>
                                  setPanelDraft((prev) => ({
                                    ...prev,
                                    right: value,
                                  }))
                                }
                              />
                            ) : null}
                            {panelEdgeFields.bottom ? (
                              <InputText
                                type="number"
                                label={trans(
                                  'map.registry-control.panelBottom',
                                )}
                                value={panelDraft.bottom}
                                onChange={(value) =>
                                  setPanelDraft((prev) => ({
                                    ...prev,
                                    bottom: value,
                                  }))
                                }
                              />
                            ) : null}
                            {panelEdgeFields.left ? (
                              <InputText
                                type="number"
                                label={trans('map.registry-control.panelLeft')}
                                value={panelDraft.left}
                                onChange={(value) =>
                                  setPanelDraft((prev) => ({
                                    ...prev,
                                    left: value,
                                  }))
                                }
                              />
                            ) : null}
                            <InputText
                              type="number"
                              label={trans('map.registry-control.panelWidth')}
                              value={panelDraft.width}
                              onChange={(value) =>
                                setPanelDraft((prev) => ({
                                  ...prev,
                                  width: value,
                                }))
                              }
                            />
                            <InputText
                              type="number"
                              label={trans('map.registry-control.panelHeight')}
                              value={panelDraft.height}
                              onChange={(value) =>
                                setPanelDraft((prev) => ({
                                  ...prev,
                                  height: value,
                                }))
                              }
                            />
                            <div className="map-registry-control__layout-span">
                              <InputCheckbox
                                label={trans(
                                  'map.registry-control.panelShowState',
                                )}
                                checked={panelDraft.open}
                                onChange={(checked) =>
                                  setPanelDraft((prev) => ({
                                    ...prev,
                                    open: checked,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        )}
                        <div className="map-registry-control__layout-footer">
                          <MapControlButton
                            className="map-registry-control__btn"
                            variant="outlined"
                            size="small"
                            onClick={applyPanel}
                          >
                            {trans('map.registry-control.panelApply')}
                          </MapControlButton>
                        </div>
                      </div>
                    ) : null,
                  }}
                />
              </div>
            </DraggableItemPopup>
          ) : null}
        </>
      )}
    />
  );
}
