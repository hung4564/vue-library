import './demo-nav.css';

import { getDemoAsideNavItems } from '@hungpvq/demo-map-datasets';
import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  ModuleContainer,
  ModuleContainerProps,
  useLang,
  useMap,
  useMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { mdiMenu } from '@mdi/js';
import { useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router';

const NAV_ITEMS = getDemoAsideNavItems('react');

export function AsideControl(props: WithMapPropType & { show?: boolean }) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, order } = useMap({
    ...merged,
    controlId: 'asideControl',
  });
  const { trans, registerLocale } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const navItems = useMemo(() => NAV_ITEMS, []);

  useEffect(() => {
    registerLocale('en', {
      map: { 'aside-control': { title: 'Aside Control' } },
    });
  }, [registerLocale]);

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiMenu, {
        visible: true,
        active: show,
        title: trans('map.aside-control.title'),
        order,
      }),
    onClick: () => toggleShow(),
  };

  const { moduleContainerProps, control } = useMapControl(mapId, {
    id: 'asideControl',
    panelKind: 'sidebar',
    title: trans('map.aside-control.title'),
    from: merged,
    order,
    show,
    setShow: (value) => toggleShow(value),
    actions: [{ type: 'asideControl', run: () => toggleShow() }],
    host: { button: singleButton },
    toolbar: singleButton,
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);

  const renderDraggable = useCallback<
    NonNullable<ModuleContainerProps['draggable']>
  >(
    (bind) => (
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
          {navItems.map((item) => (
            <li
              key={item.to}
              className="v-list-item"
            >
              <Link
                to={item.to}
                onClick={() => toggleShow(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </DraggableItemSideBar>
    ),
    [navItems, show, toggleShow, trans],
  );
  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={renderDraggable}
    />
  );
}
