import type {
  VectorSourceSpecification,
} from 'maplibre-gl';
import type { IMapboxSourceView } from '../interfaces';
import { resolveDatasetBbox } from '../utils/bbox';
import { createNamedComponent } from '../model/base';
import { createDatasetPartMapboxSourceComponent } from '../model/source/base';

export function createDatasetPartVectorTileComponent(
  name: string,
  data?: Partial<VectorSourceSpecification>,
): IMapboxSourceView {
  const base = createDatasetPartMapboxSourceComponent<
    Partial<VectorSourceSpecification> | undefined
  >(name, data);
  return createNamedComponent('GeojsonSourceComponent', {
    ...base,
    getMapboxSource: (): VectorSourceSpecification => ({
      type: 'vector',
      ...(base.getData() ?? {}),
    }),

    getFieldsInfo() {
      return [
        { trans: 'map.layer-control.field.name', value: 'name' },
        { trans: 'map.layer-control.field.type', value: 'type' },
        { trans: 'map.layer-control.field.source-id', value: 'sourceId' },
        { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
        { trans: 'map.layer-control.field.url', value: 'url', inline: true },
        { trans: 'map.layer-control.field.tiles', value: 'tiles', inline: true },
        { trans: 'map.layer-control.field.minzoom', value: 'minzoom' },
        { trans: 'map.layer-control.field.maxzoom', value: 'maxzoom' },
        { trans: 'map.layer-control.field.scheme', value: 'scheme' },
        { trans: 'map.layer-control.field.attribution', value: 'attribution' },
      ];
    },
    getDataInfo() {
      const spec = this.getMapboxSource() as VectorSourceSpecification & {
        id?: string;
      };
      return {
        name: base.getName(),
        type: spec.type,
        sourceId: this.getSourceId(),
        bbox: resolveDatasetBbox(base) || spec.bounds,
        url: spec.url,
        tiles: spec.tiles?.join('\n'),
        minzoom: spec.minzoom,
        maxzoom: spec.maxzoom,
        scheme: spec.scheme,
        attribution: spec.attribution,
      };
    },
  });
}
