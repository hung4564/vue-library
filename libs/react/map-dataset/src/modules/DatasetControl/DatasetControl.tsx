import type { WithMapPropType } from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  handleMenuActionClick,
  LIST_VIEW_MENU_COMPONENT_KEY,
  LIST_VIEW_MENU_ID,
} from '@hungpvq/map-dataset/menu';
import { DraggableItemSideBar } from '@hungpvq/react-draggable';
import {
  defaultMapProps,
  MapCommonButton,
  MapControlButton,
  ModuleContainer,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiDatabaseOutline, mdiDelete, mdiInformation } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useEffect, useState } from 'react';

import { useMapDataset } from '../../store/dataset-api';

const ICON_SIZE = 16 / 24;

export function DatasetControl(props: WithMapPropType & { show?: boolean }) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({
    ...merged,
    controlId: 'mapDatasetControl',
  });
  const { trans } = useLang(mapId);
  const [show, setShow] = useShow(props.show);
  const { panelPosition } = useRegisterMapControl(mapId, {
    id: 'mapDatasetControl',
    panelKind: 'sidebar',
    title: trans('map.dataset-control.title'),
    buttonPosition: merged.position,
    show,
    setShow,
    initialPanelPosition: { location: 'left' },
    getProps: () => ({
      position: merged.position,
      controlLayout: merged.controlLayout,
    }),
    actions: [{ type: 'mapDatasetControl', run: () => setShow() }],
  });
  const { getDatasets, removeDataset, datasetVersion } = useMapDataset(mapId);
  const [views, setViews] = useState<IDataset[]>([]);

  useEffect(() => {
    const next = getDatasets();
    setViews((prev) => {
      if (
        prev.length === next.length &&
        prev.every((view, index) => view === next[index])
      ) {
        return prev;
      }
      return next;
    });
  }, [datasetVersion, mapId, getDatasets]);

  const { state, control } = useToolbarControl(mapId, merged, {
    kind: 'single',
    id: 'mapDatasetControl',
    getState: () =>
      mdiButtonState(mdiDatabaseOutline, {
        active: show,
        title: trans('map.dataset-control.title'),
        order,
      }),
    onClick: () => setShow(),
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);

  function onShowDetail(view: IDataset) {
    handleMenuActionClick(
      createMenuClickBuilder()
        .addTupleStatic(LIST_VIEW_MENU_ID.addComponent, {
          value: createMenuClickAddComponentBuilder()
            .setComponentKey(LIST_VIEW_MENU_COMPONENT_KEY.datasetDetail)
            .setAttr({ dataset: view })
            .setCheck('detail-dataset')
            .build(),
        })
        .build(),
      { layer: view, mapId, value: view },
    );
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
      draggable={(bind) => (
        <DraggableItemSideBar
          show={show}
          onUpdateShow={(v) => setShow(!!v)}
          title={trans('map.dataset-control.title')}
          containerId={bind.containerId}
          location={panelPosition.location || 'left'}
        >
          <div className="dataset-control">
            {views.map((view) => (
              <div key={view.id} className="dataset-item">
                <span className="dataset-item__title">{view.getName()}</span>
                <div className="dataset-item__title-action">
                  <MapControlButton
                    variant="plain"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDetail(view);
                    }}
                  >
                    <Icon path={mdiInformation} size={ICON_SIZE} />
                  </MapControlButton>
                  <MapControlButton
                    variant="plain"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDataset(view);
                    }}
                  >
                    <Icon path={mdiDelete} size={ICON_SIZE} />
                  </MapControlButton>
                </div>
              </div>
            ))}
          </div>
        </DraggableItemSideBar>
      )}
    />
  );
}
