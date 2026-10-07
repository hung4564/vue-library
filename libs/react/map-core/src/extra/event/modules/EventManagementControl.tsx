import type { WithMapPropType } from '@hungpvq/map-core';
import {
  groupEventsByMapType,
  type IEvent,
  isEventActive,
  type MittTypeMapEvent,
  MittTypeMapEventEventKey,
} from '@hungpvq/map-core/event';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import { mdiCalendarSearch } from '@mdi/js';
import { useEffect, useMemo, useState } from 'react';

import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { useShow } from '../../../hooks/useShow';
import { ModuleContainer } from '../../../modules/ModuleContainer/ModuleContainer';
import { useMapMittStore } from '../../../store/mitt-store';
import { useLang } from '../../lang/hook';
import { useMapControl } from '../../registry/useMapControl';
import { useEventMapItems } from '../hook/useEventMapItems';

export interface EventManagementControlProps extends WithMapPropType {
  show?: boolean;
}

export function EventManagementControl(props: EventManagementControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, order } = useMap(merged);
  const { trans } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const [events, setEvents] = useState<IEvent[]>([]);
  const emitter = useMapMittStore<MittTypeMapEvent>(mapId);
  const { getCurrent } = useEventMapItems(mapId, {
    onChange: (p) => setEvents(p.slice()),
  });
  const [current, setCurrent] = useState(getCurrent);

  useEffect(() => {
    const update = () => setCurrent(getCurrent());
    emitter.on(MittTypeMapEventEventKey.setCurrent, update);
    update();
    return () => {
      emitter.off(MittTypeMapEventEventKey.setCurrent, update);
    };
  }, [emitter, getCurrent]);

  const groupedViews = useMemo(() => groupEventsByMapType(events), [events]);

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiCalendarSearch, {
        active: show,
        title: trans('map.event-control.title'),
        order,
      }),
    onClick: () => toggleShow(),
  };

  const { moduleContainerProps, panelPosition, control } = useMapControl(
    mapId,
    {
      id: 'mapEventManagementControl',
      panelKind: 'sidebar',
      title: trans('map.event-control.title'),
      from: merged,
      order,
      show,
      setShow: toggleShow,
      initialPanelPosition: { location: 'left' },
      actions: [{ type: 'mapEventManagementControl', run: () => toggleShow() }],
      host: { button: singleButton },
      toolbar: singleButton,
    },
  );

  useEffect(() => {
    control.sync();
  }, [show, control]);

  return (
    <ModuleContainer
      {...moduleContainerProps}
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
              <div
                key={type}
                className="map-event-control__group"
              >
                <h2 className="map-event-control__group-title">{type}</h2>
                <ul className="map-event-control__list">
                  {group.map((event) => {
                    const active = isEventActive(current, event);
                    return (
                      <li
                        key={event.id}
                        className={`map-event-control__item${active ? ' is-active' : ''}`}
                      >
                        <div>
                          <strong>
                            {trans('map.event-control.field.id')}:
                          </strong>{' '}
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
