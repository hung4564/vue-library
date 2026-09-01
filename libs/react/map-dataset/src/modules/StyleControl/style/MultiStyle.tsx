import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset';
import { BaseButton, InputSelect, useShow } from '@hungpvq/react-map-core';
import Icon from '@mdi/react';
import { mdiClose, mdiDelete, mdiPlus } from '@mdi/js';
import type { LayerSpecification } from 'maplibre-gl';
import { useEffect, useMemo, useState } from 'react';
import type { TransFn } from './type/tab-utils';
import { SingleStyle } from './SingleStyle';

export function MultiStyle({
  value = [],
  trans,
  mapId,
  onUpdateStyle,
}: {
  value?: LayerSpecification[];
  trans: TransFn;
  mapId: string;
  onUpdateStyle?: (payload: {
    type: string;
    layer?: LayerSpecification;
    index?: number;
  }) => void;
}) {
  const layers = value;
  const [tab, setTab] = useState<string | undefined>(layers[0]?.id);
  const [showAdd, setShowAdd] = useShow(false);

  useEffect(() => {
    if (!tab && layers.length > 0) {
      setTab(layers[layers.length - 1].id);
    }
  }, [layers, tab]);

  const tabs = useMemo(
    () => layers.map((x, i) => ({ text: `#${i + 1}`, value: x.id })),
    [layers],
  );
  const current_layer = useMemo(
    () => layers.find((x) => x.id === tab),
    [layers, tab],
  );

  function onSelectTab(layer_id: string) {
    setTab(undefined);
    requestAnimationFrame(() => setTab(layer_id));
  }

  function onUpdateStyleLayer(layer: LayerSpecification, layer_id: string) {
    onUpdateStyle?.({
      type: 'update-one-layer',
      layer,
      index: layers.findIndex((x) => x.id === layer_id),
    });
  }

  function onAddStyleLayer(type: string) {
    setTab(undefined);
    onUpdateStyle?.({
      type: 'add-one-layer',
      layer: new LayerSimpleMapboxBuild()
        .setStyleType(type as 'point' | 'line' | 'area' | 'symbol')
        .setColor('#fff')
        .build() as LayerSpecification,
    });
    setShowAdd(false);
  }

  function onRemoveStyleLayer(layer_id?: string) {
    if (!layer_id) return;
    const index = layers.findIndex((x) => x.id === layer_id);
    if (!layers[index]) return;
    setTab(undefined);
    onUpdateStyle?.({
      type: 'remove-one-layer',
      index,
      layer: layers[index],
    });
    const next = layers.filter((_, i) => i !== index);
    if (next.length === 0) {
      setShowAdd(true);
    } else {
      onSelectTab(next[next.length - 1]?.id || next[0].id);
    }
  }

  return (
    <div className="multi-style-edit-container">
      <div className="tab-container">
        <div className="tab-item">
          <InputSelect
            value={tab}
            onChange={(v) => onSelectTab(String(v))}
            items={tabs}
          />
        </div>
        <BaseButton
          className="tab-item tab-add clickable"
          onClick={() => onRemoveStyleLayer(tab)}
          disabled={!tab}
        >
          <Icon path={mdiDelete} size="14px" />
        </BaseButton>
        <BaseButton
          className="tab-item tab-add clickable"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Icon path={!showAdd ? mdiPlus : mdiClose} size="14px" />
        </BaseButton>
      </div>
      {showAdd ? (
        <div className="style-container">
          <div className="add-style-container">
            <BaseButton onClick={() => onAddStyleLayer('area')}>
              {trans('map.style-control.add.area')}
            </BaseButton>
            <BaseButton onClick={() => onAddStyleLayer('line')}>
              {trans('map.style-control.add.line')}
            </BaseButton>
            <BaseButton onClick={() => onAddStyleLayer('point')}>
              {trans('map.style-control.add.point')}
            </BaseButton>
            <BaseButton onClick={() => onAddStyleLayer('symbol')}>
              {trans('map.style-control.add.symbol')}
            </BaseButton>
          </div>
        </div>
      ) : (
        tab &&
        current_layer && (
          <div className="style-container">
            <SingleStyle
              key={tab}
              value={current_layer}
              trans={trans}
              mapId={mapId}
              onUpdateStyle={(layer) => onUpdateStyleLayer(layer, tab)}
            />
          </div>
        )
      )}
    </div>
  );
}
