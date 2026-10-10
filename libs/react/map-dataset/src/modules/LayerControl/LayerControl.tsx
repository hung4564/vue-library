import { type WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import {
  getLayerControlTitleMenuState,
  type GlobalVisibilityMode,
  type IDataset,
  registerAddGeojsonHereForMap,
  warnIfDatasetRegistryMissing,
} from '@hungpvq/map-dataset';
import type { LayerType } from '@hungpvq/map-dataset/create-control';
import {
  MENU_CONTROL_ID,
  type MenuContextSource,
  resolveMenuContextSource,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  ModuleContainerProps,
  UniversalRegistry,
  useLang,
  useMap,
  useMapControl,
  useShow,
} from '@hungpvq/react-map-core';
import { mdiLayers, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';

import { useEnsureDatasetBuiltinLocales } from '../../extra/lang/ensure-builtin-locales';
import { MenuConditionProvider } from '../../extra/menu/condition-context';
import { DatasetMenus } from '../../extra/menu/dataset-menus';
import { useMapDataset } from '../../store/dataset-api';
import { CreateControl } from '../CreateControl/CreateControl';
import { LayerMenuDefaultHandle } from '../LayerMenuDefaultHandle';
import { LayerList } from './part/LayerList';

type LayerControlSlot = ReactNode | ((props: { mapId: string }) => ReactNode);

const defaultLayerControlProps = {
  disabledCreate: false,
  disabledCreateGroup: false,
  disabledDeleteAll: false,
  disabledMove: false,
  globalVisibilityMode: 'sync' as GlobalVisibilityMode,
};

export interface LayerControlProps extends WithMapPropType {
  show?: boolean;
  disabledCreate?: boolean;
  disabledCreateGroup?: boolean;
  disabledDeleteAll?: boolean;
  disabledMove?: boolean;
  menuContext?: MenuContextSource;
  globalVisibilityMode?: GlobalVisibilityMode;
  createLayerTypes?: LayerType[];
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
  const merged = { ...defaultMapProps, ...defaultLayerControlProps, ...props };
  const { mapId, order } = useMap(merged);
  const { trans } = useLang(mapId);
  useEnsureDatasetBuiltinLocales(mapId);
  const [show, setShow] = useShow(props.show);
  const [showCreate, toggleShowCreate] = useShow(false);

  useEffect(() => {
    warnIfDatasetRegistryMissing(
      (key) => UniversalRegistry.getComponent(key),
      'react-map-dataset',
    );
  }, []);

  const layerMenuContext = useMemo(
    () => () => ({
      control: MENU_CONTROL_ID.layerControl,
      ...resolveMenuContextSource(props.menuContext),
    }),
    [props.menuContext],
  );

  const singleButton = {
    kind: 'single' as const,
    getState: () =>
      mdiButtonState(mdiLayers, {
        active: show,
        title: trans('map.layer-control.title'),
        order,
      }),
    onClick: () => setShow(),
  };

  const { moduleContainerProps, panelPosition, control } = useMapControl(
    mapId,
    {
      id: 'mapLayerControl',
      panelKind: 'sidebar',
      title: trans('map.layer-control.title'),
      from: merged,
      order,
      show,
      setShow,
      initialPanelPosition: { location: 'left' },
      actions: [{ type: 'mapLayerControl', run: () => setShow() }],
      host: { button: singleButton },
      toolbar: singleButton,
    },
  );

  useEffect(() => {
    control.sync();
  }, [show, control]);

  const { addDataset, getDatasets, datasetVersion } = useMapDataset(mapId);
  const addDatasetRef = useRef(addDataset);
  addDatasetRef.current = addDataset;

  useEffect(() => {
    return registerAddGeojsonHereForMap(mapId, (dataset) => {
      void addDatasetRef.current(dataset);
    });
  }, [mapId]);

  const titleMenuState = useMemo(() => {
    void datasetVersion;
    const roots = getDatasets().filter(Boolean) as IDataset[];
    return getLayerControlTitleMenuState(roots);
  }, [datasetVersion, getDatasets]);

  const titleSlot = renderSlot(props.titleList, mapId);
  const endSlot = renderSlot(props.endList, mapId);
  const renderDraggable = useCallback<
    NonNullable<ModuleContainerProps['draggable']>
  >(
    (bind) => (
      <DraggableItemSideBar
        show={show}
        onUpdateShow={(v) => setShow(!!v)}
        title={trans('map.layer-control.title')}
        titleNode={
          <span className="layer-control__title">
            {trans('map.layer-control.title')}
          </span>
        }
        afterTitle={
          titleMenuState.data ? (
            <MenuConditionProvider value={layerMenuContext}>
              <DatasetMenus
                menus={titleMenuState.menus}
                data={titleMenuState.data}
                mapId={mapId}
                locations={['title']}
                menuContext={layerMenuContext}
              />
            </MenuConditionProvider>
          ) : undefined
        }
        containerId={bind.containerId}
        location={panelPosition.location || 'left'}
      >
        <div className="layer-control">
          <MenuConditionProvider value={layerMenuContext}>
            <LayerList
              mapId={mapId}
              disabledCreate={merged.disabledCreate}
              disabledCreateGroup={merged.disabledCreateGroup}
              disabledDeleteAll={merged.disabledDeleteAll}
              disabledMove={merged.disabledMove}
              globalVisibilityMode={merged.globalVisibilityMode}
              onCreate={() => toggleShowCreate(true)}
              title={
                titleSlot !== null && titleSlot !== undefined ? (
                  titleSlot
                ) : !merged.disabledCreate ? (
                  <MapControlButton
                    variant="plain"
                    data-testid="map-layer-create"
                    onClick={() => toggleShowCreate(true)}
                  >
                    <Icon
                      path={mdiPlus}
                      size="14px"
                    />
                  </MapControlButton>
                ) : null
              }
            />
            <div className="base-map-card-container">{endSlot}</div>
          </MenuConditionProvider>
        </div>
      </DraggableItemSideBar>
    ),
    [
      show,
      trans,
      titleMenuState.data,
      titleMenuState.menus,
      layerMenuContext,
      mapId,
      panelPosition.location,
      merged.disabledCreate,
      merged.disabledCreateGroup,
      merged.disabledDeleteAll,
      merged.disabledMove,
      merged.globalVisibilityMode,
      titleSlot,
      endSlot,
      setShow,
      toggleShowCreate,
    ],
  );
  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={renderDraggable}
    >
      <CreateControl
        show={showCreate}
        onShowChange={toggleShowCreate}
        createLayerTypes={props.createLayerTypes}
        controlVisible={false}
      />{' '}
      {props.children}
      <LayerMenuDefaultHandle mapId={mapId} />
    </ModuleContainer>
  );
}
