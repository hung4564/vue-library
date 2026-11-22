import {
  emitLiveRecord,
  getInstanceId,
  loggerFactory,
  registerInstance,
  unregisterInstance,
  type LiveTraceEventName,
} from '@hungpvq/shared-log';
import { getCurrentInstance, onMounted, onUnmounted, onUpdated } from 'vue';

function getComponentName(instance: {
  type?: { name?: string; __name?: string; __file?: string };
}): string {
  const type = instance?.type;
  if (!type) return 'AnonymousComponent';
  if (type.name) return type.name;
  if (type.__name) return type.__name;
  if (type.__file) {
    const filename = String(type.__file).split('/').pop();
    if (filename) return filename.replace(/\.\w+$/, '');
  }
  return 'AnonymousComponent';
}

const logger = loggerFactory.createLogger().setNamespace('core:live-hook');

/**
 * Track Vue component lifecycle and register the instance for the Live tab.
 * Must be called inside setup() or <script setup>.
 * Returns the registered instance id (or undefined if called outside setup).
 */
export function useLiveHookDebug(
  name?: string,
  enabled = true,
): string | undefined {
  if (!enabled) return undefined;

  const instance = getCurrentInstance();

  if (!instance) {
    logger
      .with({ fn: 'useLiveHookDebug', span: 'live-hook' })
      .warn('useLiveHookDebug() must be called inside setup()');
    return undefined;
  }

  const component = name || getComponentName(instance);
  const parent = instance.parent;
  const parentId = parent ? getInstanceId(parent) : undefined;

  const metadata = registerInstance(instance, {
    framework: 'vue',
    component,
    parentId,
  });

  let renderCount = 0;

  function emit(event: LiveTraceEventName) {
    emitLiveRecord({
      framework: 'vue',
      event,
      instanceId: metadata.id,
      component: metadata.component,
      parentId: metadata.parentId,
      renderCount,
    });
  }

  onMounted(() => {
    renderCount += 1;
    emit('component:mount');
    emit('component:render');
  });

  onUpdated(() => {
    renderCount += 1;
    emit('component:render');
    emit('component:update');
  });

  onUnmounted(() => {
    emit('component:unmount');
    unregisterInstance(instance);
  });

  return metadata.id;
}
