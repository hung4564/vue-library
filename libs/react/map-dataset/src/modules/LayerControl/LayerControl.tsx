import {
  MAP_CONTEXT_MENU_ID,
  clearAddGeojsonHereItems,
  getDefaultAddGeojsonHereItems,
  setAddGeojsonHereItems,
  type AddGeojsonHerePayload,
  type MapMenuItemProps,
  type WithMapPropType,
} from '@hungpvq/map-core';
import {
  createGeojsonHereDataset,
  type MenuContextSource,
} from '@hungpvq/map-dataset';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  BaseButton,
  MapCommonButton,
  ModuleContainer,
  UniversalRegistry,
  defaultMapProps,
  useLang,
  useMap,
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
  const { mapId, moduleContainerProps, order } = useMap(merged);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const [showCreate, toggleShowCreate] = useShow(false);

  useEffect(() => {
    setLocaleDefault({
      map: {
        'layer-control': {
          title: 'Layer Control',
          'create-btn': 'Create Layer',
          create: { title: 'New Layer' },
          field: {
            name: 'Name',
            type: 'Type',
            url: 'Url',
            minzoom: 'Min zoom',
            maxzoom: 'Max zoom',
            bound: {
              minx: 'Min Longitude',
              miny: 'Min Latitude',
              maxx: 'Max Longitude',
              maxy: 'Max Latitude',
            },
          },
        },
      },
    });
  }, [setLocaleDefault]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapLayerControl',
    getState: () => ({
      visible: !show,
      active: show,
      title: trans('map.layer-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiLayers },
    }),
    onClick: () => toggleShow(),
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
          onUpdateShow={(v) => toggleShow(!!v)}
          title={trans('map.layer-control.title')}
          titleNode={
            <span className="layer-control__title">
              {trans('map.layer-control.title')}
            </span>
          }
          containerId={bind.containerId}
        >
          <div className="layer-control">
            <MenuConditionProvider value={props.menuContext}>
              <LayerList
                mapId={mapId}
                disabledCreateGroup={props.disabledCreateGroup}
                disabledDeleteAll={props.disabledDeleteAll}
                disabledMove={props.disabledMove}
                title={
                  titleSlot !== null && titleSlot !== undefined ? (
                    titleSlot
                  ) : !props.disabledCreate ? (
                    <BaseButton onClick={() => toggleShowCreate(true)}>
                      <Icon path={mdiPlus} size="14px" />
                    </BaseButton>
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
