import { ABuild } from '@hungpvq/vue-map-core';
import type { BBox } from 'geojson';
import { RasterSource as MapBoxRasterSource } from 'mapbox-gl';
import { ASource, ISource } from './ASource';

export type SourceScheme = 'xyz' | 'tms';

export class RasterSource extends ASource implements ISource {
  public option: Partial<MapBoxRasterSource>;
  constructor(option = {}) {
    super();
    this.option = option;
    if (this.option.bounds) {
      this.setBounds(this.option.bounds as [number, number, number, number]);
    }
  }
  updateForMap() {
    return;
  }
  getMapboxSource(): MapBoxRasterSource {
    return {
      type: 'raster',
      ...this.option,
      bounds: this.bounds || [-180, -85.051129, 180, 85.051129],
    };
  }
}

export class RasterSourceBuild extends ABuild<
  Partial<MapBoxRasterSource>,
  RasterSource
> {
  constructor(option: Partial<MapBoxRasterSource> = {}) {
    super('source', option);
    this.setBuild(() => {
      return new RasterSource(this.option);
    });
  }
  setTiles(tiles: string[]) {
    this.option.tiles = tiles;
    return this;
  }
  setMaxzoom(maxzoom: number) {
    this.option.maxzoom = maxzoom;
    return this;
  }
  setMinzoom(minzoom: number) {
    this.option.minzoom = minzoom;
    return this;
  }
  setScheme(scheme: SourceScheme) {
    this.option.scheme = scheme;
    return this;
  }
  setTileSize(tileSize: number) {
    this.option.tileSize = tileSize;
    return this;
  }
  setBounds(bounds?: BBox) {
    this.option.bounds = bounds;
    return this;
  }
  setUrl(url: string) {
    this.option.url = url;
    return this;
  }
}
