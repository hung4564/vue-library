/**
 * Framework-agnostic click and mousemove event models
 */

import type { MapSimple } from '../../types';
import { Event } from '../Event';
import type { EventClickOption } from '../../types/event';

/**
 * Click event handler for map
 */
export class EventClick extends Event<'click', EventClickOption> {
  get name(): string {
    return 'EventClick';
  }

  constructor(type_select = 'map') {
    super('click', type_select);
    this.setClassPointer('pointer');
  }

  /**
   * Set the CSS class for pointer cursor
   */
  setClassPointer(classPointer: string): this {
    this.options.classPointer = classPointer;
    return this;
  }

  /**
   * Add click event listener to map
   * Also adds touchstart for mobile support
   */
  override addToMap(map: MapSimple): this {
    if (this.options.classPointer) {
      map.getCanvas().classList.add(this.options.classPointer);
    }
    if (this.handler) {
      map.on('click', this.handler);
      map.on('touchstart', this.handler);
    }
    return this;
  }

  /**
   * Remove click event listener from map
   */
  override removeFromMap(map: MapSimple): this {
    if (this.options.classPointer) {
      map.getCanvas().classList.remove(this.options.classPointer);
    }
    if (this.handler) {
      map.off('click', this.handler);
      map.off('touchstart', this.handler);
    }
    return this;
  }
}

/**
 * Mouse move event handler for map
 */
export class EventMouseMove extends Event<'mousemove', EventClickOption> {
  get name(): string {
    return 'EventMouseMove';
  }

  constructor(type_select = 'map') {
    super('mousemove', type_select);
    this.setClassPointer('pointer');
  }

  /**
   * Set the CSS class for pointer cursor
   */
  setClassPointer(classPointer: string): this {
    this.options.classPointer = classPointer;
    return this;
  }

  /**
   * Add mousemove event listener to map
   */
  override addToMap(map: MapSimple): this {
    if (this.options.classPointer) {
      map.getCanvas().classList.add(this.options.classPointer);
    }
    if (this.handler) {
      map.on('mousemove', this.handler);
    }
    return this;
  }

  /**
   * Remove mousemove event listener from map
   */
  override removeFromMap(map: MapSimple): this {
    if (this.options.classPointer) {
      map.getCanvas().classList.remove(this.options.classPointer);
    }
    if (this.handler) {
      map.off('mousemove', this.handler);
    }
    return this;
  }
}
