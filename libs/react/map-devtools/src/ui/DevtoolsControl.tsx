import type { WithMapPropType } from '@hungpvq/map-core';
import { DEVTOOLS_CONTROL } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  ModuleContainerProps,
  useMap,
  useMapControl,
} from '@hungpvq/react-map-core';
import { mdiTools } from '@mdi/js';
import { Icon } from '@mdi/react';

import { useCallback } from 'react';
import { setDevtoolOpen, toggleDevtoolOpen } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { DevtoolsPanelBody } from './DevtoolsPanelBody';

export type DevtoolsControlProps = WithMapPropType & {
  show?: boolean;
};

export function DevtoolsControl(props: DevtoolsControlProps) {
  const merged = {
    ...defaultMapProps,
    position: 'bottom-right' as const,
    ...props,
  };
  const { mapId, order } = useMap(merged);
  const { isOpen, activeTab, logs, errors } = useDevtoolState();

  const setOpen = (value: boolean) => {
    setDevtoolOpen(value);
  };

  const { panelBind, moduleContainerProps } = useMapControl(mapId, {
    id: DEVTOOLS_CONTROL.id,
    panelKind: 'popup',
    title: 'Map Devtools',
    from: merged,
    order,
    host: { buttonSlot: 'custom' },
    show: isOpen,
    setShow: setOpen,
    defaultPanelSize: { width: 600, height: 400 },
    actions: [
      {
        type: DEVTOOLS_CONTROL.id,
        run: () => {
          toggleDevtoolOpen();
        },
      },
    ],
  });

  const renderDraggable = useCallback<
    NonNullable<ModuleContainerProps['draggable']>
  >(
    (bind) => (
      <DraggableItemPopup
        show={isOpen}
        title="Map Devtools"
        onClose={() => setOpen(false)}
        onUpdateShow={setOpen}
        {...bind}
        {...panelBind}
      >
        <div className="devtools-popup-body">
          <DevtoolsPanelBody
            activeTab={activeTab}
            logCount={logs.length}
            errorCount={errors.length}
          />
        </div>
      </DraggableItemPopup>
    ),
    [],
  );
  return (
    <ModuleContainer
      {...moduleContainerProps}
      btn={
        <MapControlButton
          variant="icon"
          size="medium"
          active={isOpen}
          title="Map Devtools"
          aria-label="Map Devtools"
          onClick={(event) => {
            event.stopPropagation();
            toggleDevtoolOpen();
          }}
        >
          <Icon
            path={mdiTools}
            size="20px"
          />
        </MapControlButton>
      }
      draggable={renderDraggable}
    />
  );
}
