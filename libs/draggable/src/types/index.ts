export type ContainerStore = {
  items: string[];
  show: string[];
  actions: Record<string, ContainerStoreAction>;
  height: number;
  width: number;
  isMobile: boolean;
};
export type ContainerStoreAction = { setZIndex: (value: number) => void };

declare global {
  interface Window {
    $_hungpv_store: any;
  }
}
