import type { Framework } from '../core/types';

export type LiveTraceEventName =
  | 'component:mount'
  | 'component:render'
  | 'component:update'
  | 'component:unmount';

export type LiveTraceChange = {
  source: string;
  key: string;
  previousValue: unknown;
  nextValue: unknown;
};

export type LiveTraceEvent = {
  framework: Framework;
  event: LiveTraceEventName;
  instanceId: string;
  component: string;
  parentId?: string;
  parent?: string;
  renderCount?: number;
  changes?: LiveTraceChange[];
  cause?: string;
  trigger?: string;
  ts: number;
};
