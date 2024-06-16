import { mdiCrosshairsGps } from '@mdi/js';

import {
  ABuild,
  AView,
  IActionView,
  ILayer,
  LayerAction,
  LayerActionOption,
  Menu,
} from '@hungpvq/vue-map-core';
import ToggleShow from './toggle-show.vue';
export class LayerActionBuild extends ABuild<LayerActionOption, IActionView> {
  constructor(options: LayerActionOption = { actions: [] }) {
    super('action', options);
    this.setBuild(
      (layer: ILayer, option: LayerActionOption) =>
        new LayerActionView(layer, option)
    );
  }
  addActions(actions: LayerAction[]): LayerActionBuild {
    this.option.actions.push(...actions);
    return this;
  }
  addAction(action: LayerAction): LayerActionBuild {
    const index = this.option.actions.findIndex((x) => x.id === action.id);
    if (index >= 0) {
      this.option.actions.splice(index, 1);
    }
    if (action) this.option.actions.push(action);
    return this;
  }
}

export class LayerActionView extends AView implements IActionView {
  layer: ILayer;
  option: LayerActionOption;
  menu_cache: Record<string, LayerAction> = {};
  constructor(layer: ILayer, option: LayerActionOption = { actions: [] }) {
    super();
    this.layer = layer;
    this.option = option;
    this.resetCacheMenu();
  }
  get menus() {
    return this.option.actions.reduce<Menu[]>((acc, cur) => {
      if (cur.menu) {
        if (cur.menu.type == 'item') cur.menu.id = cur.id;
        acc.push(cur.menu);
      }
      return acc;
    }, []);
  }
  call(id: string, map_id: string) {
    const menu = this.menu_cache[id];
    if (!this.parent) {
      return;
    }
    if (menu.menu.type == 'item') {
      if (menu.component) {
        this.layer.getView('component').setFromAction(menu);
      } else if (menu.menu.click) {
        menu.menu.click(this.parent, map_id);
      }
    }
  }
  get(id: string): LayerAction {
    return this.menu_cache[id];
  }
  addActions(actions: LayerAction[]): LayerActionView {
    this.option.actions.push(...actions);
    this.resetCacheMenu();
    return this;
  }
  addAction(action: LayerAction): LayerActionView {
    if (action) {
      const index = this.option.actions.findIndex((x) => x.id === action.id);
      if (index >= 0) {
        this.option.actions.splice(index, 1);
      }
      this.option.actions.push(action);
    }
    this.resetCacheMenu();
    return this;
  }
  updateAction(action: LayerAction): LayerActionView {
    const index = this.option.actions.findIndex((x) => x.id === action.id);
    if (index >= 0) {
      this.option.actions[index] = action;
      this.resetCacheMenu();
    }
    if (!this.parent) {
      return this;
    }
    return this;
  }
  private resetCacheMenu() {
    this.menu_cache = this.option.actions.reduce<{
      [key: string]: LayerAction;
    }>((acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    }, {});
  }
}

export function toBoundAction(): LayerAction {
  return {
    id: 'to-bound',
    type: 'to-bound',
    menu: {
      id: 'to-bound',
      location: 'extra',
      type: 'item',
      name: 'Fly to',
      icon: mdiCrosshairsGps,
    },
  };
}
export function toggleShowAction(): LayerAction {
  return {
    id: 'toggle-show',
    type: 'toggle-show',
    menu: {
      id: 'toggle-show',
      location: 'extra',
      type: 'item',
      name: 'Fly to',
      icon: () => {
        return ToggleShow;
      },
    },
  };
}
