import type { LogRecord } from '@hungpvq/shared-log';
import {
  formatLogTime,
  objectArgs,
  stringifyLogRecord,
  textMessage,
} from '@hungpvq/map-debug';
import { MapCopyButton } from '@hungpvq/react-map-core';
import type { ReactNode } from 'react';
import { TreeItem } from './TreeItem';

function DetailRow({
  label,
  children,
  copyValue,
}: {
  label: string;
  children: ReactNode;
  copyValue?: string;
}) {
  return (
    <div className="log-viewer__detail-row">
      <span className="log-viewer__detail-label">{label}</span>
      <div className="log-viewer__detail-value">{children}</div>
      {copyValue ? (
        <div className="log-viewer__detail-copy">
          <MapCopyButton title={`Copy ${label}`} value={copyValue} />
        </div>
      ) : null}
    </div>
  );
}

export function LogDetailPanel({
  log,
  showClose,
  onClose,
}: {
  log: LogRecord | null;
  showClose?: boolean;
  onClose?: () => void;
}) {
  if (!log) {
    return (
      <aside className="log-viewer__detail" aria-label="Log details">
        <div className="log-viewer__detail-empty">Select a log to inspect</div>
      </aside>
    );
  }

  const title = textMessage(log) || log.header.fn || log.header.span || 'Log';
  const objects = objectArgs(log);

  return (
    <aside className="log-viewer__detail" aria-label="Log details">
      <div className="log-viewer__detail-h">
        <strong>{title}</strong>
        <div className="log-viewer__detail-h-actions">
          <MapCopyButton
            title="Copy log JSON"
            value={stringifyLogRecord(log)}
          />
          {showClose ? (
            <button
              type="button"
              className="log-viewer__detail-close"
              title="Close"
              onClick={onClose}
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <DetailRow label="Time">{formatLogTime(log.header.ts)}</DetailRow>
      {log.header.index != null ? (
        <DetailRow label="#">{log.header.index}</DetailRow>
      ) : null}
      {log.header.level ? (
        <DetailRow label="Level">{log.header.level.toUpperCase()}</DetailRow>
      ) : null}
      {textMessage(log) ? (
        <DetailRow label="Message">{textMessage(log)}</DetailRow>
      ) : null}
      {log.header.namespaces[0] ? (
        <DetailRow label="Namespace" copyValue={log.header.namespaces[0]}>
          <code className="log-viewer__mono">{log.header.namespaces[0]}</code>
        </DetailRow>
      ) : null}
      {log.header.actionId ? (
        <DetailRow label="actionId" copyValue={log.header.actionId}>
          <code className="log-viewer__mono">{log.header.actionId}</code>
        </DetailRow>
      ) : null}
      {log.header.spanId ? (
        <DetailRow label="spanId" copyValue={log.header.spanId}>
          <code className="log-viewer__mono">{log.header.spanId}</code>
        </DetailRow>
      ) : null}
      {log.header.parentSpanId ? (
        <DetailRow label="parentSpanId" copyValue={log.header.parentSpanId}>
          <code className="log-viewer__mono">{log.header.parentSpanId}</code>
        </DetailRow>
      ) : null}
      {log.header.requestId ? (
        <DetailRow label="requestId (HTTP)" copyValue={log.header.requestId}>
          <code className="log-viewer__mono">{log.header.requestId}</code>
        </DetailRow>
      ) : null}
      {log.header.durationMs != null ? (
        <DetailRow label="durationMs">{log.header.durationMs}</DetailRow>
      ) : null}
      {log.header.outcome ? (
        <DetailRow label="outcome">{log.header.outcome}</DetailRow>
      ) : null}
      {log.header.control ? (
        <DetailRow label="Control">
          <code className="log-viewer__mono">{log.header.control}</code>
        </DetailRow>
      ) : null}
      {log.header.menuName || log.header.menuId ? (
        <DetailRow label="Menu">
          {log.header.menuName || null}
          {log.header.menuId ? (
            <code className="log-viewer__mono">{log.header.menuId}</code>
          ) : null}
        </DetailRow>
      ) : null}
      {log.header.datasetId ? (
        <DetailRow label="Dataset">
          <code className="log-viewer__mono">{log.header.datasetId}</code>
        </DetailRow>
      ) : null}
      {log.header.span ? (
        <DetailRow label="Span">{log.header.span}</DetailRow>
      ) : null}
      {log.header.fn ? <DetailRow label="fn">{log.header.fn}</DetailRow> : null}
      {log.header.flowKind ? (
        <DetailRow label="flow">
          {log.header.flowKind}
          {log.header.eventName ? ` · ${log.header.eventName}` : null}
        </DetailRow>
      ) : null}
      {log.header.mapId ? (
        <DetailRow label="mapId">
          <code className="log-viewer__mono">{log.header.mapId}</code>
        </DetailRow>
      ) : null}
      {objects.length > 0 ? (
        <div className="log-viewer__detail-args">
          <div className="log-viewer__detail-args-h">Args</div>
          {objects.map((arg, index) => (
            <div key={index} className="log-viewer__detail-arg">
              <TreeItem data={arg} />
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
