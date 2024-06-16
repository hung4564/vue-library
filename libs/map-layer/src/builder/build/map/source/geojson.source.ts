import type { MapSimple } from '@hungpv97/shared-map';
import { ABuild } from '@hungpv97/vue-map-core';
import { bbox } from '@turf/turf';
import type {
  BBox,
  Feature,
  FeatureCollection,
  GeoJSON,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import { GeoJSONSource, GeoJSONSourceRaw } from 'mapbox-gl';
import { ASource, ISource } from './ASource';

export interface IGeojsonOption {
  bounds?: BBox;
}

export class GeoJsonSourceBuild extends ABuild<
  Partial<IGeojsonOption>,
  GeojsonSource
> {
  protected geojson!: GeoJSON;
  constructor(option: Partial<IGeojsonOption> = {}) {
    super('source', option);
    this.setBuild(() => {
      return new GeojsonSource(this.geojson, this.option);
    });
  }
  setData(geojson: GeoJSON) {
    this.geojson = geojson;
    return this;
  }
}

export class GeojsonSource<T extends GeoJsonProperties = GeoJsonProperties>
  extends ASource<T>
  implements ISource
{
  public geojson!: FeatureCollection<Geometry, T>;
  protected field_id = 'id';
  protected option: IGeojsonOption;
  constructor(geojson: GeoJSON, option: IGeojsonOption = {}) {
    super();
    this.setData(geojson);
    this.option = option;
  }
  getMapboxSource(): GeoJSONSourceRaw {
    return {
      type: 'geojson',
      data: this.getAll(),
    };
  }
  updateForMap(map: MapSimple) {
    const source = map.getSource(this.id) as GeoJSONSource;
    if (source)
      source.setData(
        this.geojson || {
          type: 'FeatureCollection',
          features: [],
        }
      );
  }
  setData(
    data?: FeatureCollection<Geometry, T> | GeoJSON | string | undefined
  ) {
    if (!data) {
      return undefined;
    }
    if (typeof data === 'string') {
      data = JSON.parse(data) as GeoJSON;
    }
    let temp: FeatureCollection<Geometry, T>;
    if (data.type === 'FeatureCollection') {
      temp = data as FeatureCollection<Geometry, T>;
    } else if (data.type === 'Feature') {
      temp = {
        type: 'FeatureCollection',
        features: [data as Feature<Geometry, T>],
      };
    } else {
      temp = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {} as T,
            geometry: data,
          },
        ],
      };
    }
    this.geojson = temp;
    this.setBounds(bbox(data));
  }
  getAll() {
    return this.geojson;
  }
}
