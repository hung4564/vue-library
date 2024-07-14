import { getUUIDv4 } from '@hungpvq/shared';
import type { Color } from '@hungpvq/shared-map';
import {
  ABuild,
  IGroupListView,
  ILayer,
  IListView,
  ListOption,
} from '@hungpvq/vue-map-core';

export class LayerListBuild extends ABuild<any, IListView> {
  constructor(option: ListOption = {}) {
    super(option, { show: true, opacity: 1 });
    this.setBuild(createDefaultViewInList);
  }
  disableDelete() {
    this.option.disable_delete = true;
    return this;
  }
  disableOpacity() {
    this.option.disabled_opacity = true;
    return this;
  }
  setColor(color: Color) {
    this.option.color = color;
    return this;
  }
  setGroup(group: IGroupListView) {
    this.option.group = group;
    return this;
  }
}

export function createDefaultViewInList(
  layer: ILayer,
  option: ListOption = {}
): IListView {
  const show = option.show != null ? option.show : true;
  const opacity = option.opacity != null ? option.opacity : 1;
  let parent: ILayer | undefined;
  const temp: IListView = {
    setParent(_parent: ILayer) {
      parent = _parent;
    },
    get parent() {
      return parent;
    },
    index: 0,
    id: layer.id || getUUIDv4(),
    name: layer.name,
    show,
    opacity,
    selected: false,
    get metadata() {
      return layer.metadata;
    },
    color: option.color || '#38d4ff',
    config: {
      disable_delete: false,
      disabled_opacity: false,
      component: 'layer-item',
    },
    multi: false,
  };
  if (option.group) {
    temp.group = option.group;
  }
  if (option.disable_delete) {
    temp.config.disable_delete = option.disable_delete;
  }

  if (option.disabled_opacity) {
    temp.config.disabled_opacity = option.disabled_opacity;
  }

  return temp;
}
