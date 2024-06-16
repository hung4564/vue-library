import {
  AView,
  IBuild,
  ILayer,
  ILayerComponentItem,
  ILayerComponentView,
  LayerAction,
} from '@hungpvq/vue-map-core';

const KEY = 'component';

export class LayerComponentBuild implements IBuild {
  key = KEY;
  build(layer: ILayer) {
    return new LayerComponentView(layer);
  }
}
export class LayerComponentView extends AView implements ILayerComponentView {
  components: ILayerComponentItem[] = [];
  layer: ILayer;
  constructor(layer: ILayer) {
    super();
    this.layer = layer;
  }
  add(component: ILayerComponentItem) {
    this.components.push(component);
    return this;
  }
  remove(component: ILayerComponentItem) {
    this.components = this.components.filter((x) => x.id !== component.id);
    return this;
  }
  removeFromMap() {
    this.components = [];
  }
  setFromAction(menu: LayerAction) {
    const id = menu.id;
    if (this.components.find((x) => x.id == id)) {
      return;
    }
    this.layer.emit('add-component', {
      layer: this.layer,
      component: {
        component: menu.component,
        option: menu.option,
        id,
      },
    });
    this.add({ id });
    return this;
  }
}
