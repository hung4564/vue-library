import { MapSimple } from '@hungpvq/shared-map';
import {
  AnySourceData,
  GeoJSONSource,
  GeoJSONSourceOptions,
  GeoJSONSourceRaw,
  RasterSource,
} from 'mapbox-gl';
import { IMapboxSourceView } from '../interfaces/dataset.parts';
import { DatasetLeaf } from './dataset.base';

export abstract class DatasetPartMapboxSourceComponent<T = any>
  extends DatasetLeaf<T>
  implements IMapboxSourceView
{
  override get type(): string {
    return 'source';
  }
  abstract getMapboxSource(): AnySourceData;
  addToMap(map: MapSimple) {
    if (this.id && !map.getSource(this.id)) {
      map.addSource(this.id, this.getMapboxSource());
    }
  }
  removeFromMap(map: MapSimple) {
    if (this.id && map.getSource(this.id)) {
      map.removeSource(this.id);
    }
  }
}

export class GeojsonSource extends DatasetPartMapboxSourceComponent<
  GeoJSONSourceRaw['data']
> {
  override getMapboxSource(): GeoJSONSourceRaw {
    return {
      type: 'geojson',
      data: this.getData() || {
        type: 'FeatureCollection',
        features: [],
      },
    };
  }

  updateData(
    map: MapSimple,
    data:
      | GeoJSON.Feature<GeoJSON.Geometry>
      | GeoJSON.FeatureCollection<GeoJSON.Geometry>
      | string
  ): void {
    const source = map.getSource(this.id) as GeoJSONSource;
    if (source) {
      source.setData(data);
    }
  }
}

export class RasterUrlSource extends DatasetPartMapboxSourceComponent {
  override getMapboxSource(): RasterSource {
    return this.data;
  }
}
