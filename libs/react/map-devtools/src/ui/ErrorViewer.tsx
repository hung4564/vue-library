import {
  errorMapId,
  filterErrorsByMapId,
  formatDevtoolErrorForCopy,
  formatErrorTime,
} from '@hungpvq/map-debug';
import { MapControlButton, MapCopyButton } from '@hungpvq/react-map-core';
import { useMemo } from 'react';
import { clearDevtoolErrors } from '../store';
import { useDevtoolState } from '../useDevtoolState';

export function ErrorViewer() {
  const { errors, filterMapId } = useDevtoolState();

  const filteredErrors = useMemo(
    () => filterErrorsByMapId(errors, filterMapId),
    [errors, filterMapId],
  );

  return (
    <div className="error-viewer">
      <div className="error-viewer__toolbar">
        <span className="error-viewer__count">
          Errors {filteredErrors.length}
        </span>
        <div className="error-viewer__actions">
          <MapControlButton
            variant="text"
            size="small"
            onClick={clearDevtoolErrors}
          >
            Clear
          </MapControlButton>
        </div>
      </div>
      <div className="error-viewer__body">
        {filteredErrors.map((error, index) => (
          <div
            key={`${error.timestamp}-${index}`}
            className={`error-viewer__item error-viewer__item--${error.recoverable ? 'recoverable' : 'fatal'}`}
          >
            <div className="error-viewer__item-header">
              <span className="error-viewer__code">{error.code}</span>
              <span className="error-viewer__time">
                {formatErrorTime(error.timestamp)}
              </span>
            </div>
            <div className="error-viewer__message">{error.message}</div>
            {errorMapId(error) ? (
              <div className="error-viewer__mapid">
                mapId: {errorMapId(error)}
              </div>
            ) : null}
            <div className="error-viewer__actions">
              <MapCopyButton
                title="Copy stack"
                value={formatDevtoolErrorForCopy(error)}
              />
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
