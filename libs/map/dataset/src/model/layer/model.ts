import { copyByJson } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import type { AnyLayer, Layer } from 'mapbox-gl';
import MultiStyle from '../../modules/StyleControl/style/multi-style.vue';
import { createNamedComponent } from '../base';
import { findFirstLeafByType } from '../dataset.visitors';
import { createDatasetPartMapboxLayerComponent } from './base';

export function createMultiMapboxLayerComponent(
  name: string,
  data: Partial<Layer>[] = []
) {
  const base = createDatasetPartMapboxLayerComponent<Partial<Layer>[]>(
    name,
    data
  );

  // Gán id nếu chưa có
  base.getData().forEach((layer: any, index: number) => {
    if (!layer.id) {
      layer.id = `${base.id}-${index}`;
    }
  });

  return createNamedComponent('MultiMapboxLayerComponent', {
    ...base,

    getBeforeId(): string | undefined {
      return base.getData()[0]?.id;
    },

    getAllLayerIds(): string[] {
      return base.getData().map((l) => l.id!);
    },

    getComponentUpdate(): () => any {
      return () => MultiStyle;
    },

    addToMap(map: MapSimple, beforeId?: string): void {
      const source = findFirstLeafByType(base, 'source');
      base.getData().forEach((layer) => {
        if (!map.getLayer(layer.id!)) {
          if (!layer.source && source?.id) {
            layer.source = source.id;
          }
          map.addLayer(layer as AnyLayer, beforeId);
        }
      });
    },

    removeFromMap(map: MapSimple): void {
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
            show ? 'visible' : 'none'
          );
        }
      });
    },

    setOpacity(map: MapSimple, opacity: number): void {
      base.getData().forEach((layer) => {
        if (map.getLayer(layer.id!)) {
          const keyOpacity =
            layer.type === 'symbol' ? 'icon-opacity' : `${layer.type}-opacity`;
          map.setPaintProperty(layer.id!, keyOpacity, opacity);
        }
      });
    },

    updateValue(
      map: MapSimple,
      value: { type: string; index: number; layer: any }
    ) {
      const { type, index } = value;
      let { layer } = value;

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
            source: base.getData()[0]?.source,
          };
          map.addLayer(layer);
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
  });
}

function updateStyleLayer(map: MapSimple, old: any, newVal: any) {
  map.setLayerZoomRange(
    old.id,
    newVal['min-zoom'] ?? old['min-zoom'] ?? 0,
    newVal['max-zoom'] ?? old['max-zoom'] ?? 24
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
