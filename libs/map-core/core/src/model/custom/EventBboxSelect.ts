/**
 * Framework-agnostic bounding box selection event model
 */

import type { MapSimple } from '../../types';
import type {
  EventBboxRangerHandle,
  EventBboxRangerOption,
} from '../../types/event';
import { startBoxRangerMap, type BoxRangerHandle } from '../../utils';
import { Event } from '../Event';

/**
 * Bounding box ranger event handler for map
 * Allows users to draw a selection box on the map
 */
export class EventBboxRanger extends Event<
  'click',
  EventBboxRangerOption,
  EventBboxRangerHandle
> {
  get name(): string {
    return 'EventBboxRanger';
  }

  protected map_ranger?: BoxRangerHandle;
  protected _originalHandlers: Record<string, boolean> = {};

  constructor() {
    super('click', 'map');
    this.setClassPointer('pointer');
  }

  /**
   * Set the CSS class for pointer cursor
   */
  setClassPointer(classPointer: string): void {
    this.options.classPointer = classPointer;
  }

  /**
   * Set the bounding box handler callback
   */
  override setHandler(handler: EventBboxRangerHandle): this {
    this.handler = handler;
    return this;
  }

  /**
   * Add bounding box selection to map
   * Disables map interactions while selecting
   */
  override addToMap(map: MapSimple): this {
    if (!this.handler) {
      return this;
    }

    if (this.options.classPointer) {
      map.getCanvas().classList.add(this.options.classPointer);
    }

    try {
      // Store original handlers state
      this._originalHandlers = {
        scrollZoom: map.scrollZoom.isEnabled(),
        dragRotate: map.dragRotate.isEnabled(),
        touchZoomRotate: map.touchZoomRotate.isEnabled(),
        doubleClickZoom: map.doubleClickZoom.isEnabled(),
        dragPan: map.dragPan.isEnabled(),
        boxZoom: map.boxZoom.isEnabled(),
      };

      // Disable map interactions
      if (map.scrollZoom.isEnabled()) map.scrollZoom.disable();
      if (map.dragRotate.isEnabled()) map.dragRotate.disable();
      if (map.touchZoomRotate.isEnabled()) map.touchZoomRotate.disable();
      if (map.doubleClickZoom.isEnabled()) map.doubleClickZoom.disable();
      if (map.dragPan.isEnabled()) map.dragPan.disable();
      if (map.boxZoom.isEnabled()) map.boxZoom.disable();

      this.map_ranger = startBoxRangerMap(
        map.getCanvasContainer() as HTMLCanvasElement,
        this.handler,
      );
    } catch (error) {
      console.error('Error disabling map controls:', error);
    }

    return this;
  }

  /**
   * Remove bounding box selection from map
   * Re-enables map interactions
   */
  override removeFromMap(map: MapSimple): this {
    if (this.options.classPointer) {
      map.getCanvas().classList.remove(this.options.classPointer);
    }

    try {
      // Re-enable map interactions based on original state
      if (this._originalHandlers['scrollZoom'] !== false) {
        map.scrollZoom.enable();
      }
      if (this._originalHandlers['dragRotate'] !== false) {
        map.dragRotate.enable();
      }
      if (this._originalHandlers['touchZoomRotate'] !== false) {
        map.touchZoomRotate.enable();
      }
      if (this._originalHandlers['doubleClickZoom'] !== false) {
        map.doubleClickZoom.enable();
      }
      if (this._originalHandlers['dragPan'] !== false) {
        map.dragPan.enable();
      }
      if (this._originalHandlers['boxZoom'] !== false) {
        map.boxZoom.enable();
      }
    } catch (error) {
      console.error('Error re-enabling map controls:', error);
    }

    if (this.map_ranger) {
      this.map_ranger.destroy();
      this.map_ranger = undefined;
    }

    return this;
  }
}
