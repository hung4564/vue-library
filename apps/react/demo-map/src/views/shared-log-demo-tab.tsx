import { useLiveHookDebug } from '@hungpvq/react-shared-log';

export function SharedLogDemoTab() {
  useLiveHookDebug('SharedLogDemoTab');
  return (
    <div style={{ padding: 12, fontSize: 13 }}>
      Custom tab registered via <code>globalThis.__hungpvqDebug</code> (no{' '}
      <code>registerDebugTab</code> import). Live tab tracks this panel via{' '}
      <code>useLiveHookDebug</code>.
    </div>
  );
}
