export function SharedLogDemoTab() {
  return (
    <div style={{ padding: 12, fontSize: 13 }}>
      Custom tab registered via <code>globalThis.__hungpvqDebug</code> (no{' '}
      <code>registerDebugTab</code> import).
    </div>
  );
}
