import type { MapSimple } from '@hungpvq/shared-map';
import type {
  AnySourceData,
  GeoJSONSource,
  GeoJSONSourceRaw,
  RasterSource,
} from 'mapbox-gl';
import type {
  IFieldInfo,
  IMapboxSourceView,
  IMetadataView,
} from '../interfaces/dataset.parts';
import { DatasetLeaf } from './dataset.base';
import { findSiblingOrNearestLeaf } from './dataset.visitors';

export abstract class DatasetPartMapboxSourceComponent<T = any>
  extends DatasetLeaf<T>
  implements IMapboxSourceView
{
  override get type(): string {
    return 'source';
  }
  abstract getMapboxSource(): AnySourceData;
  abstract getFieldsInfo(): IFieldInfo[];
  abstract getDataInfo(): any;
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
  getFieldsInfo(): IFieldInfo[] {
    return [
      {
        trans: 'map.layer-control.field.name',
        value: 'name',
      },
      {
        trans: 'map.layer-control.field.bound.title',
        value: 'bbox',
      },
      {
        trans: 'map.layer-control.field.geojson',
        value: 'geojson',
        inline: true,
      },
    ];
  }
  getDataInfo(): any {
    const metadata = findSiblingOrNearestLeaf(
      this,
      (dataset) => dataset.type == 'metadata'
    ) as IMetadataView;
    return {
      name: this.name,
      bbox: metadata?.metadata?.bbox,
      geojson: JSON.stringify(this.getData(), undefined, 2),
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
    this.setData(data);
  }
}

export class RasterUrlSource extends DatasetPartMapboxSourceComponent {
  override getMapboxSource(): RasterSource {
    return this.data;
  }
  getFieldsInfo(): IFieldInfo[] {
    return [
      {
        trans: 'map.layer-control.field.name',
        value: 'name',
      },
      {
        trans: 'map.layer-control.field.bound.title',
        value: 'bbox',
      },
      {
        trans: 'map.layer-control.field.tiles',
        value: 'tiles',
      },
    ];
  }
  getDataInfo(): any {
    const metadata = findSiblingOrNearestLeaf(
      this,
      (dataset) => dataset.type == 'metadata'
    ) as IMetadataView;
    return {
      name: this.name,
      bbox: metadata?.metadata?.bbox || this.getData().bounds,
      tiles: this.getData().tiles?.join(',\n'),
    };
  }
}
