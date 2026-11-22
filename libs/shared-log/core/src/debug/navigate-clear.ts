import { clearLiveTraceEvents } from '../live-hook/trace-store';
import { clearDebugLogs, getLogDebugStore } from './store';

export function debugNavigationKey(): string {
  if (typeof location === 'undefined') return '';
  return `${location.pathname}\n${location.hash}`;
}

/** Clear logs + live traces when the path/hash changes and the option is on. */
export function applyDebugNavigation(nextKey: string): void {
  const bag = getLogDebugStore();
  if (bag.navKey === nextKey) return;
  bag.navKey = nextKey;
  if (bag.clearOnNavigate === false) return;
  clearDebugLogs();
  clearLiveTraceEvents();
}

export function installNavigateLogClear(): () => void {
  if (typeof window === 'undefined' || typeof history === 'undefined') {
    return () => undefined;
  }
  const bag = getLogDebugStore();
  bag.navKey = debugNavigationKey();

  const onChange = () => applyDebugNavigation(debugNavigationKey());

  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);

  const originalPush = history.pushState.bind(history);
  const originalReplace = history.replaceState.bind(history);
  history.pushState = ((...args: Parameters<History['pushState']>) => {
    originalPush(...args);
    onChange();
  }) as History['pushState'];
  history.replaceState = ((...args: Parameters<History['replaceState']>) => {
    originalReplace(...args);
    onChange();
  }) as History['replaceState'];

  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
    history.pushState = originalPush;
    history.replaceState = originalReplace;
  };
}
