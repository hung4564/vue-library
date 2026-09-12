import type { WithMapPropType } from '@hungpvq/map-core';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  useMap,
  useRegisterMapControl,
} from '@hungpvq/react-map-core';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import { mdiTools } from '@mdi/js';
import Icon from '@mdi/react';
import { DEVTOOLS_CONTROL } from '../control';
import { setDevtoolOpen, toggleDevtoolOpen } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { DevtoolsPanelBody } from './DevtoolsPanelBody';
import './devtools.css';

export type DevtoolsControlProps = WithMapPropType & {
  show?: boolean;
};

export function DevtoolsControl(props: DevtoolsControlProps) {
  const merged = {
    ...defaultMapProps,
    position: 'bottom-right' as const,
    ...props,
  };
  const { mapId, moduleContainerProps } = useMap({
    ...merged,
    controlId: DEVTOOLS_CONTROL.id,
  });
  const { isOpen, activeTab, logs } = useDevtoolState();

  const setOpen = (value: boolean) => {
    setDevtoolOpen(value);
  };

  const { panelBind } = useRegisterMapControl(mapId, {
    id: DEVTOOLS_CONTROL.id,
    panelKind: 'popup',
    title: 'Map Devtools',
    buttonPosition: merged.position,
    show: isOpen,
    setShow: setOpen,
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [
      {
        type: DEVTOOLS_CONTROL.id,
        run: () => {
          toggleDevtoolOpen();
        },
      },
    ],
  });

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
          <Icon path={mdiTools} size="20px" />
        </MapControlButton>
      }
      draggable={(bind) => (
        <DraggableItemPopup
          show={isOpen}
          width={600}
          height={400}
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
            />
          </div>
        </DraggableItemPopup>
      )}
    />
  );
}
