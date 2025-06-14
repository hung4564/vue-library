export type ContainerStore = {
  items: string[];
  show: string[];
  actions: Record<string, ContainerStoreAction>;
  height: number;
  width: number;
  isMobile: boolean;
};
export type ContainerStoreAction = {
  setZIndex: (value: number) => void;
} & InitOption;

export type InitOption =
  | {
      title?: string;
      type: 'item-sidebar';
      location: 'left' | 'right';
    }
  | {
      title?: string;
      type: Exclude<string, 'item-sidebar'>;
    };
