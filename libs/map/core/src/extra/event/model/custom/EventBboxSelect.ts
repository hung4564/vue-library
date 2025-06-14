import { Coordinates, MapSimple } from '@hungpvq/shared-map';
import { EventBboxRangerHandle, EventBboxRangerOption } from '../../types';
import { Event } from '../Event';

type MapRangerHandle = {
  destroy: () => void;
};

export class EventBboxRanger extends Event<
  'click',
  EventBboxRangerOption,
  EventBboxRangerHandle
> {
  get name() {
    return 'EventBboxRanger';
  }
  protected map_ranger?: MapRangerHandle;
  protected _originalHandlers: Record<string, boolean> = {};

  constructor() {
    super('click', 'map');
    this.setClassPointer('pointer');
  }

  setClassPointer(classPointer: string) {
    this.options.classPointer = classPointer;
  }

  override setHandler(handler: EventBboxRangerHandle) {
    this.handler = handler;
    return this;
  }

  override addToMap(map: MapSimple) {
    if (!this.handler) {
      return this;
    }
    if (this.options.classPointer)
      map.getCanvas().classList.add(this.options.classPointer);

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

  override removeFromMap(map: MapSimple) {
    if (this.options.classPointer)
      map.getCanvas().classList.remove(this.options.classPointer);

    try {
      // Re-enable map interactions based on original state
      if (this._originalHandlers.scrollZoom !== false) map.scrollZoom.enable();
      if (this._originalHandlers.dragRotate !== false) map.dragRotate.enable();
      if (this._originalHandlers.touchZoomRotate !== false)
        map.touchZoomRotate.enable();
      if (this._originalHandlers.doubleClickZoom !== false)
        map.doubleClickZoom.enable();
      if (this._originalHandlers.dragPan !== false) map.dragPan.enable();
      if (this._originalHandlers.boxZoom !== false) map.boxZoom.enable();
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

export function startBoxRangerMap(
  canvas: HTMLCanvasElement,
  cb_bbox: EventBboxRangerHandle | undefined,
): MapRangerHandle {
  let start: Coordinates;
  let current: Coordinates;
  let box: HTMLDivElement | undefined;

  // Return the xy coordinates of the mouse position
  function mousePos(e: any): Coordinates {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - canvas.clientLeft,
      y: e.clientY - rect.top - canvas.clientTop,
    };
  }

  function mouseDown(e: any) {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    start = mousePos(e);

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
  }

  function onMouseMove(e: any) {
    e.preventDefault();
    e.stopPropagation();

    current = mousePos(e);

    if (!box) {
      box = document.createElement('div');
      box.classList.add('boxdraw');
      canvas.appendChild(box);
    }

    const minX = Math.min(start.x, current.x),
      maxX = Math.max(start.x, current.x),
      minY = Math.min(start.y, current.y),
      maxY = Math.max(start.y, current.y);

    box.style.transform = `translate(${minX}px, ${minY}px)`;
    box.style.width = maxX - minX + 'px';
    box.style.height = maxY - minY + 'px';
  }

  function onMouseUp(e: any) {
    e.preventDefault();
    e.stopPropagation();

    finish([start, mousePos(e)]);
  }

  function onKeyDown(e: any) {
    if (e.keyCode === 27) finish();
  }

  function finish(bbox?: [Coordinates, Coordinates]) {
    // Clean up event listeners
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);

    if (box) {
      if (box.parentNode) box.parentNode.removeChild(box);
      box = undefined;
    }

    if (bbox && cb_bbox) {
      cb_bbox(bbox);
    }
  }

  function destroy() {
    canvas.removeEventListener('mousedown', mouseDown, true);
    cb_bbox = undefined;
    finish();
  }

  // Add the initial mousedown listener
  canvas.addEventListener('mousedown', mouseDown, true);
  canvas.style.cursor = 'crosshair';

  return {
    destroy: destroy,
  };
}
