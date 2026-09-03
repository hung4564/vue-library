import type { WithMapPropType } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  DATASET_CONTROL_LOCALE,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  handleMenuActionClick,
  traverseTree,
} from '@hungpvq/map-dataset';
import { DraggableItemSideBar, DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  BaseButton,
  MapCommonButton,
  ModuleContainer,
  defaultMapProps,
  useLang,
  useMap,
  useRegisterMapControl,
  useShow,
  useToolbarControl,
} from '@hungpvq/react-map-core';
import { mdiDatabaseOutline, mdiDelete, mdiInformation } from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useState } from 'react';
import { useMapDataset } from '../../store';

const ICON_SIZE = 16 / 24;

export function DatasetControl(props: WithMapPropType & { show?: boolean }) {
  const merged = { ...defaultMapProps, ...props };
  const { mapId, moduleContainerProps, order } = useMap({
    ...merged,
    controlId: 'mapDatasetControl',
  });
  const { trans, setLocaleDefault } = useLang(mapId);
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
    setLocaleDefault(DATASET_CONTROL_LOCALE);
  }, [setLocaleDefault]);

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
    getState: () => ({
      visible: !show,
      active: show,
      title: trans('map.dataset-control.title'),
      order,
      icon: { type: 'mdi' as const, path: mdiDatabaseOutline },
    }),
    onClick: () => setShow(),
  });

  useEffect(() => {
    control.sync();
  }, [show, control]);

  function onShowDetail(view: IDataset) {
    handleMenuActionClick(
      createMenuClickBuilder()
        .addTupleStatic('addComponent', {
          value: createMenuClickAddComponentBuilder()
            .setComponentKey('dataset-detail')
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
                  <BaseButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDetail(view);
                    }}
                  >
                    <Icon path={mdiInformation} size={ICON_SIZE} />
                  </BaseButton>
                  <BaseButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDataset(view);
                    }}
                  >
                    <Icon path={mdiDelete} size={ICON_SIZE} />
                  </BaseButton>
                </div>
              </div>
            ))}
          </div>
        </DraggableItemSideBar>
      )}
    />
  );
}

export function DatasetDetail({
  dataset,
  onClose,
  mapId: propsMapId,
}: {
  dataset: IDataset;
  onClose?: () => void;
  mapId?: string;
}) {
  const { mapId, moduleContainerProps } = useMap({
    mapId: propsMapId,
    controlId: 'mapDatasetDetail',
  });
  const [show, toggleShow] = useShow(true);
  const { panelBind } = useRegisterMapControl(mapId, {
    id: 'mapDatasetDetail',
    panelKind: 'popup',
    title: dataset.getName(),
    show,
    setShow: (v) => {
      toggleShow(v);
      if (!v) onClose?.();
    },
    actions: [
      {
        type: 'mapDatasetDetail',
        run: () => toggleShow(),
      },
    ],
  });
  const items: { level: number; path: number[]; node: IDataset }[] = [];
  traverseTree(dataset, (node, level, path) => {
    items.push({ node, level, path });
  });

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <DraggableItemPopup
          show={show}
          title={dataset.getName()}
          onUpdateShow={(v) => {
            toggleShow(!!v);
            if (!v) onClose?.();
          }}
          width={400}
          height={400}
          {...bind}
          {...panelBind}
        >
          <ul className="dataset-list">
            {items.map((item, index) => (
              <li
                key={index}
                className="dataset-list-item"
                style={{ paddingLeft: `${item.level * 0.5}rem` }}
              >
                <span>{item.path.join('.')}</span>
                <span>({item.node.type})</span>
                <span>{item.node.getName()}</span>
              </li>
            ))}
          </ul>
        </DraggableItemPopup>
      )}
    />
  );
}
