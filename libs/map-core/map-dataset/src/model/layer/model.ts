import { copyByJson, getUUIDv4 } from '@hungpvq/shared';
import type { IDataset, IMapboxLayerView } from '../../interfaces';

import type { MapSimple } from '@hungpvq/map-core';
import type { LayerSpecification } from 'maplibre-gl';
import type { WithDataHelper } from '../../extra';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '../../menu';
import { createNamedComponent } from '../base';
import { findFirstLeafByType } from '../visitors';
import { createDatasetPartMapboxLayerComponent } from './base';
type BaseLayerSpec = Partial<Omit<LayerSpecification, 'id'>> & { id?: string };
export function createMultiMapboxLayerComponent(
  name: string,
  data: BaseLayerSpec[] = [],
): IMapboxLayerView & WithDataHelper<BaseLayerSpec[]> & IDataset {
  const base = createDatasetPartMapboxLayerComponent<BaseLayerSpec[]>(
    name,
    data,
  );
  /** Style/paint opacity (fill-opacity, …). Independent of the layer-item slider. */
  const cacheOpacity: Record<string, number> = {};
  /** Layer-item slider (0–1). Map paint = sliderOpacity * cacheOpacity. */
  let sliderOpacity = 1;
  base.getData().forEach((layer) => {
    const layer_id = layer.id || getUUIDv4();
    layer.id = layer_id;
    if (!layer.metadata) {
      layer.metadata = {};
    }
    (layer.metadata as any)['maplibregl-legend:name'] = name;
    cacheOpacity[layer_id] = readStyleOpacity(layer);
  });

  const applySliderOpacity = (map: MapSimple, layer: BaseLayerSpec) => {
    if (!layer.id || !map.getLayer(layer.id)) return;
    map.setPaintProperty(
      layer.id,
      getKeyOpacity(layer),
      sliderOpacity * (cacheOpacity[layer.id] ?? 1),
    );
  };

  return createNamedComponent('MultiMapboxLayerComponent', {
    ...base,

    setData(newData: BaseLayerSpec[]) {
      base.setData(
        newData.map((layer) => {
          const layer_id = layer.id || getUUIDv4();
          layer.id = layer_id;
          if (!layer.metadata) {
            layer.metadata = {};
          }
          (layer.metadata as any)['maplibregl-legend:name'] = name;
          cacheOpacity[layer_id] = readStyleOpacity(layer);
          return layer;
        }),
      );
    },
    getBeforeId(): string | undefined {
      return base.getData()[0]?.id;
    },

    getAllLayerIds(): string[] {
      return base.getData().map((l) => l.id!);
    },
    getLayers(): LayerSpecification[] {
      return base.getData() as LayerSpecification[];
    },

    getComponentUpdate() {
      return {
        componentKey: LIST_VIEW_MENU_COMPONENT_KEY.styleMultiControl,
      };
    },

    addToMap(map: MapSimple, beforeId?: string): void {
      const source = findFirstLeafByType(base, 'source');
      base.getData().forEach((layer) => {
        if (!map.getLayer(layer.id!)) {
          if (!(layer as any).source && source) {
            (layer as any).source = (source as any).getSourceId();
            this.addDependsOn(source);
          }
          map.addLayer(layer as LayerSpecification, beforeId);
          if (sliderOpacity !== 1) applySliderOpacity(map, layer);
        }
      });
    },

    removeFromMap(map: MapSimple): void {
      if (map.getLayer(base.id + '-hightLight')) {
        map.removeLayer(base.id + '-hightLight');
      }
      base.getData().forEach((layer) => {
        if (map.getLayer(layer.id!)) {
          map.removeLayer(layer.id!);
        }
      });
    },

    moveLayer(map: MapSimple, beforeId: string): void {
      base.getData().forEach((layer) => {
        if (map.getLayer(layer.id!)) {
          map.moveLayer(layer.id!, beforeId);
        }
      });
    },

    toggleShow(map: MapSimple, show: boolean): void {
      base.getData().forEach((layer) => {
        if (map.getLayer(layer.id!)) {
          map.setLayoutProperty(
            layer.id!,
            'visibility',
            show ? 'visible' : 'none',
          );
        }
      });
    },

    setOpacity(map: MapSimple, opacity: number): void {
      sliderOpacity = opacity;
      base.getData().forEach((layer) => applySliderOpacity(map, layer));
    },

    updateValue(
      map: MapSimple,
      value: { type: string; index: number; layer: any },
    ) {
      const { type, index } = value;
      let { layer } = value;
      const source = findFirstLeafByType(base, 'source');

      switch (type) {
        case 'update-one-layer': {
          const current = base.getData()[index];
          const opacityKey = getKeyOpacity(current);
          const opacityChanged =
            !!layer.paint &&
            opacityKey in layer.paint &&
            layer.paint[opacityKey] !== current.paint?.[opacityKey];
          updateStyleLayer(map, current, layer);
          base.getData()[index] = copyByJson({
            ...current,
            ...layer,
          });
          cacheOpacity[base.getData()[index].id!] = readStyleOpacity(
            base.getData()[index],
          );
          if (opacityChanged || sliderOpacity !== 1) {
            applySliderOpacity(map, base.getData()[index]);
          }
          break;
        }

        case 'add-one-layer':
          layer = {
            ...layer,
            id: `${base.id}-${base.getData().length}`,
            source: (source as any).getSourceId(),
          };
          cacheOpacity[layer.id] = readStyleOpacity(layer);
          map.addLayer(layer, base.getData()[index - 1]?.id);
          base.getData().push(layer);
          if (sliderOpacity !== 1) applySliderOpacity(map, layer);
          break;

        case 'remove-one-layer':
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
          base.getData().splice(index, 1);
          break;
      }
    },
    hightLight(map: MapSimple, geojsonData: GeoJSON.Feature<GeoJSON.Geometry>) {
      const layer = map.getLayer(base.id + '-hightLight');
      if (!layer) {
        const source = findFirstLeafByType(base, 'source');
        if (source) {
          const source_id = (source as any).getSourceId();
          if (source_id) {
            map.addLayer({
              id: base.id + '-hightLight',
              source: source_id,
              type: 'line',
              metadata: {
                'maplibregl-legend:disable': true,
              },
              filter: [
                '==',
                ['get', 'id'],
                geojsonData?.properties?.['id'] || null,
              ],
              paint: {
                'line-color': '#004E98',
                'line-width': 4,
                'line-dasharray': [2, 2],
              },
            });
          }
        }
      } else {
        map.setFilter(base.id + '-hightLight', [
          '==',
          ['get', 'id'],
          geojsonData?.properties?.['id'] || null,
        ]);
      }
      map.moveLayer(base.id + '-hightLight');
    },
  });
}

function updateStyleLayer(map: MapSimple, old: any, newVal: any) {
  map.setLayerZoomRange(
    old.id,
    newVal['min-zoom'] ?? old['min-zoom'] ?? 0,
    newVal['max-zoom'] ?? old['max-zoom'] ?? 24,
  );

  const opacityKey = getKeyOpacity(old);
  for (const key in newVal.paint) {
    if (key === opacityKey) continue;
    if (newVal.paint[key] !== old.paint?.[key]) {
      map.setPaintProperty(old.id, key, newVal.paint[key]);
    }
  }

  for (const key in newVal.layout) {
    if (newVal.layout[key] !== old.layout?.[key]) {
      map.setLayoutProperty(old.id, key, newVal.layout[key]);
    }
  }
}

function getKeyOpacity(
  layer: BaseLayerSpec,
): keyof LayerSpecification['paint'] {
  const keyOpacity =
    layer.type === 'symbol' ? 'icon-opacity' : `${layer.type}-opacity`;
  return keyOpacity as keyof LayerSpecification['paint'];
}

function readStyleOpacity(layer: BaseLayerSpec): number {
  const value = layer.paint?.[getKeyOpacity(layer)];
  return typeof value === 'number' ? value : 1;
}
