/**
 * Right-click (contextmenu) event model — same pattern as EventClick.
 */

import type { MapMouseEvent } from 'maplibre-gl';
import type { MapSimple } from '../../types';
import type { EventClickOption } from '../../types/event';
import { Event } from '../Event';

export class EventContextMenu extends Event<'contextmenu', EventClickOption> {
  get name(): string {
    return 'EventContextMenu';
  }

  private boundHandler?: (ev: MapMouseEvent) => void;

  constructor(type_select = 'map') {
    super('contextmenu', type_select);
  }

  setClassPointer(classPointer: string): this {
    this.options.classPointer = classPointer;
    return this;
  }

  override addToMap(map: MapSimple): this {
    if (this.options.classPointer) {
      map.getCanvas().classList.add(this.options.classPointer);
    }
    if (this.handler) {
      this.boundHandler = (ev: MapMouseEvent) => {
        ev.preventDefault();
        this.handler?.(ev);
      };
      map.on('contextmenu', this.boundHandler);
    }
    return this;
  }

  override removeFromMap(map: MapSimple): this {
    if (this.options.classPointer) {
      map.getCanvas().classList.remove(this.options.classPointer);
    }
    if (this.boundHandler) {
      map.off('contextmenu', this.boundHandler);
      this.boundHandler = undefined;
    }
    return this;
  }
}

export { EventContextMenu as EventRightClick };
