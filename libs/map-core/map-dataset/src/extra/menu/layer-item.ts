import type { MenuAction, MenuActionLocation } from '../../interfaces';
import type { IListViewUI } from '../../model/list/types';
import type { ListViewGroupOption } from './items';

/** Shared props for LayerControl row actions (opacity, toggle, …). */
export interface WithLayerItemActionType {
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
  disabled?: boolean;
  /** From `item.location` — full LayerControl menu placement. */
  location?: MenuActionLocation;
}

/**
 * Shared props for LayerControl menu components (identify, export, add-to-group, …).
 * `onClose` is used by React context menus; Vue typically emits `close` instead.
 */
export interface WithLayerItemMenuComponentType extends WithLayerItemActionType {
  getGroups?: () => ListViewGroupOption[];
  onClose?: () => void;
}
