import { getRegisteredInstances } from '../core/instance-registry';
import { traceLiveEvent } from './trace-store';

export type LiveActionEvent = {
  action: string;
  previousValue?: unknown;
  nextValue?: unknown;
};

export type LiveActionLogger = (
  event: LiveActionEvent,
  run: () => void,
) => void;

/**
 * Wrap a show/open/close (or similar) mutation so the Live tab records it.
 * Looks up the latest registered instance for `component` when present.
 */
export function trackLiveEventAction(component: string): LiveActionLogger {
  return (event, run) => {
    const matches = getRegisteredInstances().filter(
      (row) => row.component === component,
    );
    const meta = matches[matches.length - 1];

    traceLiveEvent({
      framework: meta?.framework ?? 'vue',
      event: 'component:update',
      instanceId: meta?.id ?? `action:${component}`,
      component,
      parentId: meta?.parentId,
      parent: meta?.parent,
      cause: event.action,
      trigger: event.action,
      changes: [
        {
          source: 'props',
          key: 'show',
          previousValue: event.previousValue,
          nextValue: event.nextValue,
        },
      ],
    });

    run();
  };
}
