import { MapControlButton } from '@hungpvq/react-map-core';
import { useEffect, useMemo, useState } from 'react';
import { clearDevtoolErrors } from '../store';
import { useDevtoolState } from '../useDevtoolState';

type DevtoolError = ReturnType<typeof useDevtoolState>['errors'][number];

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

function errorMapId(error: DevtoolError): string | null {
  const id = (error.context as { mapId?: string } | undefined)?.mapId;
  return id ? String(id) : null;
}

function shortMapId(id: string) {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

export function ErrorViewer() {
  const { errors } = useDevtoolState();
  const [selectedMapId, setSelectedMapId] = useState('all');

  const mapIds = useMemo(() => {
    const set = new Set<string>();
    for (const error of errors) {
      const id = errorMapId(error);
      if (id) set.add(id);
    }
    return [...set].sort();
  }, [errors]);

  useEffect(() => {
    if (selectedMapId !== 'all' && !mapIds.includes(selectedMapId)) {
      setSelectedMapId('all');
    }
  }, [mapIds, selectedMapId]);

  const filteredErrors = useMemo(() => {
    if (mapIds.length <= 1 || selectedMapId === 'all') return errors;
    return errors.filter((error) => errorMapId(error) === selectedMapId);
  }, [errors, mapIds.length, selectedMapId]);

  return (
    <div className="error-viewer">
      <div className="error-viewer__header">
        <h3>Errors ({filteredErrors.length})</h3>
        <div className="error-viewer__header-actions">
          {mapIds.length > 1 ? (
            <select
              className="error-viewer__mapid-select"
              aria-label="Filter by mapId"
              value={selectedMapId}
              onChange={(e) => setSelectedMapId(e.target.value)}
            >
              <option value="all">All maps</option>
              {mapIds.map((id) => (
                <option key={id} value={id}>
                  {shortMapId(id)}
                </option>
              ))}
            </select>
          ) : null}
          <MapControlButton
            variant="text"
            size="small"
            onClick={clearDevtoolErrors}
          >
            Clear
          </MapControlButton>
        </div>
      </div>
      <div className="error-viewer__list">
        {filteredErrors.map((error, index) => (
          <div
            key={`${error.timestamp}-${index}`}
            className={`error-viewer__item error-viewer__item--${error.recoverable ? 'recoverable' : 'fatal'}`}
          >
            <div className="error-viewer__item-header">
              <span className="error-viewer__code">{error.code}</span>
              <span className="error-viewer__time">
                {formatTime(error.timestamp)}
              </span>
            </div>
            <div className="error-viewer__message">{error.message}</div>
            {errorMapId(error) ? (
              <div className="error-viewer__mapid">
                mapId: {errorMapId(error)}
              </div>
            ) : null}
            <div className="error-viewer__actions">
              <MapControlButton
                variant="text"
                size="small"
                onClick={async () => {
                  const text = [
                    error.code,
                    error.message,
                    error.stack,
                    error.context ? JSON.stringify(error.context, null, 2) : '',
                  ]
                    .filter(Boolean)
                    .join('\n\n');
                  try {
                    await navigator.clipboard?.writeText(text);
                  } catch {
                    // ignore clipboard failure
                  }
                }}
              >
                Copy stack
              </MapControlButton>
            </div>
            {error.context ? (
              <details className="error-viewer__details">
                <summary>Context</summary>
                <pre>{JSON.stringify(error.context, null, 2)}</pre>
              </details>
            ) : null}
            {error.stack ? (
              <details className="error-viewer__details">
                <summary>Stack Trace</summary>
                <pre>{error.stack}</pre>
              </details>
            ) : null}
          </div>
        ))}
        {filteredErrors.length === 0 ? (
          <div className="error-viewer__empty">No errors logged</div>
        ) : null}
      </div>
    </div>
  );
}
