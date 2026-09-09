import { errorHandler, type MapError } from '@hungpvq/map-core';
import { useEffect, useState } from 'react';
import './MapErrorToast.css';

const OPEN_DEVTOOLS_ERRORS_EVENT = 'hungpvq:map-open-devtools-errors';

/** @experimental Lightweight toast for map errors; Open errors dispatches a CustomEvent. */
export function MapErrorToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = errorHandler.onError((error: MapError) => {
      setMessage(error.message || error.code || 'Map error');
      setVisible(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setVisible(false), 8000);
    });
    return () => {
      unsubscribe();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!visible || !message) return null;

  function dismiss() {
    setVisible(false);
  }

  function openErrors() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OPEN_DEVTOOLS_ERRORS_EVENT));
    }
    dismiss();
  }

  return (
    <div className="map-error-toast" role="status" aria-live="polite">
      <span className="map-error-toast__message">{message}</span>
      <button
        type="button"
        className="map-error-toast__action"
        onClick={openErrors}
      >
        Open errors
      </button>
      <button
        type="button"
        className="map-error-toast__dismiss"
        aria-label="Dismiss"
        onClick={dismiss}
      >
        ×
      </button>
    </div>
  );
}
