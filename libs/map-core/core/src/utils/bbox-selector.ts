/**
 * Framework-agnostic bounding box selection utility
 * Provides functionality to draw and select bounding boxes on a canvas
 */

import type { Coordinates } from '../types';

/**
 * Handle returned by startBoxRangerMap for cleanup
 */
export type BoxRangerHandle = {
  destroy: () => void;
};

/**
 * Callback function type for bounding box selection
 */
export type BoxRangerCallback = (bbox?: [Coordinates, Coordinates]) => void;

/**
 * Creates a bounding box selector on a canvas element
 * Allows users to draw a selection box by dragging the mouse
 *
 * @param canvas - The HTML canvas element to attach the selector to
 * @param cb_bbox - Callback function called when a bounding box is selected
 * @returns Handle object with destroy method for cleanup
 */
export function startBoxRangerMap(
  canvas: HTMLCanvasElement,
  cb_bbox: BoxRangerCallback | undefined,
): BoxRangerHandle {
  let start: Coordinates;
  let current: Coordinates;
  let box: HTMLDivElement | undefined;

  // Return the xy coordinates of the mouse position
  function mousePos(e: MouseEvent | TouchEvent): Coordinates {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;
    return {
      x: clientX - rect.left - canvas.clientLeft,
      y: clientY - rect.top - canvas.clientTop,
    };
  }

  function mouseDown(e: MouseEvent | TouchEvent) {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    start = mousePos(e);

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
  }

  function onMouseMove(e: MouseEvent | TouchEvent) {
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

  function onMouseUp(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    e.stopPropagation();

    finish([start, mousePos(e)]);
  }

  function onKeyDown(e: KeyboardEvent) {
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
