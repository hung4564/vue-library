import type { IDataset } from '@hungpvq/map-dataset';
import { traverseTree } from '@hungpvq/map-dataset';
import { DraggableItemPopup } from '@hungpvq/react-draggable';
import {
  ModuleContainer,
  useMap,
  useRegisterMapControl,
  useShow,
} from '@hungpvq/react-map-core';

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
