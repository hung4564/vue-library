import {
  captureDragOrigin,
  registerDragItemOrigin,
  type DragItemOrigin,
} from '@hungpvq/draggable';

export function recordDragItemOrigin(
  containerId: string,
  id: string,
  hook: string,
  stack?: string,
): DragItemOrigin {
  const origin = captureDragOrigin({
    hook,
    stack: stack ?? new Error().stack,
  });
  try {
    registerDragItemOrigin(containerId, id, origin);
  } catch {
    // Debug metadata must never break item registration.
  }
  return origin;
}
