import type { MapSimple } from '@hungpvq/shared-map';

export type WithToggleShow = {
  toggleShow: (map: MapSimple, show?: boolean) => void;
};
export type WithSetOpacity = {
  setOpacity(map: MapSimple, opacity: number): void;
};
