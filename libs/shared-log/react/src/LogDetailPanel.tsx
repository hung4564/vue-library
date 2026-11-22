import {
  debugHeaderRows,
  stringifyDebugRecord,
  textMessage,
  type DebugRecord,
} from '@hungpvq/shared-log';
import { BaseButton, CopyButton, TreeItem } from '@hungpvq/react-ui-core';


export function LogDetailPanel({
  log,
  showClose,
  onClose,
}: {
  log: DebugRecord | null;
  showClose?: boolean;
  onClose?: () => void;
}) {
  const title = log
    ? textMessage(log) || log.header.fn || log.header.span || 'Record'
    : 'Detail';
  const json = log ? stringifyDebugRecord(log) : '';
  const rows = log ? debugHeaderRows(log) : [];
  return (
    <aside
      className="log-viewer__detail"
      aria-label="Record details"
    >
      {log ? (
        <>
          <div className="log-viewer__detail-h">
            <strong>{title}</strong>
            <div className="log-viewer__detail-h-actions">
              <CopyButton
                title="Copy JSON"
                value={json}
              />
              {showClose ? (
                <BaseButton
                  className="log-viewer__detail-close"
                  title="Close"
                  onClick={onClose}
                >
                  ✕
                </BaseButton>
              ) : null}
            </div>
          </div>
          {rows.map((row) => (
            <div
              key={row.key}
              className="log-viewer__detail-row"
            >
              <span className="log-viewer__detail-label">{row.key}</span>
              <div className="log-viewer__detail-value">
                <code className="log-viewer__mono">{row.value}</code>
              </div>
            </div>
          ))}
          <div className="log-viewer__detail-args">
            <div className="log-viewer__detail-args-h">data</div>
            <div className="log-viewer__detail-arg">
              <TreeItem data={log.data} />
            </div>
          </div>
        </>
      ) : (
        <div className="log-viewer__detail-empty">
          Select a record to inspect
        </div>
      )}
    </aside>
  );
}
