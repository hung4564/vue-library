import {
  captureDragOrigin,
  isInternalDragOriginName,
  registerDragItemOrigin,
  type DragItemOrigin,
} from '@hungpvq/draggable';
import { getCurrentInstance, type ComponentInternalInstance } from 'vue';

const SKIP_NAME =
  /WithMobileHandle|DraggableItem|DraggableContainer|Anonymous|AsyncComponentWrapper|ModuleContainer|KeepAlive|BaseTransition|Teleport/;

function instanceName(
  inst: ComponentInternalInstance | null | undefined,
): string | undefined {
  if (!inst) return undefined;
  const type = inst.type as { name?: string; __name?: string };
  const name = type?.name || type?.__name;
  if (!name || isInternalDragOriginName(name) || SKIP_NAME.test(name)) {
    return undefined;
  }
  return name;
}

export function resolveVueDragComponentName(): string | undefined {
  let inst = getCurrentInstance();
  for (let i = 0; i < 16 && inst; i++) {
    const name = instanceName(inst);
    if (name) return name;
    inst = inst.parent;
  }
  return undefined;
}

export function recordDragItemOrigin(
  containerId: string,
  id: string,
  hook: string,
): DragItemOrigin {
  let component: string | undefined;
  try {
    component = resolveVueDragComponentName();
  } catch {
    component = undefined;
  }
  const origin = captureDragOrigin({ hook, component });
  try {
    registerDragItemOrigin(containerId, id, origin);
  } catch {
    // Debug metadata must never break item registration.
  }
  return origin;
}
