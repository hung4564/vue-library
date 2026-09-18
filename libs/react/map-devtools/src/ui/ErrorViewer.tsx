import {
  collectErrorMapIds,
  errorMapId,
  filterErrorsByMapId,
  formatDevtoolErrorForCopy,
  formatErrorTime,
  shortErrorMapId,
} from '@hungpvq/map-debug';
import { MapControlButton, MapCopyButton } from '@hungpvq/react-map-core';
import { InputSelect } from '@hungpvq/react-map-core/fields';
import { useEffect, useMemo, useState } from 'react';
import { clearDevtoolErrors } from '../store';
import { useDevtoolState } from '../useDevtoolState';

export function ErrorViewer() {
  const { errors } = useDevtoolState();
  const [selectedMapId, setSelectedMapId] = useState('all');

  const mapIds = useMemo(() => collectErrorMapIds(errors), [errors]);

  const mapFilterItems = useMemo(
    () => [
      { value: 'all', text: 'All maps' },
      ...mapIds.map((id) => ({ value: id, text: shortErrorMapId(id) })),
    ],
    [mapIds],
  );

  useEffect(() => {
    if (selectedMapId !== 'all' && !mapIds.includes(selectedMapId)) {
      setSelectedMapId('all');
    }
  }, [mapIds, selectedMapId]);

  const filteredErrors = useMemo(
    () => filterErrorsByMapId(errors, selectedMapId, mapIds.length),
    [errors, mapIds.length, selectedMapId],
  );

  return (
    <div className="error-viewer">
      <div className="error-viewer__toolbar">
        <span className="error-viewer__count">
          Errors {filteredErrors.length}
        </span>
        <div className="error-viewer__actions">
          {mapIds.length > 1 ? (
            <InputSelect
              aria-label="Filter by mapId"
              value={selectedMapId}
              items={mapFilterItems}
              onChange={(value) => setSelectedMapId(String(value))}
            />
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
