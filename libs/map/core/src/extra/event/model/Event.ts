import { MapSimple } from '@hungpvq/shared-map';
import { EventData, MapLayerEventType } from 'mapbox-gl';
import { Base } from '../../../model/Base';
import { IEvent } from '../types';

export class Event<
    T extends keyof MapLayerEventType = 'click',
    IOption extends Record<string, any> = any,
    ICallBack = (ev: MapLayerEventType[T] & EventData) => void
  >
  extends Base
  implements IEvent<T, IOption, ICallBack>
{
  public event_map_type: string;
  public type_select: string;
  public options: IOption;
  public handler?: ICallBack;
  constructor(event_map_type: string, type_select = 'map') {
    super();
    this.event_map_type = event_map_type;
    this.type_select = type_select;
    this.options = {} as IOption;
  }
  setHandler(handler: ICallBack) {
    this.handler = handler;
    return this;
  }
  addToMap(map: MapSimple) {
    if (this.handler) map.on(this.event_map_type, this.handler as any);
    return this;
  }
  removeFromMap(map: MapSimple) {
    if (this.handler) map.off(this.event_map_type, this.handler as any);
    return this;
  }
}
