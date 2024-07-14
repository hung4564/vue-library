import { ABuild, IView } from '@hungpvq/vue-map-core';
import { LayerActionBuild } from './action';
import { LayerComponentBuild } from './component';
import { LayerIdentifyBuild } from './identify';
import { LayerInfoShowBuild } from './info';
import { LayerLegendBuild } from './legend';
import { LayerListBuild } from './list';
import { LayerMapBuild } from './map/map';
export const LayerBuilder = {
  source<T extends ABuild>(builder: T): T {
    builder.key = 'source';
    return builder;
  },
  list<T extends ABuild<any, IView> | LayerListBuild = LayerListBuild>(
    builder?: T
  ): T {
    if (!builder) {
      builder = new LayerListBuild() as T;
    }
    builder.key = 'list';
    return builder;
  },
  map<T extends ABuild | LayerMapBuild = LayerMapBuild>(builder?: T): T {
    if (!builder) {
      builder = new LayerMapBuild() as T;
    }
    builder.key = 'map';
    return builder;
  },
  identify<T extends ABuild | LayerIdentifyBuild = LayerIdentifyBuild>(
    builder?: T
  ): T {
    if (!builder) {
      builder = new LayerIdentifyBuild() as T;
    }
    builder.key = 'identify';
    return builder;
  },
  info<T extends ABuild | LayerInfoShowBuild = LayerInfoShowBuild>(
    builder?: T
  ): T {
    if (!builder) {
      builder = new LayerInfoShowBuild() as T;
    }
    builder.key = 'show_info';
    return builder;
  },
  legend<T extends ABuild | LayerLegendBuild = LayerLegendBuild>(
    builder?: T
  ): T {
    if (!builder) {
      builder = new LayerLegendBuild() as T;
    }
    builder.key = 'legend';
    return builder;
  },
  action<T extends ABuild | LayerActionBuild = LayerActionBuild>(
    builder?: T
  ): T {
    if (!builder) {
      builder = new LayerActionBuild() as T;
    }
    builder.key = 'action';
    return builder;
  },
  component<T extends ABuild | LayerComponentBuild = LayerComponentBuild>(
    builder?: T
  ): T {
    if (!builder) {
      builder = new LayerComponentBuild() as T;
    }
    builder.key = 'component';
    return builder;
  },
};
