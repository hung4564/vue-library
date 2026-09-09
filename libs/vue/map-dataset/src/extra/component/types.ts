import type { IListViewUI } from '@hungpvq/map-dataset';
import type { ListViewGroupOption, MenuAction, MenuActionLocation } from '@hungpvq/map-dataset/menu';

/**
 * Local props interfaces for `defineProps<>` — Vue SFC compiler cannot resolve
 * these when imported only from `@hungpvq/map-dataset`.
 * Keep in sync with `libs/map-core/map-dataset/src/extra/menu/layer-item.ts`.
 */
export interface WithLayerItemActionType {
  item: MenuAction<IListViewUI>;
  data: IListViewUI;
  mapId: string;
  disabled?: boolean;
  /** From `item.location` — full LayerControl menu placement. */
  location?: MenuActionLocation;
}

export interface WithLayerItemMenuComponentType extends WithLayerItemActionType {
  getGroups?: () => ListViewGroupOption[];
  onClose?: () => void;
}
