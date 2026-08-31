import type { WithMapPropType } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
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
  const { mapId, moduleContainerProps, order } = useMap(merged);
  const { trans, setLocaleDefault } = useLang(mapId);
  const [show, toggleShow] = useShow(props.show);
  const { getDatasets, removeDataset, datasetVersion } = useMapDataset(mapId);
  const [views, setViews] = useState<IDataset[]>([]);

  useEffect(() => {
    setLocaleDefault({ map: { 'dataset-control': { title: 'Dataset Control' } } });
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
    onClick: () => toggleShow(),
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
          onUpdateShow={(v) => toggleShow(!!v)}
          title={trans('map.dataset-control.title')}
          containerId={bind.containerId}
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
  const { moduleContainerProps } = useMap({ mapId: propsMapId });
  const items: { level: number; path: number[]; node: IDataset }[] = [];
  traverseTree(dataset, (node, level, path) => {
    items.push({ node, level, path });
  });

  return (
    <ModuleContainer
      {...moduleContainerProps}
      draggable={(bind) => (
        <DraggableItemPopup
          show
          title={dataset.getName()}
          onUpdateShow={(v) => !v && onClose?.()}
          width={400}
          height={400}
          {...bind}
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
