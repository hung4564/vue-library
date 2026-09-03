import {
  filterMapControls,
  REGISTRY_CONTROL_LOCALE,
  type MapControlHandle,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiConsole } from '@mdi/js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapCommonButton } from '../../components/MapCommonButton';
import {
  UniversalRegistry,
  useLang,
  useRegisterMapControl,
  useToolbarControl,
} from '../../extra';
import { InputSelect } from '../../field';
import { defaultMapProps, useMap, useShow } from '../../hooks';
import { ModuleContainer } from '../ModuleContainer/ModuleContainer';

export interface RegistryControlProps extends WithMapPropType {
  show?: boolean;
}

const CONTROL_ID = 'mapRegistryControl';

export function RegistryControl(props: RegistryControlProps) {
  const merged = {
    ...defaultMapProps,
    position: 'top-right' as const,
    ...props,
  };
  const { mapId, moduleContainerProps, order } = useMap({
    ...merged,
    controlId: CONTROL_ID,
  });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, setShow] = useShow(props.show ?? false);
  const [controls, setControls] = useState<MapControlHandle[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    setLocaleDefault(REGISTRY_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const refresh = useCallback(() => {
    if (!mapId) return;
    const next = UniversalRegistry.listControls(mapId);
    setControls(next);
    if (selectedId && !next.some((ctrl) => ctrl.id === selectedId)) {
      setSelectedId('');
      setActionType('');
    }
  }, [mapId, selectedId]);

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

  const handleToggle = useCallback(() => {
    setShow(!show);
  }, [setShow, show]);

  const { panelBind } = useRegisterMapControl(mapId, {
    id: CONTROL_ID,
    panelKind: 'popup',
    title: trans('map.registry-control.title'),
    buttonPosition: merged.position,
    show,
    setShow,
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [{ type: CONTROL_ID, run: () => handleToggle() }],
  });

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: CONTROL_ID,
    getState: () => ({
      visible: true,
      active: show,
      title: trans('map.registry-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiConsole },
    }),
    onClick: () => handleToggle(),
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);

  function open() {
    if (!selectedId) return;
    UniversalRegistry.openControl(mapId, selectedId);
    refresh();
  }

  function close() {
    if (!selectedId) return;
    UniversalRegistry.closeControl(mapId, selectedId);
    refresh();
  }

  function movePopup() {
    if (!selectedId) return;
    UniversalRegistry.setControlPosition(mapId, selectedId, {
      top: 80 + Math.round(Math.random() * 120),
      right: 60 + Math.round(Math.random() * 80),
    });
    refresh();
  }

  function toggleSidebarSide() {
    if (!selected) return;
    const current = selected.getPanelPosition().location || 'left';
    UniversalRegistry.setControlPosition(mapId, selected.id, {
      location: current === 'left' ? 'right' : 'left',
    });
    refresh();
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
      btn={
        state ? (
          <MapCommonButton
            option={state}
            onClick={(e) => {
              e.stopPropagation();
              control.onAction(e.nativeEvent);
            }}
          />
        ) : null
      }
      draggable={(bind) =>
        show ? (
          <DraggableItemPopup
            show={show}
            onUpdateShow={(value) => setShow(!!value)}
            title={trans('map.registry-control.title')}
            height={580}
            width={400}
            {...bind}
            {...panelBind}
          >
            <div
              className="map-registry-control"
              aria-label={trans('map.registry-control.title')}
            >
              <header className="map-registry-control__header">
                <p className="map-registry-control__hint">
                  {trans('map.registry-control.hint')}
                </p>
                <button
                  type="button"
                  className="map-registry-control__btn"
                  onClick={refresh}
                >
                  {trans('map.registry-control.refresh')}
                </button>
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
                      <button
                        type="button"
                        className="map-registry-control__select"
                        onClick={() => {
                          setSelectedId(ctrl.id);
                          setActionType('');
                          refresh();
                        }}
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
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {selected ? (
                <section className="map-registry-control__detail">
                  <h3>{selected.id}</h3>
                  <pre className="map-registry-control__props">{propsJson}</pre>

                  <div className="map-registry-control__actions">
                    {selected.panelKind !== 'button' ? (
                      <>
                        <button
                          type="button"
                          className="map-registry-control__btn"
                          onClick={open}
                        >
                          {trans('map.registry-control.open')}
                        </button>
                        <button
                          type="button"
                          className="map-registry-control__btn"
                          onClick={close}
                        >
                          {trans('map.registry-control.close')}
                        </button>
                        {(selected.panelKind === 'popup' ||
                          selected.panelKind === 'float') && (
                          <button
                            type="button"
                            className="map-registry-control__btn"
                            onClick={movePopup}
                          >
                            {trans('map.registry-control.movePopup')}
                          </button>
                        )}
                        {selected.panelKind === 'sidebar' && (
                          <button
                            type="button"
                            className="map-registry-control__btn"
                            onClick={toggleSidebarSide}
                          >
                            {trans('map.registry-control.toggleSidebar')}
                          </button>
                        )}
                      </>
                    ) : null}

                    <div className="map-registry-control__run">
                      <InputSelect
                        label={trans('map.registry-control.actionType')}
                        value={actionType}
                        items={actionTypeItems}
                        onChange={(value) => setActionType(String(value))}
                      />
                      <button
                        type="button"
                        className="map-registry-control__btn"
                        onClick={run}
                      >
                        {trans('map.registry-control.runAction')}
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
          </DraggableItemPopup>
        ) : null
      }
    />
  );
}
