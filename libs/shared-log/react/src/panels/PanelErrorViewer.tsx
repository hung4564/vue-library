import {
  clearDebugErrors,
  errorContextId,
  formatDebugErrorForCopy,
  formatErrorTime,
} from '@hungpvq/shared-log';

import { BaseButton, CopyButton } from '@hungpvq/react-ui-core';
import { DevtoolPanelContainer } from '../ui/DevtoolPanelContainer';
import { DevtoolPanelToolbar } from '../ui/DevtoolPanelToolbar';
import { useDebugHost } from '../use-debug-host';

export function PanelErrorViewer() {
  const { errors } = useDebugHost();
  return (
    <DevtoolPanelContainer
      title={
        <DevtoolPanelToolbar
          title={`${errors.length} Errors`}
          actions={<BaseButton onClick={clearDebugErrors}>Clear</BaseButton>}
        />
      }
    >
      {errors.map((error, index) => (
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
          {errorContextId(error) ? (
            <div className="error-viewer__mapid">
              mapId: {errorContextId(error)}
            </div>
          ) : null}
          <div className="error-viewer__actions">
            <CopyButton
              title="Copy stack"
              value={formatDebugErrorForCopy(error)}
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
      {errors.length === 0 ? (
        <div className="error-viewer__empty">No errors logged</div>
      ) : null}
    </DevtoolPanelContainer>
  );
}

export { PanelErrorViewer as ErrorViewer };
