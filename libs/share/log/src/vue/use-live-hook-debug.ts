import {
  getCurrentInstance,
  onMounted,
  onUnmounted,
  onUpdated,
} from 'vue';

import { loggerFactory } from '../core';
import {
  getInstanceId,
  registerInstance,
  unregisterInstance,
} from '../core/instance-registry';
import { traceLiveEvent } from '../live-hook/trace-store';

function getComponentName(instance: any): string {
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
 */
export function useLiveHookDebug(name?: string): void {
  const instance = getCurrentInstance();

  if (!instance) {
    logger
      .with({ fn: 'useLiveHookDebug', span: 'live-hook' })
      .warn('useLiveHookDebug() must be called inside setup()');
    return;
  }

  const component = name || getComponentName(instance);
  const parent = instance.parent;
  const parentName = parent ? getComponentName(parent) : undefined;
  const parentId = parent ? getInstanceId(parent) : undefined;

  const metadata = registerInstance(instance, {
    framework: 'vue',
    component,
    parentId,
    parent: parentName,
  });

  let renderCount = 0;

  function emit(
    event: 'component:mount' | 'component:render' | 'component:update' | 'component:unmount',
  ) {
    traceLiveEvent({
      framework: 'vue',
      event,
      instanceId: metadata.id,
      component: metadata.component,
      parentId: metadata.parentId,
      parent: metadata.parent,
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
}
