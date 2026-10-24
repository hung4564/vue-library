import { useEffect, useRef } from 'react';

import {
  registerInstance,
  unregisterInstance,
} from '../core/instance-registry';
import { traceLiveEvent } from '../live-hook/trace-store';
import type { LiveTraceEvent } from '../live-hook/types';

type PropsSnapshot = Record<string, unknown>;

type EventDetails = Pick<LiveTraceEvent, 'changes' | 'cause' | 'trigger'>;

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
 * Theo dõi render đã commit, lifecycle và props của React component.
 *
 * Phải gọi bên trong function component.
 *
 * @param name Tên component để hiển thị trong log.
 * @param props Props hiện tại của component.
 */
export function useLiveHookDebug(
  name: string,
  props: Record<string, unknown>,
): void {
  // Token ổn định trong vòng đời component.
  const instanceToken = useRef<object>({});

  // Số lần function component được gọi để render.
  // Có thể tăng nhiều hơn số lần render đã commit.
  const renderCount = useRef(0);

  // Metadata được thiết lập sau khi React commit.
  const metadataRef = useRef<{
    id: string;
    component: string;
    parentId?: string;
    parent?: string;
  } | null>(null);

  const previousProps = useRef<PropsSnapshot | null>(null);

  const component = name || 'AnonymousComponent';

  renderCount.current += 1;

  function emit(
    event: LiveTraceEvent['event'],
    extra: EventDetails = {},
  ): void {
    const metadata = metadataRef.current;

    if (!metadata) {
      return;
    }

    traceLiveEvent({
      framework: 'react',
      event,
      instanceId: metadata.id,
      component: metadata.component,
      parentId: metadata.parentId,
      parent: metadata.parent,
      renderCount: renderCount.current,
      ...extra,
    });
  }

  // Đăng ký instance và quản lý vòng đời.
  useEffect(() => {
    const metadata = registerInstance(instanceToken.current, {
      framework: 'react',
      component,
    });

    metadataRef.current = metadata;

    emit('component:mount');

    return () => {
      emit('component:unmount');

      metadataRef.current = null;
      previousProps.current = null;

      unregisterInstance(instanceToken.current);
    };
  }, [component]);

  // Chạy sau mỗi commit để ghi nhận render và so sánh props.
  useEffect(() => {
    if (!metadataRef.current) {
      return;
    }

    const currentProps: PropsSnapshot = {
      ...props,
    };

    const previous = previousProps.current;

    if (previous === null) {
      // Lần commit đầu tiên: mount đã được ghi ở effect phía trên.
      previousProps.current = currentProps;

      emit('component:render');

      return;
    }

    const changes = diffProps(previous, currentProps);

    previousProps.current = currentProps;

    emit('component:render', {
      changes: changes.length > 0 ? changes : undefined,
    });

    if (changes.length > 0) {
      emit('component:update', {
        changes,
      });
    }
  });
}
