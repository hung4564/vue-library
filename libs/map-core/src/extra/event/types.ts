import { Coordinates, MapSimple } from '@hungpv97/shared-map';
import { EventData, MapLayerEventType } from 'mapbox-gl';

export interface EventClickOption {
  classPointer?: string;
}
export type EventBboxRangerOption = EventClickOption;
export type EventBboxRangerHandle = (
  _bbox?: [Coordinates, Coordinates]
) => void;
export interface IEvent<
  T extends keyof MapLayerEventType = 'click',
  IOption extends Record<string, any> = any,
  ICallBack = (ev: MapLayerEventType[T] & EventData) => void
> {
  _id: string;
  get id(): string;
  event_map_type: string;
  type_select: string;
  options: IOption;
  handler?: ICallBack;
  setHandler(_handler: ICallBack): this;
  addToMap(_map: MapSimple): this;
  removeFromMap(_map: MapSimple): this;
}
