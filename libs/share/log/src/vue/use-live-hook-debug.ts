import {
  getCurrentInstance,
  onBeforeUpdate,
  onMounted,
  onRenderTriggered,
  onUnmounted,
  onUpdated,
} from 'vue';

import {
  getInstanceId,
  registerInstance,
  unregisterInstance,
} from '../live-hook/instance-registry';

import { traceLiveEvent } from '../live-hook/trace-store';

import type { LiveTraceEvent } from '../live-hook/types';

type EventDetails = Pick<LiveTraceEvent, 'trigger' | 'changes' | 'cause'>;

type PropsSnapshot = Record<string, unknown>;

function getComponentName(instance: any): string {
  const type = instance?.type;

  if (!type) {
    return 'AnonymousComponent';
  }

  if (type.name) {
    return type.name;
  }

  if (type.__name) {
    return type.__name;
  }

  if (type.__file) {
    const filename = String(type.__file).split('/').pop();

    if (filename) {
      return filename.replace(/\.\w+$/, '');
    }
  }

  return 'AnonymousComponent';
}

function createPropsSnapshot(props: Record<string, unknown>): PropsSnapshot {
  return { ...props };
}

function diffProps(
  previous: PropsSnapshot,
  current: PropsSnapshot,
): NonNullable<LiveTraceEvent['changes']> {
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  const changes: NonNullable<LiveTraceEvent['changes']> = [];

  for (const key of keys) {
    const previousValue = previous[key];
    const nextValue = current[key];

    if (Object.is(previousValue, nextValue)) {
      continue;
    }

    changes.push({
      source: 'props',
      key,
      previousValue,
      nextValue,
    });
  }

  return changes;
}

/**
 * Theo dõi lifecycle, reactive trigger và props của Vue component.
 *
 * Phải gọi bên trong setup() hoặc <script setup>.
 *
 * @param name Tên component tùy chỉnh, nếu không truyền sẽ tự nhận diện.
 */
export function useLiveHookDebug(name?: string): void {
  const instance = getCurrentInstance();

  if (!instance) {
    console.warn(
      '[LiveTrace][Vue] useLiveHookDebug() must be called inside setup()',
    );
    return;
  }

  const component = name || getComponentName(instance);
  const parent = instance.parent;

  const parentName = parent ? getComponentName(parent) : undefined;

  // Parent phải được đăng ký trước thì mới có parentId.
  const parentId = parent ? getInstanceId(parent) : undefined;

  const metadata = registerInstance(instance, {
    framework: 'vue',
    component,
    parentId,
    parent: parentName,
  });

  const instanceId = metadata.id;

  let renderCount = 0;

  let previousProps = createPropsSnapshot(instance.props as PropsSnapshot);

  let pendingChanges: NonNullable<LiveTraceEvent['changes']> = [];

  function emit(
    event: LiveTraceEvent['event'],
    extra: EventDetails = {},
  ): void {
    traceLiveEvent({
      framework: 'vue',
      event,
      instanceId,
      component,
      parentId,
      parent: parentName,
      renderCount,
      ...extra,
    });
  }

  // Component đã mount và DOM lần đầu đã được tạo.
  onMounted(() => {
    renderCount += 1;

    emit('component:mount');
  });

  // Ghi nhận reactive dependency mà Vue debug hook quan sát được.
  // Hook này chủ yếu hữu ích trong development.
  onRenderTriggered((debugEvent) => {
    emit('render:triggered', {
      trigger: {
        type: String(debugEvent.type),
        key: debugEvent.key == null ? undefined : String(debugEvent.key),
        targetType: Object.prototype.toString.call(debugEvent.target),
      },
    });
  });

  // Chụp props mới trước khi Vue cập nhật DOM.
  onBeforeUpdate(() => {
    const currentProps = createPropsSnapshot(instance.props as PropsSnapshot);

    pendingChanges = diffProps(previousProps, currentProps);

    previousProps = currentProps;
  });

  // DOM đã được cập nhật.
  onUpdated(() => {
    renderCount += 1;

    emit('component:update', {
      changes: pendingChanges.length > 0 ? pendingChanges : undefined,
    });

    pendingChanges = [];
  });

  // Phát event trước khi xóa metadata của instance.
  onUnmounted(() => {
    emit('component:unmount');

    unregisterInstance(instance);
  });
}
