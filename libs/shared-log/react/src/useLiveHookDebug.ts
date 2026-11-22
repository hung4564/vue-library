import {
  emitLiveRecord,
  registerInstance,
  unregisterInstance,
  type LiveTraceChange,
  type LiveTraceEventName,
} from '@hungpvq/shared-log';
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

type PropsSnapshot = Record<string, unknown>;

export const LiveHookParentContext = createContext<string | undefined>(
  undefined,
);

export function LiveHookScope({
  id,
  children,
}: {
  id?: string;
  children?: ReactNode;
}) {
  return createElement(LiveHookParentContext.Provider, { value: id }, children);
}

function diffProps(
  previous: PropsSnapshot,
  current: PropsSnapshot,
): LiveTraceChange[] {
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);
  const changes: LiveTraceChange[] = [];
  for (const key of keys) {
    const previousValue = previous[key];
    const nextValue = current[key];
    if (Object.is(previousValue, nextValue)) continue;
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
 * Track committed renders, lifecycle, and optional props of a React component.
 * Register during render so children can read the parent id from context.
 */
export function useLiveHookDebug(
  name?: string,
  props?: Record<string, unknown>,
  enabled = true,
): string | undefined {
  const instanceToken = useRef<object>({});
  const renderCount = useRef(0);
  const previousProps = useRef<PropsSnapshot | null>(null);
  const parentId = useContext(LiveHookParentContext);
  const component = name || 'AnonymousComponent';

  renderCount.current += 1;

  const metadata = enabled
    ? registerInstance(instanceToken.current, {
        framework: 'react',
        component,
        parentId,
      })
    : undefined;

  useEffect(() => {
    if (!enabled || !metadata) return undefined;
    emitLiveRecord({
      framework: 'react',
      event: 'component:mount',
      instanceId: metadata.id,
      component: metadata.component,
      parentId: metadata.parentId,
      renderCount: renderCount.current,
    });
    emitLiveRecord({
      framework: 'react',
      event: 'component:render',
      instanceId: metadata.id,
      component: metadata.component,
      parentId: metadata.parentId,
      renderCount: renderCount.current,
    });
    return () => {
      emitLiveRecord({
        framework: 'react',
        event: 'component:unmount',
        instanceId: metadata.id,
        component: metadata.component,
        parentId: metadata.parentId,
        renderCount: renderCount.current,
      });
      previousProps.current = null;
      unregisterInstance(instanceToken.current);
    };
  }, [component, enabled, metadata]);

  useEffect(() => {
    if (!enabled || !metadata) return;
    const currentProps: PropsSnapshot = { ...(props ?? {}) };
    const previous = previousProps.current;
    if (previous === null) {
      previousProps.current = currentProps;
      return;
    }
    const changes = diffProps(previous, currentProps);
    previousProps.current = currentProps;
    const emit = (event: LiveTraceEventName, next?: LiveTraceChange[]) => {
      emitLiveRecord({
        framework: 'react',
        event,
        instanceId: metadata.id,
        component: metadata.component,
        parentId: metadata.parentId,
        renderCount: renderCount.current,
        changes: next,
      });
    };
    emit('component:render', changes.length > 0 ? changes : undefined);
    if (changes.length > 0) emit('component:update', changes);
  });

  return metadata?.id;
}
