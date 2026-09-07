export type ItemGroupKey = 'popup' | 'modal' | 'float' | 'bottom';

export type ItemGroupConfig = {
  items: string[];
  /** Visible item ids in open/z-order (last = top). */
  show: string[];
};

/** Persisted geometry for an item (popup/modal bounds or drawer size/edge). */
export type ItemLayoutState = {
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  size?: number;
  location?: LocationSideBar;
};

/** Serializable panel row for getLayout / applyLayout. */
export type PanelSnapshot = {
  id: string;
  type: DraggableItemType | string;
  show: boolean;
  title?: string;
  bounds?: ItemLayoutState['bounds'];
  size?: number;
  location?: LocationSideBar;
};

export type ContainerStore = {
  popup: ItemGroupConfig;
  modal: ItemGroupConfig;
  float: ItemGroupConfig;
  bottom: ItemGroupConfig;
  actions: Record<string, ContainerStoreAction>;
  /** Cached geometry keyed by stable item id. */
  layouts: Record<string, ItemLayoutState>;
  height: number;
  width: number;
  isMobile: boolean;
  sideBar: Record<LocationSideBar, SidebarConfig>;
  drawer: Record<LocationSideBar, DrawerConfig>;
};
export type ContainerStoreAction = {
  setZIndex: (value: number) => void;
  setShow: (value: boolean) => void;
} & Partial<ContainerStoreOtherAction> &
  InitOption;
export type ContainerStoreOtherAction = {
  setHighLight: (highlight?: boolean) => void;
  open: () => void;
  close: () => void;
};

export type DraggableItemType =
  | 'item-popup'
  | 'item-float'
  | 'item-bottom'
  | 'item-modal'
  | 'item-sidebar'
  | 'item-drawer';

export type InitOption =
  | {
      title?: string;
      type: 'item-sidebar';
      location: LocationSideBar;
    }
  | {
      title?: string;
      type: 'item-drawer';
      location: LocationSideBar;
    }
  | {
      title?: string;
      type: 'item-popup' | 'item-float' | 'item-bottom' | 'item-modal' | string;
    };

export type LocationSideBar = 'left' | 'right' | 'top' | 'bottom';
export type SidebarConfig = {
  items: string[];
  show?: string;
};
export type DrawerConfig = {
  items: string[];
  show?: string;
  size: number;
};

export function createEmptyItemGroup(): ItemGroupConfig {
  return { items: [], show: [] };
}

export function itemTypeToGroup(type?: string): ItemGroupKey {
  switch (type) {
    case 'item-modal':
      return 'modal';
    case 'item-float':
      return 'float';
    case 'item-bottom':
      return 'bottom';
    case 'item-popup':
    default:
      return 'popup';
  }
}

export function createEmptyDrawer(): Record<LocationSideBar, DrawerConfig> {
  return {
    left: { items: [], size: 0, show: undefined },
    right: { items: [], size: 0, show: undefined },
    top: { items: [], size: 0, show: undefined },
    bottom: { items: [], size: 0, show: undefined },
  };
}

export function createEmptySideBar(): Record<LocationSideBar, SidebarConfig> {
  return {
    left: { items: [], show: undefined },
    right: { items: [], show: undefined },
    top: { items: [], show: undefined },
    bottom: { items: [], show: undefined },
  };
}

export function createEmptyContainer(): ContainerStore {
  return {
    popup: createEmptyItemGroup(),
    modal: createEmptyItemGroup(),
    float: createEmptyItemGroup(),
    bottom: createEmptyItemGroup(),
    sideBar: createEmptySideBar(),
    actions: {},
    layouts: {},
    height: 0,
    width: 0,
    isMobile: false,
    drawer: createEmptyDrawer(),
  };
}
