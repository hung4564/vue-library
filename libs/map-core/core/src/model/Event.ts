/**
 * Framework-agnostic Event model
 * Base class for map event handlers
 */

import type { MapLayerEventType } from 'maplibre-gl';
import type { MapSimple } from '../types';
import { Base } from './Base';

/**
 * Interface for event models
 * Note: ICallBack is not constrained to allow more specific event types
 * (e.g., MapLayerMouseEvent) to be used while still being compatible with IEvent
 */
export interface IEvent<
  IOption extends Record<string, unknown> = Record<string, unknown>,
  ICallBack = (ev: unknown) => void,
> {
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

/**
 * Base Event class for map event handling
 *
 * @template T - MapLibre event type key
 * @template IOption - Options type
 * @template ICallBack - Callback function type
 */
export class Event<
    T extends keyof MapLayerEventType = 'click',
    IOption extends Record<string, unknown> = Record<string, unknown>,
    ICallBack = (ev: MapLayerEventType[T]) => void,
  >
  extends Base
  implements IEvent<IOption, ICallBack>
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

  /**
   * Set the event handler callback
   */
  setHandler(handler: ICallBack): this {
    this.handler = handler;
    return this;
  }

  /**
   * Add event listener to map
   */
  addToMap(map: MapSimple): this {
    if (this.handler) {
      map.on(
        this.event_map_type,
        this.handler as (ev: MapLayerEventType[T]) => void,
      );
    }
    return this;
  }

  /**
   * Remove event listener from map
   */
  removeFromMap(map: MapSimple): this {
    if (this.handler) {
      map.off(
        this.event_map_type,
        this.handler as (ev: MapLayerEventType[T]) => void,
      );
    }
    return this;
  }
}
