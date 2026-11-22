import {
  formatDebugLogEntryForCopy,
  formatLogTime,
  logActionId,
  shortActionId,
  textMessage,
  type DebugRecord,
} from '@hungpvq/shared-log';
import { BaseButton, CopyButton } from '@hungpvq/react-ui-core';
import type { KeyboardEvent, MouseEvent } from 'react';

export function LogRenderNode({
  log,
  selectedId,
  onNamespaceClick,
  onActionIdClick,
  onFlowClick,
  onSelect,
}: {
  log: DebugRecord;
  selectedId?: string | null;
  onNamespaceClick: (namespace: string) => void;
  onActionIdClick: (actionId: string) => void;
  onFlowClick: (actionId: string) => void;
  onSelect: (log: DebugRecord) => void;
}) {
  const isSelected = selectedId === log.id;
  const actionId = logActionId(log);
  const message = textMessage(log);
  const ns = log.header.namespaces[0];

  function onRowClick(event: MouseEvent<HTMLDivElement>) {
    const t = event.target as HTMLElement | null;
    if (t?.closest('button, a, input, .log-entry__actions')) return;
    onSelect(log);
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') onSelect(log);
  }

  return (
    <div
      className={`log-entry log-entry--${log.header.level ?? 'info'}${
        isSelected ? ' log-entry--selected' : ''
      }`}
      role="button"
      tabIndex={0}
      onClick={onRowClick}
      onKeyDown={onKey}
    >
      <div className="log-entry__main">
        <span className="log-entry__time">{formatLogTime(log.header.ts)}</span>
        <div className="log-entry__row">
          <div className="log-entry__content">
            {message ? <span className="log-entry__msg">{message}</span> : null}
          </div>
          <div className="log-entry__actions">
            {actionId ? (
              <BaseButton
                className="log-entry__flow"
                title="Open action flow"
                onClick={() => onFlowClick(actionId)}
              >
                Flow
              </BaseButton>
            ) : null}
            <CopyButton
              className="log-entry__copy"
              title="Copy log"
              value={formatDebugLogEntryForCopy(log)}
            />
          </div>
        </div>
        <span
          className="log-entry__level"
          title={(log.header.level || 'unknown').toUpperCase()}
        >
          {(log.header.level || '?').toUpperCase()}
        </span>
        {ns || actionId ? (
          <div className="log-entry__meta">
            {ns ? (
              <BaseButton
                className="log-entry__meta-cell log-entry__ns"
                title={ns}
                onClick={() => onNamespaceClick(ns)}
              >
                {ns}
              </BaseButton>
            ) : null}
            {actionId ? (
              <BaseButton
                className="log-entry__meta-cell log-entry__req"
                title={actionId}
                onClick={() => onActionIdClick(actionId)}
              >
                action={shortActionId(actionId)}
              </BaseButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
