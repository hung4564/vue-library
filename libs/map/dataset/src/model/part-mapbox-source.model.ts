import { MapSimple } from '@hungpvq/shared-map';
import { AnySourceData, GeoJSONSourceRaw, RasterSource } from 'mapbox-gl';
import { IMapboxSourceView } from '../interfaces/dataset.parts';
import { DatasetLeaf } from './dataset.base';

export abstract class DatasetPartMapboxSourceComponent
  extends DatasetLeaf
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

export class GeojsonSource extends DatasetPartMapboxSourceComponent {
  override getMapboxSource(): GeoJSONSourceRaw {
    return {
      type: 'geojson',
      data: this.getData() || {
        type: 'FeatureCollection',
        features: [],
      },
    };
  }
}

export class RasterUrlSource extends DatasetPartMapboxSourceComponent {
  override getMapboxSource(): RasterSource {
    return this.data;
  }
}
