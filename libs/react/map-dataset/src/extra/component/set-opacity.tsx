import type { MapSimple } from '@hungpvq/map-core';
import type { IDataset, IListViewUI, WithSetOpacity } from '@hungpvq/map-dataset';
import { isHasSetOpacity, runAllComponentsWithCheck } from '@hungpvq/map-dataset';
import { useMap } from '@hungpvq/react-map-core';
import { useEffect, useState } from 'react';
import { LayerItemSlider } from './layer-item-slider';
import type { WithLayerItemActionType } from './types';

export function SetOpacity(props: WithLayerItemActionType) {
  const { callMap } = useMap(props);
  const [opacityValue, setOpacityValue] = useState(props.data.opacity ?? 1);

  useEffect(() => {
    const onChange = (e: { opacity: number }) => setOpacityValue(e.opacity);
    props.data.on('changeOpacity', onChange);
    return () => props.data.off('changeOpacity', onChange);
  }, [props.data]);

  function onSetOpacity(view: IListViewUI, opacity: number) {
    const parent = view.getParent() || view;
    callMap((map: MapSimple) => {
      runAllComponentsWithCheck(
        parent,
        (dataset): dataset is IDataset & WithSetOpacity => isHasSetOpacity(dataset),
        [(dataset) => dataset.setOpacity(map, opacity)],
      );
    });
  }

  return (
    <div className="layer-item__opacity">
      <LayerItemSlider
        value={opacityValue}
        min={0}
        max={1}
        step={0.01}
        disabled={props.disabled}
        onChange={(v) => {
          setOpacityValue(v);
          onSetOpacity(props.data, v);
        }}
      />
    </div>
  );
}
