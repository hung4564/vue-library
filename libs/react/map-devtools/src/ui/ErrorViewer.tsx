import { clearDevtoolErrors } from '../store';
import { useDevtoolState } from '../useDevtoolState';
import { useMemo, useState } from 'react';

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

export function ErrorViewer() {
  const { errors } = useDevtoolState();
  const [mapIdFilter, setMapIdFilter] = useState('');
  const filteredErrors = useMemo(() => {
    const q = mapIdFilter.trim().toLowerCase();
    if (!q) return errors;
    return errors.filter((error) => {
      const mapId = String(
        ((error.context as { mapId?: string } | undefined)?.mapId ?? ''),
      ).toLowerCase();
      return (
        mapId.includes(q) ||
        error.message.toLowerCase().includes(q) ||
        String(error.code ?? '')
          .toLowerCase()
          .includes(q)
      );
    });
  }, [errors, mapIdFilter]);

  return (
    <div className="error-viewer">
      <div className="error-viewer__header">
        <h3>Errors ({filteredErrors.length})</h3>
        <div className="error-viewer__header-actions">
          <input
            type="search"
            className="error-viewer__filter"
            placeholder="Filter mapId"
            aria-label="Filter by mapId"
            value={mapIdFilter}
            onChange={(e) => setMapIdFilter(e.target.value)}
          />
          <button
            type="button"
            className="error-viewer__clear"
            onClick={clearDevtoolErrors}
          >
            Clear
          </button>
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
            {error.context && (error.context as { mapId?: string }).mapId ? (
              <div className="error-viewer__mapid">
                mapId: {(error.context as { mapId?: string }).mapId}
              </div>
            ) : null}
            <div className="error-viewer__actions">
              <button
                type="button"
                className="error-viewer__copy"
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
              </button>
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
