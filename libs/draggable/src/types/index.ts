export type ContainerStore = {
  items: string[];
  show: string[];
  actions: Record<string, ContainerStoreAction>;
  height: number;
  width: number;
  isMobile: boolean;
  sideBar: Record<LocationSideBar, SidebarConfig>;
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

export type InitOption =
  | {
      title?: string;
      type: 'item-sidebar';
      location: LocationSideBar;
    }
  | {
      title?: string;
      type: Exclude<string, 'item-sidebar'>;
    };
export type LocationSideBar = 'left' | 'right' | 'top' | 'bottom';
export type SidebarConfig = {
  items: string[];
  show?: string;
};
