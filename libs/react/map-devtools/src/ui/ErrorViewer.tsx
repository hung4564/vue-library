import { clearDevtoolErrors } from '../store';
import { useDevtoolState } from '../useDevtoolState';

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

export function ErrorViewer() {
  const { errors } = useDevtoolState();

  return (
    <div className="error-viewer">
      <div className="error-viewer__header">
        <h3>Errors ({errors.length})</h3>
        <button
          type="button"
          className="error-viewer__clear"
          onClick={clearDevtoolErrors}
        >
          Clear
        </button>
      </div>
      <div className="error-viewer__list">
        {errors.map((error, index) => (
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
        {errors.length === 0 ? (
          <div className="error-viewer__empty">No errors logged</div>
        ) : null}
      </div>
    </div>
  );
}
