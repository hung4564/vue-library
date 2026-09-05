import type { MapContextMenuItem, MapMenuCondition, MapMenuItemClick } from './types';

export function createMapMenuBuilder() {
  return {
    divider() {
      const state: {
        type: 'divider';
        id?: string;
        hidden?: MapMenuCondition;
      } = { type: 'divider' };
      return {
        setId(id: string) {
          state.id = id;
          return this;
        },
        setHidden(hidden: MapMenuCondition) {
          state.hidden = hidden;
          return this;
        },
        build() {
          return state;
        },
      };
    },
    header() {
      const state: {
        type: 'header';
        id?: string;
        name: string;
        hidden?: MapMenuCondition;
      } = { type: 'header', name: '' };
      return {
        setId(id: string) {
          state.id = id;
          return this;
        },
        setName(name: string) {
          state.name = name;
          return this;
        },
        setHidden(hidden: MapMenuCondition) {
          state.hidden = hidden;
          return this;
        },
        build() {
          return state;
        },
      };
    },
    item() {
      const state: {
        type: 'item';
        id?: string;
        name: string;
        icon?: string;
        click?: MapMenuItemClick;
        hidden?: MapMenuCondition;
        disabled?: MapMenuCondition;
        children?: MapContextMenuItem[];
        class?: string;
        location?: 'menu';
      } = { type: 'item', name: '', location: 'menu' };
      return {
        setId(id: string) {
          state.id = id;
          return this;
        },
        setLocation(loc: 'menu') {
          state.location = loc;
          return this;
        },
        setName(name: string) {
          state.name = name;
          return this;
        },
        setIcon(icon: string) {
          state.icon = icon;
          return this;
        },
        setClick(click: MapMenuItemClick) {
          state.click = click;
          return this;
        },
        setHidden(hidden: MapMenuCondition) {
          state.hidden = hidden;
          return this;
        },
        setDisabled(disabled: MapMenuCondition) {
          state.disabled = disabled;
          return this;
        },
        setChildren(children: MapContextMenuItem[]) {
          state.children = children;
          return this;
        },
        setAdditional(additional: Record<string, unknown>) {
          Object.assign(state, additional);
          return this;
        },
        build() {
          return state;
        },
      };
    },
  };
}
