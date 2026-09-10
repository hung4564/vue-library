import { type WithMapPropType } from '@hungpvq/map-core';
import {
  clearAddGeojsonHereItems,
  getDefaultAddGeojsonHereItems,
  MAP_CONTEXT_MENU_ID,
  setAddGeojsonHereItems,
  type AddGeojsonHerePayload,
  type MapMenuItemProps,
} from '@hungpvq/map-core/menu';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { LAYER_CONTROL_LOCALE } from '@hungpvq/map-dataset';
import { createGeojsonHereDataset } from '@hungpvq/map-dataset/geojson';
import { type MenuContextSource } from '@hungpvq/map-dataset/menu';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  MapCommonButton,
  MapControlButton,
  ModuleContainer,
  UniversalRegistry,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';

import { mdiLayers, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { MenuConditionProvider } from '../../extra/menu/condition-context';
import { useMapDataset } from '../../store';
import { CreateControl } from '../CreateControl/CreateControl';
import { LayerMenuDefaultHandle } from '../LayerMenuDefaultHandle';
import { LayerList } from './LayerList';
import { warnIfDatasetRegistryMissing } from './warn-registry';

type LayerControlSlot = ReactNode | ((props: { mapId: string }) => ReactNode);

export interface LayerControlProps extends WithMapPropType {
  show?: boolean;
  disabledCreate?: boolean;
  disabledCreateGroup?: boolean;
  disabledDeleteAll?: boolean;
  disabledMove?: boolean;
  menuContext?: MenuContextSource;
  /** Slot after list header actions (Vue: titleList). */
  titleList?: LayerControlSlot;
  /** Slot below the layer list (Vue: endList), e.g. BaseMapCard. */
  endList?: LayerControlSlot;
  children?: ReactNode;
}

function renderSlot(slot: LayerControlSlot | undefined, mapId: string) {
  if (slot == null) return null;
  return typeof slot === 'function' ? slot({ mapId }) : slot;
}

export function LayerControl(props: LayerControlProps) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({
    ...merged,
    controlId: 'mapLayerControl',
  });
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, setShow] = useShow(props.show);
  const [showCreate, toggleShowCreate] = useShow(false);

  useEffect(() => {
    warnIfDatasetRegistryMissing();
  }, []);

  const { panelPosition } = useRegisterMapControl(mapId, {
    id: 'mapLayerControl',
    panelKind: 'sidebar',
    title: trans('map.layer-control.title'),
    buttonPosition: merged.position,
    show,
    setShow,
    initialPanelPosition: { location: 'left' },
    getProps: () => ({
      disabledCreate: props.disabledCreate,
      disabledCreateGroup: props.disabledCreateGroup,
      disabledDeleteAll: props.disabledDeleteAll,
      disabledMove: props.disabledMove,
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [{ type: 'mapLayerControl', run: () => setShow() }],
  });

  useEffect(() => {
    setLocaleDefault(LAYER_CONTROL_LOCALE);
  }, [setLocaleDefault]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapLayerControl',
    getState: () =>
      mdiButtonState(mdiLayers, {
        active: show,
        title: trans('map.layer-control.title'),
        order,
      }),
    onClick: () => setShow(),
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);

  const { addDataset } = useMapDataset(mapId);
  const addDatasetRef = useRef(addDataset);
  addDatasetRef.current = addDataset;

  useEffect(() => {
    UniversalRegistry.registerMenuHandlerForMap(
      mapId,
      MAP_CONTEXT_MENU_ID.addGeojsonHere,
      (_props: MapMenuItemProps, payload: AddGeojsonHerePayload) => {
        void addDatasetRef.current(createGeojsonHereDataset(payload));
      },
    );
    setAddGeojsonHereItems(mapId, getDefaultAddGeojsonHereItems());
    return () => {
      clearAddGeojsonHereItems(mapId);
    };
  }, [mapId]);

  const titleSlot = renderSlot(props.titleList, mapId);
  const endSlot = renderSlot(props.endList, mapId);

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
          onUpdateShow={(v) => setShow(!!v)}
          title={trans('map.layer-control.title')}
          titleNode={
            <span className="layer-control__title">
              {trans('map.layer-control.title')}
            </span>
          }
          containerId={bind.containerId}
          location={panelPosition.location || 'left'}
        >
          <div className="layer-control">
            <MenuConditionProvider value={props.menuContext}>
              <LayerList
                mapId={mapId}
                disabledCreate={props.disabledCreate}
                disabledCreateGroup={props.disabledCreateGroup}
                disabledDeleteAll={props.disabledDeleteAll}
                disabledMove={props.disabledMove}
                onCreate={() => toggleShowCreate(true)}
                title={
                  titleSlot !== null && titleSlot !== undefined ? (
                    titleSlot
                  ) : !props.disabledCreate ? (
                    <MapControlButton
                      variant="plain"
                      data-testid="map-layer-create"
                      onClick={() => toggleShowCreate(true)}
                    >
                      <Icon path={mdiPlus} size="14px" />
                    </MapControlButton>
                  ) : null
                }
              />
              <div className="base-map-card-container">{endSlot}</div>
            </MenuConditionProvider>
          </div>
        </DraggableItemSideBar>
      )}
    >
      <CreateControl
        mapId={mapId}
        show={showCreate}
        onShowChange={toggleShowCreate}
      />
      {props.children}
      <LayerMenuDefaultHandle mapId={mapId} />
    </ModuleContainer>
  );
}
