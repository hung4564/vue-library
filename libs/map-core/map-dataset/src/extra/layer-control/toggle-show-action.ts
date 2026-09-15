import type { MapSimple } from '@hungpvq/map-core';
import type { IListViewUI } from '../../model/list/types';
import { setListViewIntendedShow } from './visibility';

export const TOGGLE_SHOW_LAYER_EVENT = 'toggleShow' as const;

export type ToggleShowLayerEvent = { show: boolean };

export function getToggleShowTitleKey(show: boolean): string {
  return show
    ? 'map.layer-control.toggle.hide'
    : 'map.layer-control.toggle.show';
}

export function nextToggleShowValue(current: boolean | undefined): boolean {
  return !current;
}

export function applyToggleShowIntent(
  item: IListViewUI,
  map: MapSimple,
  show: boolean,
  applyToMap: boolean,
): void {
  setListViewIntendedShow(item, map, show, applyToMap);
}

export function readToggleShowEvent(event: ToggleShowLayerEvent): boolean {
  return event.show;
}

/** Subscribe to layer-item toggle-show sync events; returns cleanup. */
export function bindToggleShowAction(
  item: IListViewUI,
  onShowChange: (show: boolean) => void,
): () => void {
  const handler = (event: ToggleShowLayerEvent) =>
    onShowChange(readToggleShowEvent(event));
  item.on(TOGGLE_SHOW_LAYER_EVENT, handler);
  return () => item.off(TOGGLE_SHOW_LAYER_EVENT, handler);
}

export type PerformToggleShowActionOptions = {
  item: IListViewUI;
  map: MapSimple;
  currentShow: boolean | undefined;
  applyToMap: boolean;
  disabled?: boolean;
  onShowChange: (show: boolean) => void;
};

/** Shared toggle-show click handler (updates local state + map intent). */
export function performToggleShowAction(
  options: PerformToggleShowActionOptions,
): void {
  const { item, map, currentShow, applyToMap, disabled, onShowChange } =
    options;
  if (disabled) return;
  const show = nextToggleShowValue(currentShow);
  onShowChange(show);
  applyToggleShowIntent(item, map, show, applyToMap);
}
