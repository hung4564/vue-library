import { useEffect, useMemo, useState } from 'react';
import type { WithMapPropType } from '@hungpvq/map-core';
import {
  EVENT_CONTROL_LOCALE,
  MittTypeMapEventEventKey,
  type IEvent,
  type MittTypeMapEvent,
} from '@hungpvq/map-core';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import { mdiCalendarSearch } from '@mdi/js';
import { MapCommonButton } from '../../../components/MapCommonButton';
import { defaultMapProps, useMap, useShow } from '../../../hooks';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useLang } from '../../lang';
import { useMapMittStore } from '../../mitt';
import { useRegisterMapControl } from '../../registry';
import { useToolbarControl } from '../../toolbar';
import { useEventMapItems } from '../hook';
import type { MapEventStore } from '../store';

export interface EventManagementControlProps extends WithMapPropType {
  show?: boolean;
}

function isActive(current: MapEventStore['current'], event: IEvent) {
  const currentCheck = current[event.event_map_type];
  return !!(currentCheck && currentCheck.id === event.id);
}

export function EventManagementControl(props: EventManagementControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap({ ...merged, controlId: 'mapEventManagementControl' });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const { panelPosition } = useRegisterMapControl(mapId, {
    id: 'mapEventManagementControl',
    panelKind: 'sidebar',
    title: trans('map.event-control.title'),
    buttonPosition: merged.position,
    show,
    setShow: toggleShow,
    initialPanelPosition: { location: 'left' },
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [
      { type: 'mapEventManagementControl', run: () => toggleShow() },
    ],
  });
  const [events, setEvents] = useState<IEvent[]>([]);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  const { getCurrent } = useEventMapItems(mapId, {
    onChange: (p) => setEvents(p.slice()),
  });
  const [current, setCurrent] = useState(getCurrent);

  useEffect(() => {
    setLocaleDefault(EVENT_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  useEffect(() => {
    const update = () => setCurrent(getCurrent());
    emitter.on(MittTypeMapEventEventKey.setCurrent, update);
    update();
    return () => {
      emitter.off(MittTypeMapEventEventKey.setCurrent, update);
    };
  }, [emitter, getCurrent]);

  const groupedViews = useMemo(() => {
    const groups: Record<string, IEvent[]> = {};
    for (const view of events) {
      const type = view.event_map_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(view);
    }
    return groups;
  }, [events]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapEventManagementControl',
    getState: () => ({
      title: trans('map.event-control.title'),
      icon: { type: 'mdi' as const, path: mdiCalendarSearch },
    }),
    onClick: () => toggleShow(),
  });

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
      draggable={(bind) => (
        <DraggableItemSideBar
          show={show}
          onUpdateShow={(v) => toggleShow(!!v)}
          title={trans('map.event-control.title')}
          containerId={bind.containerId}
          location={panelPosition.location || 'left'}
        >
          <div className="map-event-control">
            {Object.entries(groupedViews).map(([type, group]) => (
              <div key={type} className="map-event-control__group">
                <h2 className="map-event-control__group-title">{type}</h2>
                <ul className="map-event-control__list">
                  {group.map((event) => {
                    const active = isActive(current, event);
                    return (
                      <li
                        key={event.id}
                        className={`map-event-control__item${active ? ' is-active' : ''}`}
                      >
                        <div>
                          <strong>{trans('map.event-control.field.id')}:</strong>{' '}
                          {event.id}
                        </div>
                        <div>
                          <strong>
                            {trans('map.event-control.field.name')}:
                          </strong>{' '}
                          {event.name || 'N/A'}
                        </div>
                        <div>
                          <strong>
                            {trans('map.event-control.field.from')}:
                          </strong>{' '}
                          {event.from || 'N/A'}
                        </div>
                        <div className="map-event-control__status">
                          {active ? (
                            <span className="map-event-control__status-icon is-active">
                              ✔ Đang kích hoạt
                            </span>
                          ) : (
                            <span className="map-event-control__status-icon is-inactive">
                              ✖ Không kích hoạt
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </DraggableItemSideBar>
      )}
    />
  );
}
