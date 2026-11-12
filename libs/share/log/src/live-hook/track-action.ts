import {
  getInstanceMetadata,
  getRegisteredInstances,
} from '../core/instance-registry';
import { emitLiveRecord } from './trace-store';

export type LiveActionLogger = (
  event: { action: string; previousValue?: unknown; nextValue?: unknown },
  run: () => void,
) => void;

function resolveInstance(component: string, instanceId?: string) {
  if (instanceId) return getInstanceMetadata(instanceId);
  const matches = getRegisteredInstances().filter(
    (row) => row.component === component,
  );
  return matches.length === 1 ? matches[0] : undefined;
}

/**
 * Wrap a show/open/close (or similar) mutation so the Live tab records it.
 * Prefer passing the id returned by `useLiveHookDebug`.
 */
export function trackLiveEventAction(
  component: string,
  instanceId?: string,
): LiveActionLogger {
  return (event, run) => {
    const meta = resolveInstance(component, instanceId);

    emitLiveRecord(
      {
        framework: meta?.framework ?? 'core',
        event: 'component:update',
        instanceId: meta?.id ?? instanceId ?? `action:${component}`,
        component,
        parentId: meta?.parentId,
        changes: [
          {
            source: 'props',
            key: event.action,
            previousValue: event.previousValue,
            nextValue: event.nextValue,
          },
        ],
      },
      { span: event.action },
    );

    run();
  };
}
