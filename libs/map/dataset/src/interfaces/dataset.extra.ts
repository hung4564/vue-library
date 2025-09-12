import type { MapSimple } from '@hungpvq/shared-map';
import type { WithEventHelper } from '../extra';
import type { IDataset } from './dataset.base';

export type WithToggleShow = {
  toggleShow: (map: MapSimple, show: boolean) => void;
};
export type WithShow = {
  show: boolean;
};
export type WithOpacity = {
  opacity: number;
};
export type WithSetOpacity = {
  setOpacity(map: MapSimple, opacity: number): void;
};

export function toggleShow(
  this: IDataset & WithShow & Partial<WithEvent>,
  map: MapSimple,
  show: boolean,
) {
  this.show = !!show;
  if (this.emit) this.emit('toggleShow', { show, dataset: this });
}

export function setOpacity(
  this: IDataset & WithOpacity & Partial<WithEvent>,
  map: MapSimple,
  opacity: number,
) {
  this.opacity = opacity;
  if (this.emit) this.emit('changeOpacity', { opacity, dataset: this });
}
