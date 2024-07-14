import { MapSimple } from '@hungpvq/shared-map';
import {
  Base,
  ILayer,
  ILayerEvent,
  ILayerEventName,
  IView,
  LayerInfo,
  TYPE_VIEW,
  TYPE_VIEW_NAME,
} from '@hungpvq/vue-map-core';
import mitt from 'mitt';
import { LayerViewContainer } from './part/view';

export class Layer extends Base implements ILayer {
  private _view: LayerViewContainer;
  info: LayerInfo;
  constructor() {
    super();
    this.info = { metadata: {} };
    this._view = new LayerViewContainer();
  }
  get metadata() {
    return this.info.metadata;
  }
  get name() {
    return this.info.name;
  }
  async run(key: string, map: MapSimple, ...args: any[]) {
    return this._view.runWithNameFunction(key, map, ...args);
  }
  async addToMap(map: MapSimple, ...args: any[]) {
    return this._view.runWithNameFunction('addToMap', map, ...args);
  }
  async removeFromMap(map: MapSimple, ...args: any[]) {
    return this._view.runWithNameFunction('removeFromMap', map, ...args);
  }
  async updateForMap(map: MapSimple, ...args: any[]) {
    return this._view.runWithNameFunction('updateForMap', map, ...args);
  }
  setInfo(info: LayerInfo) {
    if (info.metadata == null) {
      info.metadata = {
        loading: false,
      };
    } else {
      if (info.metadata.loading == null) {
        info.metadata.loading = false;
      }
    }
    this.info = info;
    return this;
  }
  setView(key: string, view: IView) {
    this._view.addView(key, view);
    return this;
  }
  getView<T extends TYPE_VIEW_NAME>(key: T): TYPE_VIEW[T] {
    return this._view.getView(key as string);
  }
  private eventBus = mitt<ILayerEvent>();
  emit<T extends ILayerEventName>(key: T, data: ILayerEvent[T]) {
    this.eventBus.emit(key, data);
    return this;
  }
  off<T extends ILayerEventName>(key: T, cb: (data: ILayerEvent[T]) => void) {
    this.eventBus.off(key, cb);
    return this;
  }
  on<T extends ILayerEventName>(key: T, cb: (data: ILayerEvent[T]) => void) {
    this.eventBus.on(key, cb);
    return this;
  }
}
