import type { MapControlHandle, WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  InputSelect,
  MapCommonButton,
  ModuleContainer,
  UniversalRegistry,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiConsole } from '@mdi/js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './registry-control-demo.css';

const CONTROL_ID = 'demoRegistryControl';

export function RegistryControlDemo(
  props: WithMapPropType & { show?: boolean },
) {
  const merged = {
    ...defaultMapProps,
    position: 'top-right' as const,
    ...props,
  };
  const { mapId, moduleContainerProps, order } = useMap({
    ...merged,
    controlId: 'demoRegistryControl',
  });
  const [show, setShow] = useShow(props.show ?? true);
  const [controls, setControls] = useState<MapControlHandle[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [actionType, setActionType] = useState('');

  const refresh = useCallback(() => {
    if (!mapId) return;
    const next = UniversalRegistry.listControls(mapId);
    setControls(next);
    if (selectedId && !next.some((c) => c.id === selectedId)) {
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

  const selected = useMemo(
    () => controls.find((c) => c.id === selectedId) ?? null,
    [controls, selectedId],
  );

  const propsJson = selected
    ? JSON.stringify(selected.props, null, 2)
    : '';

  const actionTypeItems = useMemo(
    () => [
      { value: '', text: '(default / single)' },
      ...(selected?.actions ?? []).map((action) => ({
        value: action.type,
        text: action.type,
      })),
    ],
    [selected],
  );

  const { panelBind } = useRegisterMapControl(mapId, {
    id: CONTROL_ID,
    panelKind: 'popup',
    title: 'UniversalRegistry controls',
    buttonPosition: merged.position,
    show,
    setShow,
    actions: [{ type: CONTROL_ID, run: () => setShow() }],
  });

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: CONTROL_ID,
    getState: () => ({
      visible: true,
      active: show,
      title: 'UniversalRegistry controls',
      order,
      icon: { type: 'mdi' as const, path: mdiConsole },
    }),
    onClick: () => setShow(),
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
            onUpdateShow={(v) => setShow(!!v)}
            title="UniversalRegistry controls"
            height={580}
            width={400}
            {...bind}
            {...panelBind}
          >
            <div
              className="registry-control-panel"
              aria-label="UniversalRegistry controls"
            >
              <header className="registry-control-panel__header">
                <p className="registry-control-panel__hint">
                  UniversalRegistry.openControl / closeControl /
                  setControlPosition / runControlAction
                </p>
                <button
                  type="button"
                  className="registry-control-panel__btn"
                  onClick={refresh}
                >
                  Refresh
                </button>
              </header>

              <ul className="registry-control-panel__list">
                {controls.map((ctrl) => (
                  <li
                    key={ctrl.id}
                    className={`registry-control-panel__item${
                      selectedId === ctrl.id ? ' is-selected' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="registry-control-panel__select"
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
                        <span>{ctrl.isOpen() ? 'open' : 'closed'}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>

              {selected ? (
                <section className="registry-control-panel__detail">
                  <h3>{selected.id}</h3>
                  <pre className="registry-control-panel__props">
                    {propsJson}
                  </pre>

                  <div className="registry-control-panel__actions">
                    {selected.panelKind !== 'button' ? (
                      <>
                        <button
                          type="button"
                          className="registry-control-panel__btn"
                          onClick={open}
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="registry-control-panel__btn"
                          onClick={close}
                        >
                          Close
                        </button>
                        {(selected.panelKind === 'popup' ||
                          selected.panelKind === 'float') && (
                          <button
                            type="button"
                            className="registry-control-panel__btn"
                            onClick={movePopup}
                          >
                            Move popup
                          </button>
                        )}
                        {selected.panelKind === 'sidebar' && (
                          <button
                            type="button"
                            className="registry-control-panel__btn"
                            onClick={toggleSidebarSide}
                          >
                            Toggle sidebar side
                          </button>
                        )}
                      </>
                    ) : null}

                    <div className="registry-control-panel__run">
                      <InputSelect
                        label="Action type"
                        value={actionType}
                        items={actionTypeItems}
                        onChange={(v) => setActionType(String(v))}
                      />
                      <button
                        type="button"
                        className="registry-control-panel__btn"
                        onClick={run}
                      >
                        runAction
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
