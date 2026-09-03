import type { WithMapPropType } from '@hungpvq/map-core';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  MapCommonButton,
  ModuleContainer,
  useLang,
  useMap,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiMenu } from '@mdi/js';
import { useEffect } from 'react';
import { Link } from 'react-router';
import './demo-nav.css';

const NAV_ITEMS = [
  { to: '/', label: 'Home (All Map)' },
  { to: '/map-core', label: 'Map - Core' },
  { to: '/toolbar', label: 'Map - Toolbar' },
  { to: '/basemap', label: 'BaseMap' },
  { to: '/measurement', label: 'Measurement' },
  { to: '/dataset-highlight', label: 'Dataset - Highlight' },
  { to: '/dataset-identify', label: 'Dataset - Identify' },
  { to: '/dataset-menu', label: 'Dataset - Menu' },
  { to: '/dataset-list', label: 'Dataset - List' },
  { to: '/registry-control', label: 'UniversalRegistry - Controls' },
  { to: '/dataset-data-management', label: 'Dataset - Data management' },
  { to: '/story-telling', label: 'Story telling' },
];

export function AsideControl(props: WithMapPropType & { show?: boolean }) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps } = useMap({ ...merged, controlId: 'asideControl' });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);

  useEffect(() => {
    setLocaleDefault({ map: { 'aside-control': { title: 'Aside Control' } } });
  }, [setLocaleDefault]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'asideControl',
    getState: () => ({
      visible: true,
      active: show,
      title: trans('map.aside-control.title'),
      icon: { type: 'mdi' as const, path: mdiMenu },
    }),
    onClick: () => toggleShow(),
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);

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
          title={trans('map.aside-control.title')}
          titleNode={
            <span className="aside-control__title">
              {trans('map.aside-control.title')}
            </span>
          }
          containerId={bind.containerId}
        >
          <ul className="v-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to} className="v-list-item">
                <Link to={item.to} onClick={() => toggleShow(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </DraggableItemSideBar>
      )}
    />
  );
}
