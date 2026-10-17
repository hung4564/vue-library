export type Framework = 'vue' | 'react';

export type LiveEventType =
  | 'component:mount'
  | 'component:render'
  | 'component:update'
  | 'component:unmount'
  | 'render:triggered'
  | 'action:start'
  | 'action:end'
  | 'state:change';

export type ChangeSource =
  | 'props'
  | 'state'
  | 'context'
  | 'reactive'
  | 'store'
  | 'parent'
  | 'external'
  | 'unknown';

export type CauseConfidence = 'direct' | 'inferred' | 'correlated' | 'unknown';

export interface TraceContext {
  actionId?: string;
  causeId?: string;
}

export interface LiveChange {
  source: ChangeSource;
  key?: string;
  previousValue?: unknown;
  nextValue?: unknown;
}

export interface LiveCause {
  type: ChangeSource | 'action' | 'parent-render';
  sourceInstanceId?: string;
  sourceComponent?: string;
  actionId?: string;
  causeId?: string;
  confidence: CauseConfidence;
  description?: string;
}

export interface LiveTraceEvent {
  id: string;
  ts: number;
  framework: Framework;
  event: LiveEventType;

  instanceId: string;
  component: string;
  parentId?: string;
  parent?: string;

  renderCount?: number;
  changes?: LiveChange[];
  cause?: LiveCause;

  actionId?: string;
  causeId?: string;

  trigger?: {
    type: string;
    key?: string;
    targetType?: string;
  };
}

export interface TraceInput {
  framework: Framework;
  event: LiveEventType;

  instanceId: string;
  component: string;
  parentId?: string;
  parent?: string;

  context?: TraceContext;
  renderCount?: number;
  changes?: LiveChange[];
  cause?: LiveCause;
  trigger?: LiveTraceEvent['trigger'];
}
