import type { Emitter } from 'mitt';
import type { BaseMapItem, MittTypeBaseMap } from './types';
import { MittTypeBaseMapEventKey } from './types';

export type BasemapMirrorHandlers = {
  onBaseMaps: (items: BaseMapItem[]) => void;
  onCurrent: (item: BaseMapItem | undefined) => void;
  onOpacity?: (opacity: number) => void;
};

/** Subscribe to basemap list/current mitt events; returns an unsubscribe function. */
export function subscribeBasemapMirror(
  emitter: Emitter<MittTypeBaseMap>,
  handlers: BasemapMirrorHandlers,
): () => void {
  emitter.on(MittTypeBaseMapEventKey.set, handlers.onBaseMaps);
  emitter.on(MittTypeBaseMapEventKey.setCurrent, handlers.onCurrent);
  if (handlers.onOpacity) {
    emitter.on(MittTypeBaseMapEventKey.setOpacity, handlers.onOpacity);
  }
  return () => {
    emitter.off(MittTypeBaseMapEventKey.set, handlers.onBaseMaps);
    emitter.off(MittTypeBaseMapEventKey.setCurrent, handlers.onCurrent);
    if (handlers.onOpacity) {
      emitter.off(MittTypeBaseMapEventKey.setOpacity, handlers.onOpacity);
    }
  };
}
