import { Coordinates, MapSimple } from '@hungpvq/shared-map';
import { MapLayerEventType } from 'maplibre-gl';

export interface EventClickOption {
  classPointer?: string;
}
export type EventBboxRangerOption = EventClickOption;
export type EventBboxRangerHandle = (
  _bbox?: [Coordinates, Coordinates],
) => void;
export interface IEvent<
  T extends keyof MapLayerEventType = 'click',
  IOption extends Record<string, any> = any,
  ICallBack = (ev: MapLayerEventType[T]) => void,
> {
  _id: string;
  get id(): string;
  event_map_type: string;
  from?: string;
  name?: string;
  type_select: string;
  options: IOption;
  handler?: ICallBack;
  setHandler(_handler: ICallBack): this;
  addToMap(_map: MapSimple): this;
  removeFromMap(_map: MapSimple): this;
}

export const MittTypeMapEventEventKey = {
  setCurrent: 'map:event:set-current',
  add: 'map:event:add',
  remove: 'map:event:remove',
  setItems: 'map:event:set-items',
} as const;

export type MittTypeMapEvent = {
  [MittTypeMapEventEventKey.setCurrent]: IEvent | undefined | null;
  [MittTypeMapEventEventKey.add]: IEvent;
  [MittTypeMapEventEventKey.remove]: IEvent;
  [MittTypeMapEventEventKey.setItems]: IEvent[];
};
