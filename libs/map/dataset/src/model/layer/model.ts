import { copyByJson, getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import type { LayerSpecification } from 'maplibre-gl';
import { createNamedComponent } from '../base';
import { findFirstLeafByType } from '../visitors';
import { createDatasetPartMapboxLayerComponent } from './base';
type BaseLayerSpec = Partial<Omit<LayerSpecification, 'id'>> & { id?: string };
export function createMultiMapboxLayerComponent(
  name: string,
  data: BaseLayerSpec[] = [],
) {
  const base = createDatasetPartMapboxLayerComponent<BaseLayerSpec[]>(
    name,
    data,
  );
  const cacheOpacity: Record<string, number> = {};
  base.getData().forEach((layer) => {
    const layer_id = layer.id || getUUIDv4();
    layer.id = layer_id;
    if (!layer.metadata) {
      layer.metadata = {};
    }
    (layer.metadata as any)['maplibregl-legend:name'] = name;
    cacheOpacity[layer_id] = layer.paint?.[getKeyOpacity(layer)] ?? 1;
  });

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
          cacheOpacity[layer_id] = layer.paint?.[getKeyOpacity(layer)] ?? 1;
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

    getComponentUpdate() {
      return {
        componentKey: 'style-multi-control',
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
      base.getData().forEach((layer) => {
        if (map.getLayer(layer.id!)) {
          map.setPaintProperty(
            layer.id!,
            getKeyOpacity(layer),
            opacity * (cacheOpacity[layer.id!] ?? 1),
          );
        }
      });
    },

    updateValue(
      map: MapSimple,
      value: { type: string; index: number; layer: any },
    ) {
      const { type, index } = value;
      let { layer } = value;
      const source = findFirstLeafByType(base, 'source');

      switch (type) {
        case 'update-one-layer':
          updateStyleLayer(map, base.getData()[index], layer);
          base.getData()[index] = copyByJson({
            ...base.getData()[index],
            ...layer,
          });
          break;

        case 'add-one-layer':
          layer = {
            ...layer,
            id: `${base.id}-${base.getData().length}`,
            source: (source as any).getSourceId(),
          };
          map.addLayer(layer, base.getData()[index - 1]?.id);
          base.getData().push(layer);
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
                geojsonData?.properties?.id || null,
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
          geojsonData?.properties?.id || null,
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

  for (const key in newVal.paint) {
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
